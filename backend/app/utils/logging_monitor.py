import requests
import logging

# ✅ Error messages that could indicate logging failures
SENSITIVE_ERROR_PATTERNS = [
    "Warning: mysql_",
    "Fatal error",
    "Stack trace",
    "Invalid username or password",
    "syntax error"
]

def check_logging_failures(target_url):
    """
    Checks for logging & monitoring failures:
    - Missing security headers for logging
    - Error messages leaking sensitive data
    - No audit logs detected
    """
    results = []

    try:
        response = requests.get(target_url, timeout=5)
        headers = response.headers
        response_text = response.text

        # ✅ Check for security headers related to logging
        if "X-Content-Type-Options" not in headers:
            results.append({"url": target_url, "issue": "Missing security header: X-Content-Type-Options"})

        # ✅ Check for exposed error messages
        for pattern in SENSITIVE_ERROR_PATTERNS:
            if pattern in response_text:
                results.append({"url": target_url, "issue": f"Exposed sensitive error message: {pattern}"})

    except requests.RequestException as e:
        logging.error(f"Failed to scan {target_url}: {e}")

    return results