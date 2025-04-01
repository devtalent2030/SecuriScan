"use client";

import React, { useState } from "react";
import { scanUrl } from "../../api/scan";
import SsrfReport from "../../../components/SsrfReport";
import { ChevronDown, ChevronUp, AlertTriangle, X, Minimize2 } from "lucide-react";

// Type definitions for SSRF scan result
interface SsrfVuln {
  issue: string;
  severity: string;
  evidence?: string;
}

interface SsrfScanResult {
  action?: string;
  url: string;
  vulnerabilities: SsrfVuln[];
  tested_urls?: string[];
  error?: string;
  note?: string;
}

export default function SsrfPage() {
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<SsrfScanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showResultsPanel, setShowResultsPanel] = useState<boolean>(true);

  const handleScan = async () => {
    if (!url) {
      alert("Please enter a URL.");
      return;
    }

    setLoading(true);
    setResult(null);
    setShowResultsPanel(true);

    try {
      const data: SsrfScanResult = await scanUrl(url, "ssrf");
      setResult(data);
    } catch (error) {
      console.error("SSRF scan error:", error);
      setResult({
        url,
        vulnerabilities: [],
        tested_urls: [],
        error: "Error running SSRF scan.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    setResult(null);
    setShowDetails(false);
  };

  const toggleResultsPanel = () => {
    setShowResultsPanel(!showResultsPanel);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 rounded-2xl shadow-2xl animate-gradient text-white">
      {/* Page Header */}
      <h1 className="text-4xl font-extrabold mb-4 tracking-wider flex items-center">
        <AlertTriangle className="mr-2" /> SSRF Scanner
      </h1>
      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
        Activate this tool to detect <strong>Server-Side Request Forgery (SSRF)</strong> vulnerabilities—flaws allowing attackers to trick the server into accessing internal resources. Paste a URL to begin scanning.
      </p>

      {/* URL Input */}
      <div className="mb-8">
        <label className="block text-xl font-semibold mb-2">Target URL:</label>
        <input
          type="text"
          className="w-full p-4 border border-indigo-500 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-4 focus:ring-indigo-400 transition-all"
          placeholder="http://testphp.vulnweb.com/redir.php"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* Scan Button */}
      <button
        onClick={handleScan}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 rounded-lg text-white font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg transform hover:scale-105"
        disabled={loading}
      >
        {loading ? "Scanning..." : "Run SSRF Scan"}
      </button>

      {/* Results Panel */}
      <div className="mt-10 bg-gray-900 bg-opacity-80 rounded-lg shadow-inner relative transition-all duration-300">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Scan Results</h2>
          <div className="flex items-center space-x-4">
            {result && !result.error && (
              <button onClick={() => setShowDetails(!showDetails)} className="text-indigo-400 hover:text-indigo-200">
                {showDetails ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            )}
            {result && (
              <button onClick={handleExit} className="text-red-400 hover:text-red-200" title="Exit Scan">
                <X size={24} />
              </button>
            )}
            <button
              onClick={toggleResultsPanel}
              className="text-gray-400 hover:text-gray-200"
              title={showResultsPanel ? "Minimize" : "Expand"}
            >
              {showResultsPanel ? <Minimize2 size={24} /> : <ChevronUp size={24} />}
            </button>
          </div>
        </div>

        {showResultsPanel && (
          <div className="p-6 pt-0 animate-fade-in">
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  ></path>
                </svg>
                <p className="ml-3 text-gray-300">Scanning for SSRF vulnerabilities...</p>
              </div>
            ) : result ? (
              result.error ? (
                <p className="text-red-400 font-medium">{result.error}</p>
              ) : (
                <>
                  <SsrfReport results={result} />
                  {showDetails && result.tested_urls && result.tested_urls.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold">Tested Payloads:</h3>
                      <ul className="text-gray-300 list-disc pl-5">
                        {result.tested_urls.map((testUrl, index) => (
                          <li key={index}>
                            <a
                              href={testUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:underline"
                            >
                              {testUrl}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )
            ) : (
              <p className="text-gray-400 italic">Awaiting your command to test for SSRF...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
