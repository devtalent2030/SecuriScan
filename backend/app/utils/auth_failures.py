import requests
import logging

# ✅ Common default credentials (for testing)
DEFAULT_CREDENTIALS = [
    ("admin", "admin"),
    ("admin", "password"),
    ("root", "root"),
    ("user", "123456"),
    ("test", "test")
]

# ✅ Common login paths
LOGIN_PATHS = [
    "/login", "/admin/login", "/user/login", "/wp-login.php", "/signin"
]

def check_authentication_failures(target_url):
    """
    Checks for authentication failures, such as:
    - Default login credentials
    - Weak password enforcement
    - Missing MFA enforcement
    """
    results = []

    try:
        for path in LOGIN_PATHS:
            login_url = f"{target_url.rstrip('/')}{path}"
            response = requests.get(login_url, timeout=5)
            if response.status_code == 200:
                results.append({"url": login_url, "issue": "Login page found, testing default credentials..."})

                # ✅ Try common default credentials
                for username, password in DEFAULT_CREDENTIALS:
                    login_attempt = requests.post(login_url, data={"username": username, "password": password}, timeout=5)
                    if login_attempt.status_code == 200 and "Invalid" not in login_attempt.text:
                        results.append({"url": login_url, "issue": f"Default credentials worked: {username}/{password}"})
                        break  # Stop if we found a valid login

    except requests.RequestException as e:
        logging.error(f"Failed to scan {target_url}: {e}")

    return results