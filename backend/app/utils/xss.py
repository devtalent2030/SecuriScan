import requests

# List of common XSS payloads to test against the target URL
COMMON_XSS_PAYLOADS = [
    "<script>alert('XSS')</script>",  # Basic XSS payload that triggers JavaScript alert
    "'\"><script>alert('XSS')</script>",  # Breaks out of HTML attributes to inject script
    "<img src=x onerror=alert('XSS')>",  # Uses image tag to trigger on error event
    "<svg/onload=alert('XSS')>"  # Uses SVG image onload event to trigger JavaScript
]

def check_xss(url):
    """
    Performs a security test on the provided URL to check for Cross-Site Scripting (XSS) vulnerabilities.
    - Injects various XSS payloads to examine if scripts are reflected in the response.
    - Useful for identifying if input sanitation is lacking and malicious scripts can be executed.

    Args:
        url (str): The URL of the web application to test for XSS vulnerabilities.

    Returns:
        list: A list of dictionaries, each containing the payload used and the test results.
    """

    results = []  # Stores results of the XSS tests

    # Test each payload in the list
    for payload in COMMON_XSS_PAYLOADS:
        test_url = f"{url}?q={payload}"  # Append payload to URL query parameter 'q'
        try:
            response = requests.get(test_url, timeout=5)  # Making an HTTP GET request
            # Check if the payload script is reflected in the HTML response
            if payload in response.text:
                results.append({
                    "payload": payload,
                    "vulnerable": True,
                    "evidence": "Reflected script detected in response"
                })
            else:
                results.append({
                    "payload": payload,
                    "vulnerable": False
                })
        except requests.RequestException:
            # Handle exceptions such as timeout, connection error
            pass

    return results  # Return all results from the tests
