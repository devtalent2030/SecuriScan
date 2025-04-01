import requests
import time
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# CSRF protection headers and tokens
CSRF_HEADERS = [
    "X-CSRF-Token",
    "X-XSRF-TOKEN",
    "X-Requested-With",
    "CSRF-Token"
]

CSRF_TOKEN_NAMES = ["csrf", "token", "xsrf", "csrf_token", "authenticity_token"]

# Common anti-CSRF cookie attributes
CSRF_COOKIE_FLAGS = ["SameSite=Strict", "SameSite=Lax"]

# Time-based CSRF payload (simulates a slow response for blind detection)
TIME_BASED_CSRF_PAYLOAD = {"delay": "5000"}  # Hypothetical server-side delay trigger

def check_csrf(url, max_forms=10):
    """
    Advanced CSRF scanner with form analysis, header checks, cookie validation, and time-based detection.

    Args:
        url (str): Target URL (e.g., 'http://example.com/login').
        max_forms (int): Limit number of forms to test.

    Returns:
        dict: Scan results with vulnerabilities and time-based test.
    """
    results = {
        "action": "check_csrf",
        "url": url,
        "csrf_vulnerabilities": [],
        "time_based_test": None,
        "note": None
    }

    try:
        # Start a session to persist cookies
        session = requests.Session()
        response = session.get(url, timeout=10)
        if response.status_code != 200:
            results["error"] = f"Failed to fetch page. Status code: {response.status_code}"
            return results

        # Parse page for forms
        soup = BeautifulSoup(response.text, "html.parser")
        forms = soup.find_all("form")[:max_forms]

        # Analyze forms
        for form in forms:
            form_action = form.get("action", "Unknown")
            if not urlparse(form_action).netloc:
                form_action = urljoin(url, form_action)
            method = form.get("method", "GET").upper()
            inputs = form.find_all("input")

            # Check for CSRF tokens in hidden inputs
            has_csrf_token = any(
                input_tag.get("type") == "hidden" and 
                any(token_name in input_tag.get("name", "").lower() for token_name in CSRF_TOKEN_NAMES)
                for input_tag in inputs
            )

            # Test unsafe methods without tokens
            if method in ["POST", "PUT", "DELETE"]:
                if not has_csrf_token:
                    results["csrf_vulnerabilities"].append({
                        "form_action": form_action,
                        "method": method,
                        "vulnerable": True,
                        "evidence": "Missing CSRF token in form submission"
                    })
                else:
                    # Simulate a POST without the token to verify protection
                    test_data = {input_tag.get("name"): input_tag.get("value", "") for input_tag in inputs}
                    if "csrf" in test_data:
                        del test_data["csrf"]  # Remove token to test enforcement
                    try:
                        post_response = session.post(form_action, data=test_data, timeout=5)
                        if post_response.status_code in [200, 201]:
                            results["csrf_vulnerabilities"].append({
                                "form_action": form_action,
                                "method": method,
                                "vulnerable": True,
                                "evidence": "POST succeeded without CSRF token"
                            })
                    except requests.RequestException:
                        pass

        # Check CSRF headers
        csrf_headers_found = [header for header in CSRF_HEADERS if header in response.headers]
        if not csrf_headers_found:
            results["csrf_vulnerabilities"].append({
                "vulnerable": True,
                "evidence": "No CSRF protection headers found in response"
            })

        # Check SameSite cookie attributes
        cookies = session.cookies.get_dict()
        samesite_protected = any(
            "SameSite" in str(session.cookies.get(name)) for name in cookies
        )
        if not samesite_protected:
            results["csrf_vulnerabilities"].append({
                "vulnerable": True,
                "evidence": "Cookies lack SameSite attribute protection"
            })

        # Time-based CSRF test (blind detection)
        if forms:
            first_form = forms[0]
            form_action = urljoin(url, first_form.get("action", url))
            method = first_form.get("method", "GET").upper()
            if method in ["POST", "PUT", "DELETE"]:
                test_data = {input_tag.get("name"): input_tag.get("value", "") for input_tag in first_form.find_all("input")}
                test_data.update(TIME_BASED_CSRF_PAYLOAD)
                try:
                    start_time = time.time()
                    session.post(form_action, data=test_data, timeout=10)
                    end_time = time.time()
                    if end_time - start_time > 4:  # 4s threshold for 5s delay
                        results["time_based_test"] = {
                            "payload": str(TIME_BASED_CSRF_PAYLOAD),
                            "vulnerable": True,
                            "evidence": "Significant delay (possible blind CSRF)"
                        }
                    else:
                        results["time_based_test"] = {
                            "payload": str(TIME_BASED_CSRF_PAYLOAD),
                            "vulnerable": False
                        }
                except requests.RequestException:
                    results["time_based_test"] = {
                        "payload": str(TIME_BASED_CSRF_PAYLOAD),
                        "vulnerable": False,
                        "note": "Request failed during time-based test"
                    }

        # Final note
        if not results["csrf_vulnerabilities"]:
            results["note"] = "No CSRF vulnerabilities detected."
        else:
            results["note"] = "CSRF vulnerabilities found."

        return results

    except requests.RequestException as e:
        logging.error(f"Error scanning {url} for CSRF: {e}")
        results["error"] = str(e)
        return results