// frontend/app/api/scan.ts
export async function scanUrl(url: string, scanType: string) {
  try {
    const endpointMap: Record<string, string> = {
      sql: "sql_injection",
      xss: "xss",
      csrf: "csrf",
      directory_enum: "dirs", // ✅ maps to /check_dirs
      // add others like rce, ssrf etc here as needed
    };

    const endpoint = endpointMap[scanType] || scanType;
    const response = await fetch(`http://127.0.0.1:5001/check_${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Scan error for ${scanType}:`, error);
    throw error;
  }
}
