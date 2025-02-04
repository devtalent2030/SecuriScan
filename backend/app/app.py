import warnings

# Suppress urllib3 SSL warnings
warnings.filterwarnings("ignore", category=UserWarning, module="urllib3")

import sys
import os

# Add the backend directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "../"))
sys.path.append(backend_dir)

from flask import Flask, jsonify, request
from utils.crawler import crawl_website
from utils.sql_injection import check_sql_injection
from utils.xss import check_xss

app = Flask(__name__)

# In-memory scan history (for MVP)
SCAN_HISTORY = []

# Root endpoint
@app.route('/')
def home():
    return jsonify({"message": "Welcome to SecuriScan API!"})

# Health check endpoint
@app.route('/ping')
def ping():
    return jsonify({"status": "ok"}), 200

# Crawling endpoint
@app.route('/crawl', methods=['POST'])
def crawl_site():
    data = request.get_json()
    start_url = data.get('url')

    if not start_url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        crawled_urls = crawl_website(start_url)
        scan_result = {
            "action": "crawl",
            "url": start_url,
            "found_urls": crawled_urls
        }
        SCAN_HISTORY.append(scan_result)
        return jsonify(scan_result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Endpoint to Trigger SQL Injection Check
@app.route('/check_sql', methods=['POST'])
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

    SCAN_HISTORY.append(result)  # Save to scan history
    return jsonify(result), 200


# Endpoint for XSS Check
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

    SCAN_HISTORY.append(result)  # Save to history
    return jsonify(result), 200


# Endpoint to Save a Scan Result Manually
@app.route('/save_scan', methods=['POST'])
def save_scan():
    data = request.get_json()
    SCAN_HISTORY.append(data)
    return jsonify({"status": "saved"}), 200

# Endpoint to Retrieve Scan History
@app.route('/scan_history', methods=['GET'])
def get_scan_history():
    return jsonify({"history": SCAN_HISTORY}), 200

if __name__ == '__main__':
    app.run(debug=True)
