How to Clone and Checkout dev:

bash
Copy
Edit
git clone https://github.com/<username>/SecuriScan
cd SecuriScan
git checkout dev
How to Set Up the Virtual Environment:

bash
Copy
Edit
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
(Optional) Docker Instructions:

bash
Copy
Edit
docker build -t securiscan-backend .
docker run -p 5000:5000 securiscan-backend