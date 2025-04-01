import requests
from bs4 import BeautifulSoup
import re
import logging
from urllib.parse import urlparse

# Extended database of known vulnerabilities (simplified for demo)
KNOWN_VULNS = {
    "jquery": {
        "3.3.1": "CVE-2019-11358 - XSS vulnerability",
        "1.12.4": "CVE-2010-5312 - Multiple XSS and DoS issues",
        "2.1.4": "CVE-2015-9251 - XSS in certain contexts",
    },
    "react": {
        "16.0.0": "Potential prototype pollution risk",
        "15.6.2": "CVE-2018-6341 - XSS via unsanitized props",
    },
    "vue": {
        "2.6.0": "Potential template injection risk",
        "2.5.16": "CVE-2018-11235 - Arbitrary code execution",
    },
    "bootstrap": {
        "4.3.1": "CVE-2019-8331 - XSS in data-target attribute",
        "3.3.7": "CVE-2016-10735 - XSS in tooltip/popover",
    },
    "lodash": {
        "4.17.15": "CVE-2021-23337 - Command injection",
        "4.17.4": "CVE-2019-10744 - Prototype pollution",
    },
    "angular": {
        "1.5.8": "CVE-2016-1000219 - XSS in $sanitize",
    }
}

def scan_website_js_libraries(url: str, timeout=10):
    """
    Scans a website for JavaScript dependencies and checks for known vulnerabilities.
    
    Args:
        url (str): Target URL (e.g., 'https://example.com').
        timeout (int): Request timeout in seconds.
    
    Returns:
        dict: Structured results with detected libraries and vulnerabilities.
    """
    results = {
        "action": "scan_dependencies",
        "url": url,
        "dependencies": [],
        "vulnerabilities": []
    }

    try:
        response = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
    except requests.RequestException as e:
        logging.error(f"Failed to fetch {url}: {e}")
        results["vulnerabilities"].append({
            "issue": "Failed to fetch URL",
            "evidence": str(e),
            "severity": "Unknown"
        })
        return results

    soup = BeautifulSoup(response.text, "html.parser")
    script_tags = soup.find_all("script", src=True)

    for tag in script_tags:
        src = tag["src"]
        library_name, library_version = detect_library(src)

        if library_name and library_version:
            dep_info = {
                "library": library_name,
                "version": library_version,
                "source": src
            }
            results["dependencies"].append(dep_info)

            # Check for known vulnerabilities
            if library_name in KNOWN_VULNS and library_version in KNOWN_VULNS[library_name]:
                vuln = {
                    "issue": f"Vulnerable {library_name} version detected",
                    "evidence": f"{library_name} {library_version} at {src} - {KNOWN_VULNS[library_name][library_version]}",
                    "severity": "High"
                }
                results["vulnerabilities"].append(vuln)
            else:
                results["dependencies"][-1]["status"] = "No known vulnerabilities in local database"
        else:
            results["dependencies"].append({
                "library": "Unknown",
                "version": None,
                "source": src,
                "status": "Unrecognized or unversioned script"
            })

    # If no scripts found
    if not script_tags:
        results["note"] = "No JavaScript dependencies detected on the page."

    return results


def detect_library(src_url: str):
    """
    Detects library name and version from script URL using regex patterns.
    
    Args:
        src_url (str): Script source URL (e.g., 'jquery-3.3.1.min.js').
    
    Returns:
        tuple: (library_name, library_version) or (None, None) if undetected.
    """
    url_lower = src_url.lower()
    patterns = [
        (r"jquery-(\d+\.\d+\.\d+)", "jquery"),
        (r"react-(\d+\.\d+\.\d+)", "react"),
        (r"vue-(\d+\.\d+\.\d+)", "vue"),
        (r"bootstrap-(\d+\.\d+\.\d+)", "bootstrap"),
        (r"lodash[._-](\d+\.\d+\.\d+)", "lodash"),
        (r"angular-(\d+\.\d+\.\d+)", "angular"),
        (r"angularjs/(\d+\.\d+\.\d+)", "angular"),  # Alternative Angular pattern
    ]

    for pattern, lib_name in patterns:
        match = re.search(pattern, url_lower)
        if match:
            return (lib_name, match.group(1))

    # Fallback for unversioned or CDN-hosted scripts
    if "jquery" in url_lower:
        return ("jquery", "unknown")
    if "react" in url_lower:
        return ("react", "unknown")
    if "vue" in url_lower:
        return ("vue", "unknown")
    if "bootstrap" in url_lower:
        return ("bootstrap", "unknown")
    if "lodash" in url_lower:
        return ("lodash", "unknown")
    if "angular" in url_lower:
        return ("angular", "unknown")

    return (None, None)