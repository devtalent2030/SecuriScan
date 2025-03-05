import requests
import os

# Load a wordlist for directory brute-forcing
WORDLIST_PATH = os.path.join(os.path.dirname(__file__), "dirbuster.txt")

def load_wordlist():
    """Load common directory names from a wordlist file."""
    if not os.path.exists(WORDLIST_PATH):
        return ["admin", "backup", "config", "database", "logs", "uploads"]  # Default basic list
    with open(WORDLIST_PATH, "r", encoding="utf-8") as file:
        return [line.strip() for line in file if line.strip()]

def enumerate_directories(target_url):
    """Try to discover hidden directories or files."""
    wordlist = load_wordlist()
    found_directories = []

    for word in wordlist:
        test_url = f"{target_url.rstrip('/')}/{word}/"
        try:
            response = requests.get(test_url, timeout=5)
            if response.status_code in [200, 403]:  # Found or forbidden
                found_directories.append({"url": test_url, "status_code": response.status_code})
        except requests.RequestException:
            continue  # Skip if request fails

    return {"action": "directory_enum", "url": target_url, "found_directories": found_directories}