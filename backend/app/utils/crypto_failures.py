import requests
import ssl
import time
from urllib.parse import urlparse
import logging
from cryptography import x509
from cryptography.hazmat.backends import default_backend
import socket
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

# Weak TLS versions and ciphers
WEAK_TLS_VERSIONS = ["SSLv2", "SSLv3", "TLSv1", "TLSv1.1"]
WEAK_CIPHERS = ["RC4", "DES", "3DES", "MD5", "NULL"]

# Sensitive data patterns
SENSITIVE_PATTERNS = [
    r"API[_-]?KEY[:=]\s*[\w-]{16,}",  # API keys
    r"SECRET[_-]?KEY[:=]\s*[\w-]{16,}",  # Secret keys
    r"Bearer\s+[\w-]+\.[\w-]+\.[\w-]+",  # JWT tokens
    r"password[:=]\s*\S+",  # Plaintext passwords
]

def check_crypto_failures(url, timeout=15):  # Increased to 15s
    """
    Advanced cryptographic failure scanner checking HTTPS, TLS, ciphers, certificates, and sensitive data exposure.
    
    Args:
        url (str): Target URL (e.g., 'http://example.com').
        timeout (int): Request timeout in seconds.
    
    Returns:
        dict: Scan results with vulnerabilities and details.
    """
    results = {
        "action": "check_crypto_failures",
        "url": url,
        "vulnerabilities": [],
        "certificate_info": None,
        "exposed_data": [],
        "tls_info": None
    }

    parsed = urlparse(url)
    hostname = parsed.netloc.split(":")[0]

    # Test 1: HTTPS enforcement
    if not url.startswith("https://"):
        results["vulnerabilities"].append({
            "issue": "No HTTPS enforcement",
            "evidence": "URL uses HTTP instead of HTTPS",
            "severity": "High"
        })
        https_url = f"https://{parsed.netloc}{parsed.path}"
    else:
        https_url = url

    # Test 2: TLS version and cipher suites
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=timeout) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                tls_version = ssock.version()
                cipher = ssock.cipher()[0]
                results["tls_info"] = {"version": tls_version, "cipher": cipher}
                if tls_version in WEAK_TLS_VERSIONS:
                    results["vulnerabilities"].append({
                        "issue": "Weak TLS version",
                        "evidence": f"Detected {tls_version}",
                        "severity": "High"
                    })
                if any(weak in cipher for weak in WEAK_CIPHERS):
                    results["vulnerabilities"].append({
                        "issue": "Weak cipher suite",
                        "evidence": f"Detected {cipher}",
                        "severity": "High"
                    })
    except (socket.error, ssl.SSLError) as e:
        logging.error(f"TLS check failed for {hostname}: {e}")
        results["tls_info"] = {"error": str(e)}

    # Test 3: Certificate validation
    try:
        cert_der = ssl.get_server_certificate((hostname, 443)).encode()
        cert = x509.load_pem_x509_certificate(cert_der, default_backend())
        results["certificate_info"] = {
            "issuer": cert.issuer.rfc4514_string(),
            "subject": cert.subject.rfc4514_string(),
            "not_before": cert.not_valid_before.isoformat(),
            "not_after": cert.not_valid_after.isoformat(),
            "expired": cert.not_valid_after.timestamp() < time.time()
        }
        if results["certificate_info"]["expired"]:
            results["vulnerabilities"].append({
                "issue": "Expired SSL/TLS certificate",
                "evidence": f"Expired on {cert.not_valid_after.isoformat()}",
                "severity": "Medium"
            })
    except Exception as e:
        logging.error(f"Certificate check failed for {hostname}: {e}")
        results["certificate_info"] = {"error": str(e)}

    # Test 4: Sensitive data exposure
    try:
        r = requests.get(https_url, timeout=timeout, verify=True)
        for pattern in SENSITIVE_PATTERNS:
            matches = re.findall(pattern, r.text)
            if matches:
                results["exposed_data"].extend(matches)
                results["vulnerabilities"].append({
                    "issue": "Sensitive data exposure",
                    "evidence": f"Found {len(matches)} instances (e.g., {matches[0][:20]}...)",
                    "severity": "Critical"
                })
        if not results["exposed_data"]:
            results["exposed_data"] = []  # Ensure empty list if no matches
    except requests.RequestException as e:
        logging.error(f"Request failed for {https_url}: {e}")
        results["exposed_data"] = []  # Default to empty list on failure
        results["vulnerabilities"].append({
            "issue": "Sensitive data check incomplete",
            "evidence": f"Request timed out or failed: {str(e)[:50]}...",
            "severity": "Low"
        })

    return results

app = Flask(__name__)
CORS(app)

@app.route("/check_crypto_failures", methods=["POST"])
def crypto_scan():
    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({"error": "Missing URL in request"}), 400
    url = data["url"]
    try:
        results = check_crypto_failures(url)
        logging.info(f"Cryptographic Failures scan completed for {url}")
        return jsonify(results)
    except Exception as e:
        logging.error(f"Error in crypto scan: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)