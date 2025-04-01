import requests
import logging
from urllib.parse import urljoin
import time

# Extended default credentials
DEFAULT_CREDENTIALS = [
    ("admin", "admin"),
    ("admin", "password"),
    ("root", "root"),
    ("user", "123456"),
    ("test", "test"),
    ("admin", "1234"),
    ("guest", "guest"),
    ("root", "admin"),
]

# Extended login paths
LOGIN_PATHS = [
    "/login", "/admin/login", "/user/login", "/wp-login.php", "/signin",
    "/auth/login", "/login.php", "/admin", "/dashboard/login", "/account/login",
    "/login.aspx", "/admin_login", "/secure/login",
]

# Common login form field names
LOGIN_FIELDS = {
    "username": ["username", "user", "login", "email", "name", "uid"],
    "password": ["password", "pass", "passwd", "pwd", "secret"],
}

def check_authentication_failures(url, timeout=5):
    """
    Scans for authentication failures like default creds, weak enforcement, and session issues.
    
    Args:
        url (str): Target URL (e.g., 'http://example.com').
        timeout (int): Request timeout in seconds.
    
    Returns:
        dict: Structured results with vulnerabilities and details.
    """
    results = {
        "action": "check_auth_failures",
        "url": url,
        "vulnerabilities": [],
        "login_pages": []
    }

    try:
        session = requests.Session()

        for path in LOGIN_PATHS:
            login_url = urljoin(url, path)
            try:
                # Check if login page exists
                initial_response = session.get(login_url, timeout=timeout)
                if initial_response.status_code == 200:
                    results["login_pages"].append(login_url)
                    results["vulnerabilities"].append({
                        "issue": "Login page detected",
                        "evidence": f"Found at {login_url}",
                        "severity": "Low"
                    })

                    # Test default credentials
                    for username, password in DEFAULT_CREDENTIALS:
                        login_data = {
                            next(iter(LOGIN_FIELDS["username"])): username,
                            next(iter(LOGIN_FIELDS["password"])): password
                        }
                        attempt = session.post(login_url, data=login_data, timeout=timeout, allow_redirects=True)
                        response_text = attempt.text.lower()

                        if attempt.status_code == 200 and "invalid" not in response_text and "error" not in response_text:
                            results["vulnerabilities"].append({
                                "issue": "Default credentials accepted",
                                "evidence": f"Login succeeded with {username}/{password} at {login_url}",
                                "severity": "Critical"
                            })
                            break
                        elif attempt.status_code == 429:
                            results["vulnerabilities"].append({
                                "issue": "Rate limiting detected",
                                "evidence": f"429 Too Many Requests at {login_url}",
                                "severity": "Info"
                            })
                            break

                    # Check for session fixation (cookie reuse)
                    initial_cookies = session.cookies.get_dict()
                    if initial_cookies:
                        post_login_cookies = session.cookies.get_dict()
                        if initial_cookies == post_login_cookies:
                            results["vulnerabilities"].append({
                                "issue": "Possible session fixation",
                                "evidence": f"Session cookies unchanged after login attempt at {login_url}",
                                "severity": "High"
                            })

                    # Check rate limiting absence (multiple quick requests)
                    start_time = time.time()
                    for _ in range(5):
                        session.post(login_url, data=login_data, timeout=timeout)
                    elapsed = time.time() - start_time
                    if elapsed < 2:  # Fast responses suggest no delay
                        results["vulnerabilities"].append({
                            "issue": "No rate limiting detected",
                            "evidence": f"5 login attempts in {elapsed:.2f}s at {login_url}",
                            "severity": "Medium"
                        })

            except requests.RequestException as e:
                logging.debug(f"Failed to test {login_url}: {e}")

    except requests.RequestException as e:
        logging.error(f"Failed to initiate scan for {url}: {e}")
        results["vulnerabilities"].append({
            "issue": "Scan failed",
            "evidence": str(e),
            "severity": "Unknown"
        })

    if not results["vulnerabilities"]:
        results["note"] = "No authentication failures detected."
    return results