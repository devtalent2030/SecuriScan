import warnings
import logging
import sys
import os

# Suppress urllib3 SSL warnings
warnings.filterwarnings("ignore", category=UserWarning, module="urllib3")

# Add the backend directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "../"))
sys.path.append(backend_dir)

##################################################
# IMPORTANT: CORS IMPORT
##################################################
from flask_cors import CORS

from flask import Flask, jsonify, request
from utils.crawler import crawl_website
from utils.sql_injection import check_sql_injection
from utils.xss import check_xss
from utils.csrf import check_csrf
from utils.directory_enum import enumerate_directories
from utils.command_injection import check_command_injection
from utils.nosql_injection import check_nosql_injection
from utils.broken_access import check_broken_access
from utils.crypto_failures import check_crypto_failures
from utils.security_misconfig import check_security_misconfig
from utils.dependency_scanner import scan_website_js_libraries
from utils.auth_failures import check_authentication_failures
from utils.logging_monitor import check_logging_failures
from utils.ssrf import check_ssrf  
from utils.database import init_db, get_connection, store_crawled_links  # ADDED

app = Flask(__name__)

##################################################
# ENABLE CORS FOR ALL ROUTES
##################################################
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("securiscan.log"),
        logging.StreamHandler()
    ]
)

# In-memory scan history (This should NOT be removed)
SCAN_HISTORY = []

# Fixing database initialization in Flask 3.x
with app.app_context():
    init_db()
    logging.info("Database initialized.")

##################################################
# Root endpoint
##################################################
@app.route('/')
def home():
    return jsonify({"message": "Welcome to SecuriScan API!"})

##################################################
# Health check endpoint
##################################################
@app.route('/ping')
def ping():
    logging.info("Received health check request.")
    return jsonify({"status": "ok"}), 200

##################################################
# Crawling endpoint
##################################################
@app.route('/crawl', methods=['POST'])
def crawl_site():
    data = request.get_json()
    start_url = data.get('url')

    if not start_url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        crawled_urls = crawl_website(start_url)
        # CHANGED: Store these links in the database (deduplicated)
        store_crawled_links(start_url, crawled_urls)  # ADDED

        scan_result = {
            "action": "crawl",
            "url": start_url,
            "found_urls": crawled_urls
        }
        SCAN_HISTORY.append(scan_result)
        logging.info(f"Crawled {start_url}: {len(crawled_urls)} URLs found.")
        return jsonify(scan_result), 200
    except Exception as e:
        logging.error(f"Error crawling {start_url}: {e}")
        return jsonify({"error": str(e)}), 500

##################################################
# Endpoint to Trigger SQL Injection Check
##################################################
@app.route('/check_sql', methods=['POST'])
def check_sql():
    data = request.get_json()
    target_url = data.get('url')

    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    scan_results = check_sql_injection(target_url)  # Returns a dictionary

    result = {
        "action": "check_sql",
        "url": target_url,
        "sql_vulnerabilities": scan_results.get("vulnerable_params", []),  # Extract the correct list
        "time_based_test": scan_results.get("time_based_test", {})
    }

    # Save only if "vulnerable" is true
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False

    for item in scan_results.get("vulnerable_params", []):  # Loop over the correct list
        if item.get("vulnerable"):  # Safely check if 'vulnerable' exists and is True
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "SQL Injection", item["payload"])
            )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(result)
    logging.info(f"SQL Injection scan completed for {target_url}")

    # If none are vulnerable, add info in the JSON response, but NOT DB
    if not found_any_vulnerable:
        result["note"] = "No SQL injection vulnerabilities found."

    return jsonify(result), 200


##################################################
# Endpoint for XSS Check
##################################################
@app.route('/check_xss', methods=['POST'])
def check_for_xss():
    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    xss_results = check_xss(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in xss_results["vulnerable_params"]:
        if res['vulnerable']:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "XSS", res['payload'])
            )
    if xss_results["time_based_test"] and xss_results["time_based_test"]["vulnerable"]:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "XSS (Time-Based)", xss_results["time_based_test"]["payload"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(xss_results)
    logging.info(f"XSS scan completed for {target_url}")
    if not found_any_vulnerable:
        xss_results["note"] = "No XSS vulnerabilities found."
    return jsonify(xss_results), 200

##################################################
# CSRF Detection Endpoint
##################################################
@app.route('/check_csrf', methods=['POST'])
def check_for_csrf():
    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    csrf_results = check_csrf(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in csrf_results.get("csrf_vulnerabilities", []):
        if isinstance(res, dict) and res.get("vulnerable"):
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "CSRF", res.get("evidence"))
            )
    if csrf_results.get("time_based_test", {}).get("vulnerable"):
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "CSRF (Time-Based)", csrf_results["time_based_test"]["payload"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(csrf_results)
    logging.info(f"CSRF scan completed for {target_url}")
    return jsonify(csrf_results), 200

##################################################
# Command Injection Endpoint
##################################################
@app.route('/check_cmd_injection', methods=['POST'])
def check_for_command_injection():
    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    cmd_results = check_command_injection(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in cmd_results["vulnerable_params"]:
        if res["vulnerable"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "Command Injection", res["payload"])
            )
    if cmd_results["time_based_test"] and cmd_results["time_based_test"]["vulnerable"]:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "Command Injection (Time-Based)", cmd_results["time_based_test"]["payload"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(cmd_results)
    logging.info(f"Command injection scan completed for {target_url}")
    if not found_any_vulnerable:
        cmd_results["note"] = "No command injection vulnerabilities found."
    return jsonify(cmd_results), 200

##################################################
# Directory Enumeration Endpoint
##################################################
@app.route('/check_dirs', methods=['POST'])
def check_directory_enum():
    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    dir_results = enumerate_directories(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in dir_results["vulnerable_directories"]:
        if res["vulnerable"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "Directory Enumeration", res["url"])
            )
    if dir_results["time_based_test"] and dir_results["time_based_test"]["vulnerable"]:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "Directory Enum (Time-Based)", dir_results["time_based_test"]["payload"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(dir_results)
    logging.info(f"Directory scan completed for {target_url}")
    return jsonify(dir_results), 200

##################################################
# NoSQL Injection Endpoint
##################################################
@app.route('/check_nosql', methods=['POST'])
def check_for_nosql_injection():
    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    nosql_results = check_nosql_injection(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in nosql_results["vulnerable_params"]:
        if res["vulnerable"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, f"NoSQL Injection ({res['method']})", res["payload"])
            )
    if nosql_results["time_based_test"] and nosql_results["time_based_test"]["vulnerable"]:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "NoSQL Injection (Time-Based)", nosql_results["time_based_test"]["payload"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(nosql_results)
    logging.info(f"NoSQL injection scan completed for {target_url}")
    if not found_any_vulnerable:
        nosql_results["note"] = "No NoSQL injection vulnerabilities found."
    return jsonify(nosql_results), 200

##################################################
# Broken Access Control Endpoint
##################################################
@app.route('/check_access_control', methods=['POST'])
def check_for_broken_access():
    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    access_results = check_broken_access(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in access_results["vulnerable_endpoints"]:
        if "Potential" in res["issue"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (res["url"], "Broken Access Control", res["issue"])
            )
    if access_results["time_based_test"] and access_results["time_based_test"]["vulnerable"]:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (access_results["time_based_test"]["url"], "Broken Access Control (Time-Based)", access_results["time_based_test"]["evidence"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(access_results)
    logging.info(f"Access Control scan completed for {target_url}")
    if not found_any_vulnerable:
        access_results["note"] = "No broken access vulnerabilities found."
    return jsonify(access_results), 200

##################################################
# Cryptographic Failures Endpoint
##################################################
@app.route('/check_crypto_failures', methods=['POST'])
def check_for_crypto_failures():
    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    crypto_results = check_crypto_failures(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for vuln in crypto_results["vulnerabilities"]:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "Cryptographic Failure", vuln["issue"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(crypto_results)
    logging.info(f"Cryptographic Failures scan completed for {target_url}")
    if not found_any_vulnerable:
        crypto_results["note"] = "No cryptographic vulnerabilities found."
    return jsonify(crypto_results), 200

##################################################
# Security Misconfiguration Endpoint
##################################################
@app.route('/check_security_misconfig', methods=['POST'])
def check_for_security_misconfig():
    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    misconfig_results = check_security_misconfig(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for vuln in misconfig_results["vulnerabilities"]:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "Security Misconfiguration", vuln["issue"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(misconfig_results)
    logging.info(f"Security Misconfiguration scan completed for {target_url}")
    if not found_any_vulnerable:
        misconfig_results["note"] = "No security misconfigurations found."
    return jsonify(misconfig_results), 200
##################################################
# Dependency Scanner Endpoint
##################################################
@app.route('/check_dependencies', methods=['POST', 'OPTIONS'])  # Added OPTIONS
def check_for_dependencies():
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }

    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    dep_results = scan_website_js_libraries(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for vuln in dep_results["vulnerabilities"]:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "Vulnerable Dependency", vuln["issue"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(dep_results)
    logging.info(f"Dependency scan completed for {target_url}")
    if not found_any_vulnerable and dep_results["dependencies"]:
        dep_results["note"] = "No vulnerable dependencies found."
    return jsonify(dep_results), 200

##################################################
# Authentication Failures Endpoint
##################################################
@app.route('/check_auth_failures', methods=['POST', 'OPTIONS'])
def check_for_auth_failures():
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }

    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    auth_results = check_authentication_failures(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for vuln in auth_results["vulnerabilities"]:
        if vuln["severity"] in ["Medium", "High", "Critical"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "Authentication Failure", vuln["issue"])
            )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(auth_results)
    logging.info(f"Authentication Failures scan completed for {target_url}")
    if not found_any_vulnerable:
        auth_results["note"] = "No significant authentication failures found."
    return jsonify(auth_results), 200

##################################################
# Logging & Monitoring Failures Endpoint
##################################################
@app.route('/check_logging_monitor', methods=['POST'])
def check_for_logging_monitor():
    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    logging_results = check_logging_failures(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for vuln in logging_results["vulnerabilities"]:
        if vuln["severity"] in ["Medium", "High"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "Logging Failure", vuln["evidence"])
            )
    if logging_results.get("time_based_test", {}).get("vulnerable"):
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "Logging Failure (Time-Based)", logging_results["time_based_test"]["evidence"])
        )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(logging_results)
    logging.info(f"Logging & Monitoring scan completed for {target_url}")
    return jsonify(logging_results), 200

##################################################
# SSRF Detection Endpoint
##################################################
@app.route('/check_ssrf', methods=['POST', 'OPTIONS'])
def check_for_ssrf():
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }

    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    ssrf_results = check_ssrf(target_url)
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for vuln in ssrf_results["vulnerabilities"]:
        if vuln["severity"] in ["Medium", "High", "Critical"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "SSRF", vuln["issue"])
            )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(ssrf_results)
    logging.info(f"SSRF scan completed for {target_url}")
    if not found_any_vulnerable:
        ssrf_results["note"] = "No significant SSRF vulnerabilities found."
    return jsonify(ssrf_results), 200

##################################################
# Retrieve Scan History Endpoint
##################################################
@app.route('/scan_history', methods=['GET'])
def get_scan_history():
    return jsonify({"history": SCAN_HISTORY}), 200

##################################################
# Run Flask Server
##################################################
if __name__ == '__main__':
    # Listen on 0.0.0.0 so the Next.js app can access it via localhost
    app.run(debug=True, host="0.0.0.0", port=5001)