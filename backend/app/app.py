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
@app.route('/check_sql_injection', methods=['POST'])
def check_sql():
    data = request.get_json()
    target_url = data.get('url')

    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    scan_results = check_sql_injection(target_url)
    result = {
        "action": "check_sql",
        "url": target_url,
        "sql_vulnerabilities": scan_results
    }

    # Save only if "vulnerable" is true
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in scan_results:
        if res['vulnerable']:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "SQL Injection", res['payload'])
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
    result = {
        "action": "check_xss",
        "url": target_url,
        "xss_vulnerabilities": xss_results
    }

    # Save only if "vulnerable" is true
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in xss_results:
        if res['vulnerable']:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "XSS", res['payload'])
            )
    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(result)
    logging.info(f"XSS scan completed for {target_url}")

    # If no XSS vulnerabilities, note it in the JSON response
    if not found_any_vulnerable:
        result["note"] = "No XSS vulnerabilities found."

    return jsonify(result), 200

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

    # Save only if CSRF vulnerabilities are found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    if isinstance(csrf_results.get("csrf_vulnerabilities"), list):
        for res in csrf_results["csrf_vulnerabilities"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "CSRF", res.get('issue', 'Unknown CSRF vulnerability'))
            )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(csrf_results)
    logging.info(f"CSRF scan completed for {target_url}")

    if not found_any_vulnerable:
        csrf_results["note"] = "No CSRF vulnerabilities found."

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

    # Store only if vulnerabilities are found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in cmd_results:
        if res["vulnerable"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "Command Injection", res["payload"])
            )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(cmd_results)
    logging.info(f"Command injection scan completed for {target_url}")

    result = {
        "action": "check_cmd_injection",
        "url": target_url,
        "cmd_vulnerabilities": cmd_results,
    }
    if not found_any_vulnerable:
        result["note"] = "No command injection vulnerabilities found."

    return jsonify(result), 200

##################################################
# Directory Enumeration Endpoint
##################################################
@app.route('/check_dirs', methods=['POST'])
def check_directories():
    data = request.get_json()
    target_url = data.get('url')

    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    dir_results = enumerate_directories(target_url)

    # Store only if directories were found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_directories = False
    if isinstance(dir_results.get("found_directories"), list):
        for res in dir_results["found_directories"]:
            found_any_directories = True
            cursor.execute(
                """
                INSERT INTO discovered_links (root_url, discovered_url)
                VALUES (%s, %s)
                """,
                (target_url, res["url"])
            )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(dir_results)
    logging.info(f"Directory enumeration scan completed for {target_url}")

    if not found_any_directories:
        dir_results["note"] = "No hidden directories found."

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

    # Store only if vulnerabilities are found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in nosql_results:
        if res["vulnerable"]:
            found_any_vulnerable = True
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "NoSQL Injection", res["payload"])
            )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(nosql_results)
    logging.info(f"NoSQL injection scan completed for {target_url}")

    result = {
        "action": "check_nosql",
        "url": target_url,
        "nosql_vulnerabilities": nosql_results,
    }
    if not found_any_vulnerable:
        result["note"] = "No NoSQL injection vulnerabilities found."

    return jsonify(result), 200

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

    # Store only if vulnerabilities are found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in access_results:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (res["url"], "Broken Access Control", res["issue"])
        )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(access_results)
    logging.info(f"Access Control scan completed for {target_url}")

    result = {
        "action": "check_access_control",
        "url": target_url,
        "access_vulnerabilities": access_results,
    }
    if not found_any_vulnerable:
        result["note"] = "No broken access vulnerabilities found."

    return jsonify(result), 200

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

    # Store only if vulnerabilities are found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in crypto_results:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "Cryptographic Failure", res["issue"])
        )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(crypto_results)
    logging.info(f"Crypto scan completed for {target_url}")

    result = {
        "action": "check_crypto_failures",
        "url": target_url,
        "crypto_vulnerabilities": crypto_results,
    }
    if not found_any_vulnerable:
        result["note"] = "No cryptographic vulnerabilities found."

    return jsonify(result), 200

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

    # Store only if vulnerabilities are found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in misconfig_results:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (target_url, "Security Misconfiguration", res["issue"])
        )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(misconfig_results)
    logging.info(f"Security misconfiguration scan completed for {target_url}")

    result = {
        "action": "check_security_misconfig",
        "url": target_url,
        "misconfig_vulnerabilities": misconfig_results,
    }
    if not found_any_vulnerable:
        result["note"] = "No security misconfigurations found."

    return jsonify(result), 200

##################################################
# Dependency Scanner Endpoint
##################################################
@app.route('/check_dependencies', methods=['POST'])
def check_for_vulnerable_dependencies():
    data = request.get_json()
    target_url = data.get('url')

    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    dep_results = scan_website_js_libraries(target_url)  # pass the user’s URL here

    # Store only if vulnerabilities are found
    found_any_vulnerable = False
    for item in dep_results:
        if item["vulnerable"] is True:
            found_any_vulnerable = True
            cursor = get_connection().cursor()
            cursor.execute(
                """
                INSERT INTO vulnerabilities (url, vulnerability_type, payload)
                VALUES (%s, %s, %s)
                """,
                (target_url, "Dependency Vulnerability", item["library"] + "-" + str(item["version"]))
            )
            get_connection().commit()
            cursor.close()

    # Optional: Save to SCAN_HISTORY if you want
    SCAN_HISTORY.append(dep_results)
    logging.info(f"Dependency scan completed for {target_url}")

    result = {
        "action": "check_dependencies",
        "dependency_vulnerabilities": dep_results,
    }
    if not found_any_vulnerable:
        result["note"] = "No vulnerable dependencies found."

    return jsonify(result), 200

##################################################
# Authentication Failures Endpoint
##################################################
@app.route('/check_auth_failures', methods=['POST'])
def check_for_auth_failures():
    data = request.get_json()
    target_url = data.get('url')

    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    auth_results = check_authentication_failures(target_url)

    # Store only if authentication failures are found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in auth_results:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (res["url"], "Authentication Failure", res["issue"])
        )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(auth_results)
    logging.info(f"Authentication failure scan completed for {target_url}")

    result = {
        "action": "check_auth_failures",
        "url": target_url,
        "auth_vulnerabilities": auth_results,
    }
    if not found_any_vulnerable:
        result["note"] = "No authentication failures found."

    return jsonify(result), 200

##################################################
# Logging & Monitoring Failures Endpoint
##################################################
@app.route('/check_logging_monitor', methods=['POST'])
def check_for_logging_monitor():
    data = request.get_json()
    target_url = data.get('url')

    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    log_results = check_logging_failures(target_url)

    # Store only if logging failures are found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in log_results:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (res["url"], "Logging & Monitoring Failure", res["issue"])
        )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(log_results)
    logging.info(f"Logging & Monitoring scan completed for {target_url}")

    result = {
        "action": "check_logging_monitor",
        "url": target_url,
        "log_vulnerabilities": log_results,
    }
    if not found_any_vulnerable:
        result["note"] = "No logging & monitoring failures found."

    return jsonify(result), 200

##################################################
# SSRF Detection Endpoint
##################################################
@app.route('/check_ssrf', methods=['POST'])
def check_for_ssrf():
    data = request.get_json()
    target_url = data.get('url')

    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    ssrf_results = check_ssrf(target_url)

    # Store only if SSRF vulnerabilities are found
    conn = get_connection()
    cursor = conn.cursor()
    found_any_vulnerable = False
    for res in ssrf_results:
        found_any_vulnerable = True
        cursor.execute(
            """
            INSERT INTO vulnerabilities (url, vulnerability_type, payload)
            VALUES (%s, %s, %s)
            """,
            (res["url"], "SSRF", res["issue"])
        )

    conn.commit()
    cursor.close()
    conn.close()

    SCAN_HISTORY.append(ssrf_results)
    logging.info(f"SSRF scan completed for {target_url}")

    result = {
        "action": "check_ssrf",
        "url": target_url,
        "ssrf_vulnerabilities": ssrf_results,
    }
    if not found_any_vulnerable:
        result["note"] = "No SSRF vulnerabilities found."

    return jsonify(result), 200

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