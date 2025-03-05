import requests
from bs4 import BeautifulSoup
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# CSRF-related headers commonly used for protection
CSRF_HEADERS = [
    "X-CSRF-Token",
    "X-XSRF-TOKEN",
    "X-Requested-With"
]

def check_csrf(target_url):
    """
    Checks if a website is vulnerable to CSRF attacks by:
    - Scanning for CSRF tokens in forms
    - Checking if CSRF-related headers are returned
    - Identifying unsafe HTTP methods used without CSRF protection
    """

    logging.info(f"Scanning {target_url} for CSRF vulnerabilities...")
    
    try:
        session = requests.Session()
        response = session.get(target_url, timeout=10)

        if response.status_code != 200:
            return {"error": f"Failed to fetch page. Status code: {response.status_code}"}

        soup = BeautifulSoup(response.text, "html.parser")
        forms = soup.find_all("form")

        csrf_vulnerabilities = []

        for form in forms:
            form_action = form.get("action", "Unknown")
            inputs = form.find_all("input")
            
            # Check if any hidden input contains a CSRF token
            has_csrf_token = any(
                input_tag.get("type") == "hidden" and 
                ("csrf" in input_tag.get("name", "").lower() or "token" in input_tag.get("name", "").lower()) 
                for input_tag in inputs
            )

            # Check if the form uses unsafe HTTP methods without CSRF protection
            method = form.get("method", "GET").upper()
            if method in ["POST", "PUT", "DELETE"] and not has_csrf_token:
                csrf_vulnerabilities.append({
                    "form_action": form_action,
                    "method": method,
                    "issue": "Missing CSRF token in form submission."
                })

        # Check if CSRF headers exist in the response
        csrf_headers_found = [header for header in CSRF_HEADERS if header in response.headers]
        if not csrf_headers_found:
            csrf_vulnerabilities.append({"issue": "No CSRF protection headers found in HTTP response."})

        # Final result
        return {
            "action": "check_csrf",
            "url": target_url,
            "csrf_vulnerabilities": csrf_vulnerabilities if csrf_vulnerabilities else "No CSRF vulnerabilities detected."
        }

    except requests.exceptions.RequestException as e:
        logging.error(f"Error scanning {target_url} for CSRF: {e}")
        return {"error": str(e)}