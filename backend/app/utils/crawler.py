import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def crawl_website(start_url, max_pages=10):
    """
    Crawls a website starting from `start_url` and collects all internal links up to `max_pages`.
    
    Parameters:
        start_url (str): The starting URL of the website to crawl.
        max_pages (int): Maximum number of pages to visit, defaults to 10.
    
    Returns:
        list: A list of URLs found within the specified domain.
    
    This function is designed to perform a shallow web crawl to gather internal links. It avoids 
    external links and follows links only within the same domain to stay focused on the site of interest.
    """

    visited = set()  # A set to track visited URLs to avoid re-crawling the same page
    to_visit = [start_url]  # Queue of URLs to visit, starting with the initial URL
    domain = urlparse(start_url).netloc  # Extract the domain name to ensure internal navigation only

    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)  # Get the next URL to visit from the queue
        if url in visited:
            continue  # Skip URLs that have already been visited
        visited.add(url)  # Mark this URL as visited

        try:
            # Perform the web request with a timeout to avoid hanging on unresponsive pages
            response = requests.get(url, timeout=5)
            if response.status_code == 200:  # Check if the request was successful
                soup = BeautifulSoup(response.text, 'html.parser')

                # Find all 'a' tags with href attributes to extract links
                for link in soup.find_all('a', href=True):
                    full_url = urljoin(url, link['href'])  # Resolve relative links to absolute URLs
                    parsed_url = urlparse(full_url)

                    # Add only internal links that have not been visited to the queue
                    if parsed_url.netloc == domain and full_url not in visited:
                        to_visit.append(full_url)

        except requests.RequestException:
            # Handle exceptions for requests like timeouts and connection errors by skipping the URL
            pass

    return list(visited)  # Return the list of collected URLs as output from the function
