api-specifications.md.

📌 Create docs/api-specifications.md
markdown
Copy
Edit
# SecuriScan API - Documentation

## 1️⃣ Overview
SecuriScan is a security scanner that:
- Crawls a target website.
- Checks for **SQL Injection** vulnerabilities.
- Checks for **XSS (Cross-Site Scripting)** vulnerabilities.
- Returns results in **JSON format**.

## 2️⃣ Endpoints

### **🔹 1. Health Check**
- **URL:** `GET /ping`
- **Description:** Checks if the API is running.
- **Example Response:**
  ```json
  { "status": "ok" }
🔹 2. Crawl a Website
URL: POST /crawl
Body:
json
Copy
Edit
{ "url": "http://example.com" }
Example Response:
json
Copy
Edit
{
  "action": "crawl",
  "url": "http://example.com",
  "found_urls": [
    "http://example.com/page1",
    "http://example.com/page2"
  ]
}
🔹 3. SQL Injection Check
URL: POST /check_sql
Body:
json
Copy
Edit
{ "url": "http://test.com" }
Example Response:
json
Copy
Edit
{
  "action": "check_sql",
  "url": "http://test.com",
  "sql_vulnerabilities": [
    {
      "payload": "' OR '1'='1",
      "vulnerable": true,
      "evidence": "SQL error found in response"
    }
  ]
}
🔹 4. XSS Check
URL: POST /check_xss
Body:
json
Copy
Edit
{ "url": "http://test.com" }
Example Response:
json
Copy
Edit
{
  "action": "check_xss",
  "url": "http://test.com",
  "xss_vulnerabilities": [
    {
      "payload": "<script>alert('XSS')</script>",
      "vulnerable": true,
      "evidence": "Reflected script detected in response"
    }
  ]
}
🔹 5. Scan History
URL: GET /scan_history
Description: Returns a list of all past scans.
Example Response:
json
Copy
Edit
{
  "history": [
    {
      "action": "crawl",
      "url": "http://example.com",
      "found_urls": ["http://example.com/page1"]
    },
    {
      "action": "check_sql",
      "url": "http://test.com",
      "sql_vulnerabilities": []
    }
  ]
}
3️⃣ Deployment
Run Locally

bash
Copy
Edit
source venv/bin/activate
python app/app.py
Run with Docker

bash
Copy
Edit
docker-compose up --build