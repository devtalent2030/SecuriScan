export async function scanUrl(url: string, scanType: string) {
    const response = await fetch(`http://127.0.0.1:5001/check_${scanType}`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  
    return response.json();
  }