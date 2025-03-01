import requests
from bs4 import BeautifulSoup
import re

# A local database of known vulnerabilities for example libraries
# Key: library_name, Value: { version: "vulnerability details" }
KNOWN_VULNS = {
    "jquery": {
        "3.3.1": "CVE-2019-11358 - vulnerable to cross-site scripting",
        "1.12.4": "CVE-2010-5312 - multiple vulnerabilities",
    },
    "react": {
        "16.0.0": "Sample React 16.0.0 vulnerability detail",
    },
    "vue": {
        "2.6.0": "Sample Vue 2.6.0 vulnerability detail",
    },
    "bootstrap": {
        "4.3.1": "CVE-2019-8331 - XSS vulnerability in data-target attribute",
    },
    # ... Add more as needed ...
}

def scan_website_js_libraries(url: str):
    """
    1. Fetch the website's HTML.
    2. Parse all <script src="..."> tags.
    3. Attempt to detect library name/version from the filename.
    4. Compare with known vulnerabilities in KNOWN_VULNS.
    5. Return a structured list of results.
    """
    results = []

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        # Return a special error result
        return [{
            "library": None,
            "version": None,
            "vulnerable": False,
            "description": f"Error fetching URL: {e}"
        }]

    soup = BeautifulSoup(response.text, "html.parser")
    script_tags = soup.find_all("script", src=True)

    for tag in script_tags:
        src = tag["src"]  # e.g. "https://cdn.example.com/jquery-3.3.1.min.js"
        library_name, library_version = detect_library(src)

        if library_name and library_version:
            # Check if known to be vulnerable
            if (library_name in KNOWN_VULNS 
                and library_version in KNOWN_VULNS[library_name]):
                results.append({
                    "library": library_name,
                    "version": library_version,
                    "vulnerable": True,
                    "description": KNOWN_VULNS[library_name][library_version]
                })
            else:
                results.append({
                    "library": library_name,
                    "version": library_version,
                    "vulnerable": False,
                    "description": "No known vulnerability in local database"
                })
        else:
            # Unrecognized or unversioned script
            results.append({
                "library": src,  # fallback: show the URL
                "version": None,
                "vulnerable": False,
                "description": "Unknown or untracked script"
            })

    return results


def detect_library(src_url: str):
    """
    Attempt to detect library name + version from src_url.
    We'll do naive regex checks for known libraries:
      - jquery-3.3.1.min.js
      - react-16.0.0.js
      - vue-2.6.0.js
      - bootstrap-4.3.1.min.js
    Expand for your real needs.
    """
    # Lowercase the URL for easier checks
    url_lower = src_url.lower()

    # 1) jQuery pattern: "jquery-(x.x.x)"
    if "jquery-" in url_lower:
        match = re.search(r"jquery-(\d+\.\d+\.\d+)", url_lower)
        if match:
            version = match.group(1)
            return ("jquery", version)

    # 2) React pattern: "react-(x.x.x)"
    if "react-" in url_lower:
        match = re.search(r"react-(\d+\.\d+\.\d+)", url_lower)
        if match:
            version = match.group(1)
            return ("react", version)

    # 3) Vue pattern: "vue-(x.x.x)"
    if "vue-" in url_lower:
        match = re.search(r"vue-(\d+\.\d+\.\d+)", url_lower)
        if match:
            version = match.group(1)
            return ("vue", version)

    # 4) Bootstrap pattern: "bootstrap-(x.x.x)"
    if "bootstrap-" in url_lower:
        match = re.search(r"bootstrap-(\d+\.\d+\.\d+)", url_lower)
        if match:
            version = match.group(1)
            return ("bootstrap", version)

    # Add more patterns here for Angular, etc.

    # If no pattern matched
    return (None, None)