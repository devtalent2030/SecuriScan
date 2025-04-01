import requests
import time
from urllib.parse import urlparse, urljoin, parse_qs  # Added parse_qs import
import logging
import random

# Advanced sensitive paths for forced browsing
SENSITIVE_PATHS = [
    "/admin", "/dashboard", "/config", "/private", "/user/1", "/account/settings",
    "/admin/login", "/api/users", "/backup", "/dbadmin", "/management",
    "/secret", "/hidden", "/internal", "/debug", "/test", "/phpmyadmin",
    "/wp-admin", "/administrator", "/controlpanel", "/sysadmin",
]

# Advanced IDOR test payloads (broader parameter names and values)
IDOR_TESTS = [
    {"param": "id", "value": "1"},               # Common ID
    {"param": "user_id", "value": "999"},        # High user ID
    {"param": "account_id", "value": "admin"},   # Admin account
    {"param": "order_id", "value": "123456"},    # Order reference
    {"param": "file", "value": "../etc/passwd"}, # Path traversal attempt
    {"param": "uid", "value": "0"},              # Root/admin ID
    {"param": "profile_id", "value": "guest"},   # Different user role
]

# Indicators of unprotected access
ACCESS_INDICATORS = [
    "welcome", "dashboard", "admin", "user", "settings", "profile",
    "success", "data", "id=", "account", "private", "restricted",
]

def check_broken_access(url, extra_params=None, max_tests=10):
    """
    Advanced Broken Access Control scanner testing forced browsing, IDOR, and privilege escalation.
    
    Args:
        url (str): Target URL (e.g., 'http://example.com').
        extra_params (dict): Additional params to test (e.g., {'id': 'test'}).
        max_tests (int): Limit tests per category.
    
    Returns:
        dict: Scan results with vulnerable endpoints and tests.
    """
    results = {
        "action": "check_access_control",
        "url": url,
        "vulnerable_endpoints": [],
        "time_based_test": None,
        "detected_paths": []  # Track accessible sensitive paths
    }

    # Parse URL
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"
    original_params = parse_qs(parsed.query)
    if extra_params:
        original_params.update(extra_params)

    # Test 1: Forced Browsing
    tested_count = 0
    for path in SENSITIVE_PATHS:
        if tested_count >= max_tests:
            break
        test_url = urljoin(base_url, path.lstrip('/'))
        try:
            r = requests.get(test_url, timeout=5, allow_redirects=True)
            if r.status_code == 200 and any(ind in r.text.lower() for ind in ACCESS_INDICATORS):
                results["vulnerable_endpoints"].append({
                    "url": test_url,
                    "issue": "Unprotected sensitive path (Forced Browsing)",
                    "evidence": "Accessible without authentication",
                    "status_code": r.status_code
                })
                results["detected_paths"].append(test_url)
            elif r.status_code in [401, 403]:
                results["vulnerable_endpoints"].append({
                    "url": test_url,
                    "issue": "Protected path detected",
                    "evidence": "Requires authentication",
                    "status_code": r.status_code
                })
        except requests.RequestException as e:
            logging.error(f"Failed to request {test_url}: {e}")
        tested_count += 1

    # Test 2: IDOR with parameter manipulation
    tested_count = 0
    for test in IDOR_TESTS:
        if tested_count >= max_tests:
            break
        params = original_params.copy() if original_params else {}
        params[test["param"]] = [test["value"]]
        try:
            r = requests.get(url, params=params, timeout=5)
            if r.status_code == 200 and any(ind in r.text.lower() for ind in ACCESS_INDICATORS):
                results["vulnerable_endpoints"].append({
                    "url": r.url,
                    "issue": "Potential IDOR vulnerability",
                    "evidence": f"Accessed data with {test['param']}={test['value']}",
                    "params": params,
                    "status_code": r.status_code
                })
            elif r.status_code == 403:
                results["vulnerable_endpoints"].append({
                    "url": r.url,
                    "issue": "Access denied (possible mitigation)",
                    "evidence": f"Tested {test['param']}={test['value']}",
                    "params": params,
                    "status_code": r.status_code
                })
        except requests.RequestException as e:
            logging.error(f"Failed IDOR test {params}: {e}")
        tested_count += 1

    # Test 3: Time-based privilege escalation check (e.g., slow response for admin pages)
    admin_test_url = urljoin(base_url, "admin")
    try:
        start_time = time.time()
        r = requests.get(admin_test_url, timeout=10)
        end_time = time.time()
        if end_time - start_time > 3 and r.status_code == 200:
            results["time_based_test"] = {
                "url": admin_test_url,
                "vulnerable": True,
                "evidence": "Significant delay (possible unprotected admin access)",
                "delay": end_time - start_time
            }
            results["detected_paths"].append(admin_test_url)
        else:
            results["time_based_test"] = {
                "url": admin_test_url,
                "vulnerable": False,
                "delay": end_time - start_time
            }
    except requests.RequestException:
        results["time_based_test"] = {
            "url": admin_test_url,
            "vulnerable": False,
            "note": "Request failed during time-based test"
        }

    return results  # Fixed typo from 'resultsthrowing'