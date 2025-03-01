import requests
import logging

# ✅ Common security headers
SECURITY_HEADERS = [
    "Content-Security-Policy",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Strict-Transport-Security",
    "Referrer-Policy"
]

# ✅ Common exposed admin panel URLs
ADMIN_PATHS = [
    "/admin", "/wp-admin", "/dashboard", "/controlpanel", "/cpanel"
]

def check_security_misconfig(target_url):
    """
    Scans for security misconfigurations such as:
    - Missing security headers
    - Open admin panels
    - Directory listing enabled
    """
    results = []

    try:
        response = requests.get(target_url, timeout=5)
        headers = response.headers

        # ✅ Check for missing security headers
        for header in SECURITY_HEADERS:
            if header not in headers:
                results.append({"url": target_url, "issue": f"Missing security header: {header}"})

        # ✅ Check for directory listing enabled (if response contains "Index of")
        if "Index of" in response.text:
            results.append({"url": target_url, "issue": "Directory listing enabled"})

        # ✅ Check for open admin panels
        for path in ADMIN_PATHS:
            admin_url = f"{target_url.rstrip('/')}{path}"
            admin_response = requests.get(admin_url, timeout=5)
            if admin_response.status_code == 200:
                results.append({"url": admin_url, "issue": "Exposed admin panel"})

    except requests.RequestException as e:
        logging.error(f"Failed to scan {target_url}: {e}")

    return results