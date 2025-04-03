import requests
import logging
import time
from urllib.parse import urljoin
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Security headers related to logging and monitoring
SECURITY_HEADERS = [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-XSS-Protection",
]

# Extended sensitive error patterns
SENSITIVE_ERROR_PATTERNS = [
    "Warning: mysql_", "Fatal error", "Stack trace", "Invalid username or password",
    "syntax error", "exception", "traceback", "server error", "500 Internal Server Error",
    "unhandled exception", "debug", "sql", "database", "password", "token",
]

def check_logging_failures(url, timeout=5):
    """
    Advanced scanner for logging and monitoring failures, including headers, errors, and timing.

    Args:
        url (str): Target URL (e.g., 'http://example.com').
        timeout (int): Request timeout in seconds.

    Returns:
        dict: Structured results with vulnerabilities and time-based test.
    """
    results = {
        "action": "check_logging_monitor",
        "url": url,
        "vulnerabilities": [],
        "time_based_test": None,
        "note": None
    }

    try:
        session = requests.Session()

        # Initial request to check headers and content
        start_time = time.time()
        response = session.get(url, timeout=timeout)
        response_time = time.time() - start_time
        headers = response.headers
        response_text = response.text.lower()

        # Check for missing security headers
        for header in SECURITY_HEADERS:
            if header not in headers:
                results["vulnerabilities"].append({
                    "issue": "Missing security header",
                    "evidence": f"{header} not present",
                    "severity": "Medium"
                })

        # Check for exposed sensitive error messages
        for pattern in SENSITIVE_ERROR_PATTERNS:
            if pattern in response_text:
                results["vulnerabilities"].append({
                    "issue": "Exposed sensitive error message",
                    "evidence": f"Found '{pattern}' in response",
                    "severity": "High" if "password" in pattern or "sql" in pattern else "Medium"
                })

        # Check response status for unlogged errors
        if response.status_code == 500:
            results["vulnerabilities"].append({
                "issue": "Server error detected",
                "evidence": "HTTP 500 Internal Server Error",
                "severity": "High"
            })
        elif response.status_code == 404 and "not found" not in response_text:
            results["vulnerabilities"].append({
                "issue": "Potential unlogged 404",
                "evidence": "Custom 404 page without 'not found' message",
                "severity": "Low"
            })

        # Time-based test for slow responses (indicating unlogged server strain)
        error_test_url = urljoin(url, "nonexistent_path_to_trigger_error")
        try:
            start_time = time.time()
            error_response = session.get(error_test_url, timeout=10)
            elapsed = time.time() - start_time
            if elapsed > 4:  # 4s threshold for potential logging failure
                results["time_based_test"] = {
                    "payload": error_test_url,
                    "vulnerable": True,
                    "evidence": f"Response delayed by {elapsed:.2f}s, possible unlogged error",
                    "severity": "Medium"
                }
            else:
                results["time_based_test"] = {
                    "payload": error_test_url,
                    "vulnerable": False,
                    "evidence": f"Response time: {elapsed:.2f}s"
                }
        except requests.RequestException:
            results["time_based_test"] = {
                "payload": error_test_url,
                "vulnerable": False,
                "note": "Request failed during time-based test"
            }

        # Final note
        if not results["vulnerabilities"]:
            results["note"] = "No logging or monitoring failures detected."
        else:
            results["note"] = f"Found {len(results['vulnerabilities'])} potential issues."

    except requests.RequestException as e:
        logging.error(f"Failed to scan {url}: {e}")
        results["vulnerabilities"].append({
            "issue": "Scan failed",
            "evidence": str(e),
            "severity": "Unknown"
        })

    return results

app = Flask(__name__)
CORS(app)

@app.route("/check_logging_failures", methods=["POST"])
def logging_scan():
    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({"error": "Missing URL in request"}), 400
    url = data["url"]
    try:
        results = check_logging_failures(url)
        logging.info(f"Logging scan completed for {url}")
        return jsonify(results)
    except Exception as e:
        logging.error(f"Error in logging scan: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)