import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def crawl_website(start_url, max_pages=10):
    """
    Improved web crawler that collects internal URLs only.
    """
    visited = set()
    to_visit = [start_url]
    domain = urlparse(start_url).netloc  # Extract domain name to avoid external sites

    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)
        if url in visited:
            continue
        visited.add(url)

        try:
            response = requests.get(url, timeout=5)  # Add timeout for better reliability
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')

                for link in soup.find_all('a', href=True):
                    full_url = urljoin(url, link['href'])
                    parsed_url = urlparse(full_url)

                    # Only follow links within the same domain
                    if parsed_url.netloc == domain and full_url not in visited:
                        to_visit.append(full_url)

        except requests.RequestException:
            # Skip URL if request fails
            pass

    return list(visited)
