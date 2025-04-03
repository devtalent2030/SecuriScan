import requests
import logging
from urllib.parse import urljoin
from flask import Flask, request, jsonify
from flask_cors import CORS

SECURITY_HEADERS = [
    "Content-Security-Policy",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Strict-Transport-Security",
    "Referrer-Policy",
    "Permissions-Policy",
    "X-XSS-Protection",
    "Access-Control-Allow-Origin"
]

EXPOSED_PATHS = [
    "/admin", "/wp-admin", "/dashboard", "/controlpanel", "/cpanel",
    "/phpmyadmin", "/login", "/config", "/debug", "/server-status",
    "/.git", "/.env", "/backup", "/test", "/admin.php",
]

MISCONFIG_INDICATORS = {
    "directory_listing": ["Index of", "dirlisting", "directory listing"],
    "server_info": ["Server: ", "X-Powered-By", "Apache", "nginx", "IIS"],
    "debug_mode": ["debug", "stack trace", "exception", "traceback"],
}

def check_security_misconfig(url, timeout=5):
    results = {
        "action": "check_security_misconfig",
        "url": url,
        "vulnerabilities": [],
        "exposed_paths": [],
        "headers": {}
    }

    try:
        # Check initial HTTP response for redirect
        if url.startswith("http://"):
            initial_r = requests.get(url, timeout=timeout, allow_redirects=False, verify=False)
            if initial_r.status_code not in [301, 302, 307, 308] or not initial_r.headers.get("Location", "").startswith("https://"):
                results["vulnerabilities"].append({
                    "issue": "No HTTPS enforcement",
                    "evidence": "HTTP does not redirect to HTTPS",
                    "severity": "High"
                })

        # Full request with redirects
        r = requests.get(url, timeout=timeout, allow_redirects=True, verify=False)
        headers = r.headers
        results["headers"] = dict(headers)
        results["url"] = r.url  # Final URL after redirects

        # Test 1: Missing or weak security headers
        for header in SECURITY_HEADERS:
            if header not in headers:
                results["vulnerabilities"].append({
                    "issue": f"Missing security header: {header}",
                    "evidence": "Header not present in response",
                    "severity": "Medium"
                })
            elif header == "Strict-Transport-Security" and "max-age=0" in headers[header]:
                results["vulnerabilities"].append({
                    "issue": "Ineffective HSTS configuration",
                    "evidence": "max-age set to 0",
                    "severity": "Medium"
                })
            elif header == "Access-Control-Allow-Origin" and headers[header] == "*":
                results["vulnerabilities"].append({
                    "issue": "Permissive CORS policy",
                    "evidence": "Access-Control-Allow-Origin set to wildcard (*)",
                    "severity": "High"
                })

        # Test 2: Exposed server information
        for header, value in headers.items():
            if any(ind in f"{header}: {value}" for ind in MISCONFIG_INDICATORS["server_info"]):
                results["vulnerabilities"].append({
                    "issue": "Server information exposed",
                    "evidence": f"{header}: {value}",
                    "severity": "Low"
                })

        # Test 3: Directory listing or debug mode
        for key, indicators in MISCONFIG_INDICATORS.items():
            if any(ind in r.text.lower() for ind in indicators):
                results["vulnerabilities"].append({
                    "issue": f"{key.replace('_', ' ').title()} enabled",
                    "evidence": "Detected in response body",
                    "severity": "High" if key == "directory_listing" else "Medium"
                })

        # Test 4: Exposed paths
        for path in EXPOSED_PATHS:
            test_url = urljoin(r.url, path)
            try:
                path_r = requests.get(test_url, timeout=timeout, verify=False)
                if path_r.status_code == 200:
                    results["vulnerabilities"].append({
                        "issue": "Exposed sensitive path",
                        "evidence": f"Accessible at {test_url}",
                        "severity": "High"
                    })
                    results["exposed_paths"].append(test_url)
                elif path_r.status_code in [401, 403]:
                    results["vulnerabilities"].append({
                        "issue": "Protected path detected",
                        "evidence": f"Authentication required at {test_url}",
                        "severity": "Low"
                    })
            except requests.RequestException as e:
                logging.error(f"Failed to scan {test_url}: {e}")

    except requests.RequestException as e:
        logging.error(f"Failed to scan {url}: {e}")
        if "SSLError" in str(e):
            results["vulnerabilities"].append({
                "issue": "SSL certificate mismatch",
                "evidence": str(e),
                "severity": "Medium"
            })
        else:
            results["vulnerabilities"].append({
                "issue": "Scan failed",
                "evidence": str(e),
                "severity": "Unknown"
            })

    return results

app = Flask(__name__)
CORS(app)

@app.route("/check_security_misconfig", methods=["POST"])
def security_misconfig_scan():
    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({"error": "Missing URL in request"}), 400
    url = data["url"]
    try:
        results = check_security_misconfig(url)
        logging.info(f"Security Misconfiguration scan completed for {url}")
        return jsonify(results)
    except Exception as e:
        logging.error(f"Error in security misconfig scan: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)