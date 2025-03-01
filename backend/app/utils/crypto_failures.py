import requests
import logging
import ssl

# ✅ Weak TLS versions to flag
WEAK_TLS_VERSIONS = ["SSLv3", "TLS 1.0", "TLS 1.1"]

def check_crypto_failures(target_url):
    """
    Scans for cryptographic failures including:
    - Missing HTTPS
    - Weak TLS versions
    - Exposed API keys or sensitive information
    """
    results = []

    # ✅ Check if site uses HTTPS
    if not target_url.startswith("https://"):
        results.append({"url": target_url, "issue": "Site does not use HTTPS"})

    # ✅ Check weak TLS versions
    try:
        response = requests.get(target_url, timeout=5)
        tls_version = response.raw.version
        if tls_version in WEAK_TLS_VERSIONS:
            results.append({"url": target_url, "issue": f"Weak TLS version detected: {tls_version}"})
    except requests.RequestException as e:
        logging.error(f"Failed to request {target_url}: {e}")

    # ✅ Check for leaked sensitive data
    try:
        response = requests.get(target_url, timeout=5)
        if "API_KEY=" in response.text or "SECRET_KEY=" in response.text:
            results.append({"url": target_url, "issue": "Potential sensitive data exposure in response"})
    except requests.RequestException as e:
        logging.error(f"Failed to request {target_url}: {e}")

    return results