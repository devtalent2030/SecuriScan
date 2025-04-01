import requests
import os
import threading
import time
from urllib.parse import urljoin
import logging
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Load wordlist for directory and file brute-forcing
WORDLIST_PATH = os.path.join(os.path.dirname(__file__), "dirbuster.txt")
COMMON_EXTENSIONS = [".php", ".asp", ".html", ".txt", ".bak", ".zip"]

def load_wordlist():
    """Load common directory/file names from a wordlist file."""
    if not os.path.exists(WORDLIST_PATH):
        return ["admin", "backup", "config", "db", "logs", "uploads", "test", "private"]
    with open(WORDLIST_PATH, "r", encoding="utf-8") as file:
        return [line.strip() for line in file if line.strip()]

def check_url(test_url, results_list, timeout=5):
    """Check a single URL and append results if found."""
    try:
        response = requests.get(test_url, timeout=timeout, allow_redirects=True)
        status = response.status_code
        if status in [200, 403, 301]:  # Found, forbidden, or redirected
            results_list.append({
                "url": test_url,
                "status_code": status,
                "vulnerable": True,
                "evidence": f"Response code {status} indicates existence"
            })
    except requests.RequestException:
        pass

def enumerate_directories(url, max_entries=100, threads=10):
    """
    Advanced directory and file enumeration scanner with multi-threading and time-based checks.

    Args:
        url (str): Target URL (e.g., 'http://example.com').
        max_entries (int): Limit number of entries to test.
        threads (int): Number of concurrent threads.

    Returns:
        dict: Scan results with found directories and time-based test.
    """
    results = {
        "action": "check_directory_enum",
        "url": url,
        "vulnerable_directories": [],
        "time_based_test": None,
        "note": None
    }

    wordlist = load_wordlist()[:max_entries]
    base_url = url.rstrip('/')
    found_dirs = []

    # Multi-threaded directory/file enumeration
    with ThreadPoolExecutor(max_workers=threads) as executor:
        futures = []
        for word in wordlist:
            # Test directories
            test_url = f"{base_url}/{word}/"
            futures.append(executor.submit(check_url, test_url, found_dirs))
            # Test files with extensions
            for ext in COMMON_EXTENSIONS:
                file_url = f"{base_url}/{word}{ext}"
                futures.append(executor.submit(check_url, file_url, found_dirs))

        # Wait for all threads to complete
        for future in futures:
            future.result()

    results["vulnerable_directories"] = found_dirs

    # Time-based test for hidden resources (e.g., slow response on sensitive dir)
    test_url = f"{base_url}/admin/"  # Common sensitive directory
    try:
        start_time = time.time()
        response = requests.get(test_url, timeout=10)
        end_time = time.time()
        delay = end_time - start_time
        if delay > 4 and response.status_code in [200, 403]:  # 4s threshold
            results["time_based_test"] = {
                "payload": test_url,
                "vulnerable": True,
                "evidence": f"Significant delay ({delay:.2f}s) suggests hidden resource"
            }
        else:
            results["time_based_test"] = {
                "payload": test_url,
                "vulnerable": False,
                "evidence": f"Response time: {delay:.2f}s"
            }
    except requests.RequestException:
        results["time_based_test"] = {
            "payload": test_url,
            "vulnerable": False,
            "note": "Request failed during time-based test"
        }

    # Final note
    if not found_dirs:
        results["note"] = "No vulnerable directories or files detected."
    else:
        results["note"] = f"Found {len(found_dirs)} potential directories/files."

    logging.info(f"Directory enumeration completed for {url}")
    return results