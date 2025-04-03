import requests
from bs4 import BeautifulSoup
import re
import logging
from urllib.parse import urlparse, urljoin
from flask import Flask, request, jsonify
from flask_cors import CORS

logging.basicConfig(level=logging.DEBUG)

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
    results = {
        "action": "scan_dependencies",
        "url": url,
        "dependencies": [],
        "vulnerabilities": [],
        "debug": []
    }

    logging.debug(f"Starting scan for {url}")
    try:
        response = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"}, allow_redirects=True, verify=False)
        response.raise_for_status()
        final_url = response.url
        results["url"] = final_url
        results["debug"].append(f"Response status: {response.status_code}, Final URL: {final_url}")
        results["debug"].append(f"HTML snippet: {response.text[:200]}...")
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
    results["debug"].append(f"Found {len(script_tags)} script tags with src")

    inline_scripts = soup.find_all("script", src=False)
    inline_content = " ".join(script.get_text() for script in inline_scripts).lower()
    results["debug"].append(f"Found {len(inline_scripts)} inline script tags")
    if inline_scripts:
        results["debug"].append(f"Inline content sample: {inline_content[:100]}...")

    for tag in script_tags:
        src = tag["src"]
        if not src.startswith(("http://", "https://")):
            src = urljoin(final_url, src)
        logging.debug(f"Processing script: {src}")
        library_name, library_version = detect_library(src)

        if library_name and library_version:
            dep_info = {
                "library": library_name,
                "version": library_version,
                "source": src
            }
            results["dependencies"].append(dep_info)

            if library_name in KNOWN_VULNS and library_version in KNOWN_VULNS[library_name]:
                vuln = {
                    "issue": f"Vulnerable {library_name} version detected",
                    "evidence": f"{library_name} {library_version} at {src} - {KNOWN_VULNS[library_name][library_version]}",
                    "severity": "High"
                }
                results["vulnerabilities"].append(vuln)
                dep_info["status"] = "Known vulnerability detected"
            else:
                dep_info["status"] = "No known vulnerabilities in local database"
        else:
            results["dependencies"].append({
                "library": "Unknown",
                "version": None,
                "source": src,
                "status": "Unrecognized or unversioned script"
            })

    inline_patterns = {
        "jquery": r"jquery|\$\(|\.ajax",
        "react": r"react\.|reactdom",
        "vue": r"vue\.|\bv-bind\b",
        "bootstrap": r"bootstrap|\.modal",
        "lodash": r"lodash|_[\.\[]",
        "angular": r"angular\.|ng-",
    }
    for lib, pattern in inline_patterns.items():
        if re.search(pattern, inline_content):
            results["dependencies"].append({
                "library": lib,
                "version": "unknown (inline)",
                "source": "Inline script",
                "status": "Version not detectable; manual review required"
            })
            results["debug"].append(f"Detected {lib} usage in inline script via pattern: {pattern}")

    if not script_tags and not any(re.search(pattern, inline_content) for pattern in inline_patterns.values()):
        results["note"] = "No JavaScript dependencies detected on the page."

    return results

def detect_library(src_url: str):
    url_lower = src_url.lower()
    patterns = [
        (r"jquery-(\d+\.\d+\.\d+)", "jquery"),
        (r"react-(\d+\.\d+\.\d+)", "react"),
        (r"vue-(\d+\.\d+\.\d+)", "vue"),
        (r"bootstrap-(\d+\.\d+\.\d+)", "bootstrap"),
        (r"lodash[._-](\d+\.\d+\.\d+)", "lodash"),
        (r"angular-(\d+\.\d+\.\d+)", "angular"),
        (r"angularjs/(\d+\.\d+\.\d+)", "angular"),
    ]

    for pattern, lib_name in patterns:
        match = re.search(pattern, url_lower)
        if match:
            return (lib_name, match.group(1))

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

app = Flask(__name__)
CORS(app)

@app.route("/check_dependencies", methods=["POST"])
def dependency_scan():
    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({"error": "Missing URL in request"}), 400
    url = data["url"]
    try:
        results = scan_website_js_libraries(url)
        logging.info(f"Dependency scan completed for {url}")
        return jsonify(results)
    except Exception as e:
        logging.error(f"Error in dependency scan: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)