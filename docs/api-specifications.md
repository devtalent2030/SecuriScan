### api-specifications.md`  API documentation **and** the real testing examples.
---

```markdown
# SecuriScan API - Documentation

## 1️⃣ Overview
SecuriScan is a security scanner that:
- Crawls a target website.
- Checks for **SQL Injection** vulnerabilities.
- Checks for **XSS (Cross-Site Scripting)** vulnerabilities.
- Returns results in **JSON format**.

---

## 2️⃣ Endpoints

### 🔹 1. Health Check
- **URL:** `GET /ping`  
- **Description:** Checks if the API is running.  
- **Example Response:**
  ```json
  {
    "status": "ok"
  }
  ```

---

### 🔹 2. Crawl a Website
- **URL:** `POST /crawl`
- **Body**:
  ```json
  {
    "url": "http://example.com"
  }
  ```
- **Example Response**:
  ```json
  {
    "action": "crawl",
    "url": "http://example.com",
    "found_urls": [
      "http://example.com/page1",
      "http://example.com/page2"
    ]
  }
  ```

---

### 🔹 3. SQL Injection Check
- **URL:** `POST /check_sql`
- **Body**:
  ```json
  {
    "url": "http://test.com"
  }
  ```
- **Example Response**:
  ```json
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
  ```

---

### 🔹 4. XSS Check
- **URL:** `POST /check_xss`
- **Body**:
  ```json
  {
    "url": "http://test.com"
  }
  ```
- **Example Response**:
  ```json
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
  ```

---

### 🔹 5. Scan History
- **URL:** `GET /scan_history`
- **Description:** Returns a list of all past scans.
- **Example Response**:
  ```json
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
  ```

---

## 3️⃣ Deployment

### Run Locally
```bash
source venv/bin/activate
python app/app.py
```

### Run with Docker
```bash
docker-compose up --build
```

---

## 4️⃣ Real Testing Examples

Below are real testing examples that confirm the scanner is working as intended:

---

### ✅ 1. Testing the Crawler with a Real Site
For a site that contains many links, try:
```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"url":"http://books.toscrape.com/"}' \
http://127.0.0.1:5000/crawl
```
<details>
<summary>Example JSON Response</summary>

```json
{
  "action": "crawl",
  "found_urls": [
    "http://books.toscrape.com/index.html",
    "http://books.toscrape.com/catalogue/category/books/philosophy_7/index.html",
    "http://books.toscrape.com/catalogue/category/books_1/index.html",
    "http://books.toscrape.com/catalogue/category/books/mystery_3/index.html",
    "http://books.toscrape.com/catalogue/category/books/sequential-art_5/index.html",
    "http://books.toscrape.com/catalogue/category/books/classics_6/index.html",
    "http://books.toscrape.com/catalogue/category/books/romance_8/index.html",
    "http://books.toscrape.com/",
    "http://books.toscrape.com/catalogue/category/books/historical-fiction_4/index.html",
    "http://books.toscrape.com/catalogue/category/books/travel_2/index.html"
  ],
  "url": "http://books.toscrape.com/"
}
```
</details>

---

### ✅ 2. Testing SQL Injection Check
```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"url":"http://test.com"}' \
http://127.0.0.1:5000/check_sql
```
<details>
<summary>Example JSON Response</summary>

```json
{
  "action": "check_sql",
  "sql_vulnerabilities": [
    {
      "payload": "' OR 'a'='a",
      "vulnerable": false
    },
    {
      "payload": "admin'--",
      "vulnerable": false
    },
    {
      "payload": "' OR IF(1=1, SLEEP(3), 0) --",
      "vulnerable": true,
      "evidence": "Response time delay detected (possible blind SQL injection)"
    }
  ],
  "url": "http://test.com"
}
```
</details>

---

### ✅ 3. Testing XSS Check
```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"url":"http://test.com"}' \
http://127.0.0.1:5000/check_xss
```
<details>
<summary>Example JSON Response</summary>

```json
{
  "action": "check_xss",
  "url": "http://test.com",
  "xss_vulnerabilities": [
    {
      "payload": "<svg/onload=alert('XSS')>",
      "vulnerable": false
    }
  ]
}
```
</details>

---

### ✅ 4. Checking the Scan History
```bash
curl -X GET http://127.0.0.1:5000/scan_history
```
<details>
<summary>Example JSON Response</summary>

```json
{
  "history": [
    {
      "action": "crawl",
      "url": "http://books.toscrape.com/",
      "found_urls": [
        "http://books.toscrape.com/index.html",
        "http://books.toscrape.com/catalogue/category/books/philosophy_7/index.html",
        ...
      ]
    },
    {
      "action": "check_sql",
      "url": "http://test.com",
      "sql_vulnerabilities": []
    },
    {
      "action": "check_xss",
      "url": "http://test.com",
      "xss_vulnerabilities": []
    }
  ]
}
```
</details>
```

---
