"use client";
import { useState } from "react";
import { scanUrl } from "../../api/scan";

export default function DependencyScannerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleScan() {
    if (!url) {
      alert("Please enter a URL for scanning JS libraries!");
      return;
    }
    setLoading(true);
    setResult("");

    try {
      const data = await scanUrl(url, "dependencies"); // pass user’s URL
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Dependency Scanner error:", error);
      setResult("Error running Dependency Scanner.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dependency Scanner</h1>

      <div className="mb-4">
        <label className="block text-lg mb-2">Enter Website URL:</label>
        <input
          type="text"
          className="w-full p-2 border rounded bg-gray-800 text-white"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <button
        onClick={handleScan}
        className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
      >
        {loading ? "Scanning..." : "Run Dependency Scan"}
      </button>

      <div className="mt-6 p-4 bg-gray-800 rounded min-h-[150px]">
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