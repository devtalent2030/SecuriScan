import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection settings
DB_HOST = os.environ.get("DB_HOST", os.getenv('DB_HOST'))
DB_NAME = os.environ.get("DB_NAME", os.getenv('DB_NAME'))
DB_USER = os.environ.get("DB_USER", os.getenv('DB_USER'))
DB_PASS = os.environ.get("DB_PASS", os.getenv('DB_PASS'))
DB_PORT = os.environ.get("DB_PORT", os.getenv('DB_PORT'))

def get_connection():
    """Establishes and returns a PostgreSQL database connection."""
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    return conn

def init_db():
    """Initializes database tables if they don't exist."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # ✅ Existing vulnerabilities table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vulnerabilities (
            id SERIAL PRIMARY KEY,
            url TEXT NOT NULL,
            vulnerability_type TEXT NOT NULL,
            payload TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')

    # ✅ Existing discovered_links table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS discovered_links (
            id SERIAL PRIMARY KEY,
            root_url TEXT NOT NULL,
            discovered_url TEXT NOT NULL,
            crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')

    # ✅ NEW: Add table for directory enumeration results
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS discovered_directories (
            id SERIAL PRIMARY KEY,
            root_url TEXT NOT NULL,
            directory TEXT NOT NULL,
            status_code INTEGER NOT NULL,
            discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')

    conn.commit()
    cursor.close()
    conn.close()

def store_crawled_links(root_url, links_list):
    """
    Inserts each link from links_list into discovered_links,
    skipping duplicates for that root_url.
    """
    conn = get_connection()
    cursor = conn.cursor()

    for link in links_list:
        # Check if this (root_url, discovered_url) already exists
        cursor.execute('''
            SELECT COUNT(*) 
            FROM discovered_links 
            WHERE root_url = %s AND discovered_url = %s
        ''', (root_url, link))
        count = cursor.fetchone()[0]

        if count == 0:
            cursor.execute('''
                INSERT INTO discovered_links (root_url, discovered_url)
                VALUES (%s, %s)
            ''', (root_url, link))

    conn.commit()
    cursor.close()
    conn.close()

def store_discovered_directories(root_url, directories):
    """
    Inserts each discovered directory into discovered_directories,
    skipping duplicates for that root_url.
    """
    conn = get_connection()
    cursor = conn.cursor()

    for directory in directories:
        cursor.execute('''
            SELECT COUNT(*) 
            FROM discovered_directories 
            WHERE root_url = %s AND directory = %s
        ''', (root_url, directory["url"]))
        count = cursor.fetchone()[0]

        if count == 0:
            cursor.execute('''
                INSERT INTO discovered_directories (root_url, directory, status_code)
                VALUES (%s, %s, %s)
            ''', (root_url, directory["url"], directory["status_code"]))

    conn.commit()
    cursor.close()
    conn.close()