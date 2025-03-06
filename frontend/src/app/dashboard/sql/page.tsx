"use client";
import { useState } from "react";
import { scanUrl } from "../../api/scan";

export default function SqlPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleScan() {
    if (!url) {
      alert("Please enter a URL.");
      return;
    }
    setLoading(true);
    setResult("");

    try {
      // "sql_injection" => your backend's endpoint
      const data = await scanUrl(url, "sql_injection");
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("SQL injection scan error:", error);
      setResult("Error running SQL injection scan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">SQL Injection Testing</h1>
      <div className="mb-4">
        <label className="block text-lg mb-2">Enter URL:</label>
        <input
          type="text"
          className="w-full p-2 border rounded bg-gray-300 dark:bg-gray-800"
          placeholder="http://testphp.vulnweb.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <button
        onClick={handleScan}
        className="bg-blue-600 px-4 py-2 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Scanning..." : "Run SQL Injection Scan"}
      </button>

      <div className="mt-6 p-4 bg-gray-300 dark:bg-gray-800 rounded min-h-[150px]">
        <h2 className="text-xl font-bold">Scan Results:</h2>
        {loading ? (
          <p className="text-gray-400">Scanning in progress...</p>
        ) : (
          <pre className="overflow-x-auto text-sm whitespace-pre-wrap">{result}</pre>
        )}
      </div>
    </div>
  );
}