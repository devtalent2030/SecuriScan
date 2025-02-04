import requests

COMMON_XSS_PAYLOADS = [
    "<script>alert('XSS')</script>",
    "'\"><script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg/onload=alert('XSS')>"
]

def check_xss(url):
    """
    Improved XSS scanner.
    - Tests for reflected XSS by injecting script payloads.
    - Looks for injected content in the response.
    """
    results = []

    for payload in COMMON_XSS_PAYLOADS:
        test_url = f"{url}?q={payload}"  # Assuming 'q' is a common parameter
        try:
            response = requests.get(test_url, timeout=5)
            
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
            pass

    return results
