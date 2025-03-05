import requests
import logging

# ✅ Common sensitive URLs that should be restricted
SENSITIVE_PATHS = [
    "/admin", "/dashboard", "/config", "/private", "/user/1", "/account/settings"
]

# ✅ IDOR (Insecure Direct Object Reference) Test Payloads
IDOR_TESTS = [
    {"param": "user_id", "value": "1"},
    {"param": "account_id", "value": "999"},
    {"param": "order_id", "value": "123456"}
]

def check_broken_access(target_url):
    """
    Checks for broken access control vulnerabilities by testing:
    - Forced browsing
    - IDOR (Insecure Direct Object References)
    """
    results = []

    # ✅ Test for Forced Browsing
    for path in SENSITIVE_PATHS:
        test_url = f"{target_url.rstrip('/')}{path}"
        try:
            response = requests.get(test_url, timeout=5)
            if response.status_code == 200:
                results.append({"url": test_url, "issue": "Potential forced browsing"})
        except requests.RequestException as e:
            logging.error(f"Failed to request {test_url}: {e}")

    # ✅ Test for IDOR
    for test in IDOR_TESTS:
        params = {test["param"]: test["value"]}
        try:
            response = requests.get(target_url, params=params, timeout=5)
            if response.status_code == 200 and "error" not in response.text.lower():
                results.append({"url": target_url, "params": params, "issue": "Potential IDOR vulnerability"})
        except requests.RequestException as e:
            logging.error(f"Failed to request {target_url} with params {params}: {e}")

    return results