# **SecuriScan** 🚀🔍

### **SecuriScan is an , automated website security vulnerability scanner designed to identify and mitigate risks aligned with the OWASP Top 10**

![SecuriScan Banner](/securiscan-frontend/public/images/securiscan1.png)

## **📌 Overview**
SecuriScan is for anyone who has a website and wants to keep it safe from hackers—without needing to be a tech expert.,,, SecuriScan targets a broad audience within the web ecosystem, focusing on stakeholders who need robust, automated security testing without deep technical overhead.

SecuriScan enables:
- **Automated website crawling** to discover security loopholes.
- **Penetration testing tools** to simulate real-world attacks.
- **Detailed security reports** with actionable remediation steps.
- **Scalability & containerized deployment** using **Docker & AWS**.

---

## **🛠 Tech Stack**
### **Backend** 🖥️
- **Framework**: Flask (Python)
- **Web Scraping**: BeautifulSoup, Requests
- **Security Analysis**: Scapy, Nmap, OWASP Guidelines
- **Logging & Monitoring**: Python Logging, CloudWatch

### **Frontend** 🎨
- **Framework**: Next.js (React + TypeScript)
- **State Management**: React Query
- **UI Library**: Tailwind CSS / Material UI
- **Visualization**: Chart.js (for risk metrics & reports)

### **Deployment & Infrastructure** 🚀
- **Containerization**: Docker & Docker Compose
- **Cloud Hosting**: AWS EC2 / Vercel
- **Security Compliance**: HTTPS, JWT Authentication, Role-Based Access Control

---

## **📂 Project Structure**

```
SecuriScan/
├── backend/             # Python-based security scanner API
│   ├── app/
│   │   ├── routes/      # API endpoints
│   │   ├── utils/       # Security analysis scripts
│   │   ├── app.py       # Main application file
│   ├── tests/           # Automated testing for backend APIs
│   ├── requirements.txt # Python dependencies
│   ├── Dockerfile       # Backend containerization
│   └── ...
│
├── frontend/            # Next.js frontend for UI
│   ├── src/
│   │   ├── components/  # Reusable UI elements
│   │   ├── pages/       # Next.js pages for routing
│   │   ├── styles/      # CSS & Tailwind configuration
│   │   ├── api.ts       # API service layer
│   ├── package.json     # Frontend dependencies
│   ├── Dockerfile       # Frontend containerization
│   └── ...
│
├── docs/                # Documentation & API specifications
│   ├── architecture.md  # System design documentation
│   ├── api-specifications.md # API details
│   ├── setup.md         # Installation & setup guide
│   └── README.md        # Project introduction (this file)
│
├── docker-compose.yml   # Configuration for multi-service deployment
├── .gitignore           # Ignore unnecessary files in Git
└── README.md            # Project overview
```

---

## **🚀 Features**
✔ **Automated Website Crawling**: Extract URLs and analyze website structure.  
✔ **SQL Injection Detection**: Identify SQLi vulnerabilities with AI-driven payloads.  
✔ **Cross-Site Scripting (XSS) Scanner**: Detect XSS risks in web applications.   
✔ **Real-Time Reporting**: Interactive dashboards and PDF/JSON/HTML reports.  
✔ **Role-Based Access Control**: Secure authentication and access levels.  
✔ **Scalability with Docker & Cloud**: Easily deployable on AWS or any cloud provider.

---

## **📦 Installation & Setup**
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/devtalent2030/SecuriScan.git
cd SecuriScan
```

### **2️⃣ Backend Setup**
```sh
cd backend
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
~python app/app.py~
```

### **3️⃣ Frontend Setup**
```sh
cd ../frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

### **4️⃣ Running with Docker**
```sh
docker-compose up --build
```

---

## **🛠 API Endpoints**
| Method | Endpoint       | Description |
|--------|---------------|-------------|
| **POST** | `/crawl` | Crawls a website to collect URLs |
| **POST** | `/check_sql` | Scans for SQL injection vulnerabilities |
| **POST** | `/check_xss` | Checks for XSS vulnerabilities |
| **GET** | `/scan_history` | Fetches scan history |
| **GET** | `/ping` | API health check |


---
## 📸 Screenshots

Below are a few sample screenshots from the application. Make sure the image files are placed in your repo (e.g., in `public/images/`) and update the paths accordingly.

### 🏠 Homepage
![SecuriScan Homepage](/securiscan-frontend/public/images/home.png)

### 💉 SQL Injection Scan
![SQL Injection Scanner](/securiscan-frontend/public/images/SQLInjection.png)

### 🔁 CSRF Scanner
![CSRF Scanner](/securiscan-frontend/public/images/CSRFScanner.png)

### 🌐 SSRF Scanner
![SSRF Scanner](/securiscan-frontend/public/images/SSRFScanner.png)

### 🔐 Authentication Failures
![Authentication Failures](/securiscan-frontend/public/images/AuthenticationFailures.png)

### ⚙️ Security Misconfiguration
![Security Misconfiguration](/securiscan-frontend/public/images/SecurityMisconfiguration.png)



## **🔒 Security & Compliance**
SecuriScan adheres to **OWASP Top 10** guidelines to ensure robust security analysis.  
- Encrypted communication via **HTTPS**
- Authentication with **JWT**
- Secure storage with **PostgreSQL & AWS Secrets Manager**
- Continuous vulnerability scanning

**Note**: This tool is intended for ethical security analysis. Unauthorized scanning of external websites is illegal.

---

## **📞 Support & Contact**
For issues, feature requests, or general inquiries, feel free to:  
📌 Open an issue on **[GitHub Issues](https://github.com/devtalent2030/SecuriScan/issues)**  
📌 Reach out to **Talent Nyota (Backend & AI Specialist)** and **Alexzander Saddler (Frontend Developer)**  

---

## **📜 License**
SecuriScan is licensed under the **MIT License**. See **[LICENSE](./LICENSE)** for more details.

