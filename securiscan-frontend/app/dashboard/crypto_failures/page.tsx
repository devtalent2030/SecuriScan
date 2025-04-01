"use client";

import React, { useState } from "react";
import { scanUrl } from "../../api/scan";
import CryptoFailuresReport from "../../../components/CryptoFailuresReport";
import { ChevronDown, ChevronUp, AlertTriangle, X, Minimize2 } from "lucide-react";

// Type definitions
interface Vulnerability {
  issue: string;
  severity: string;
  evidence?: string;
}

interface CertificateInfo {
  issuer: string;
  subject: string;
  not_before: string;
  not_after: string;
  expired: boolean;
  error?: string;
}

interface TLSInfo {
  version: string;
  cipher: string;
  error?: string;
}

interface CryptoFailuresScanResult {
  url: string;
  vulnerabilities: Vulnerability[];
  certificate_info?: CertificateInfo;
  tls_info?: TLSInfo;
  exposed_data?: string[];
  error?: string;
  note?: string;
}

export default function CryptoFailuresPage() {
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<CryptoFailuresScanResult | null>(null);
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
      const data: CryptoFailuresScanResult = await scanUrl(url, "crypto_failures");
      setResult(data);
    } catch (error) {
      console.error("Crypto scan error:", error);
      setResult({ url, vulnerabilities: [], error: "Error running Cryptographic Failures scan." });
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
        <AlertTriangle className="mr-2" /> Crypto Failures Scanner
      </h1>
      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
        Activate this tool to detect <strong>Cryptographic Failures</strong> — insecure encryption, expired certificates,
        weak TLS setups, or data exposure. Enter a URL to scan for weaknesses.
      </p>

      {/* URL Input */}
      <div className="mb-8">
        <label className="block text-xl font-semibold mb-2">Target URL:</label>
        <input
          type="text"
          className="w-full p-4 border border-indigo-500 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-4 focus:ring-indigo-400 transition-all"
          placeholder="https://testphp.vulnweb.com"
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
        {loading ? "Scanning..." : "Run Crypto Scan"}
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                <p className="ml-3 text-gray-300">Scanning for vulnerabilities...</p>
              </div>
            ) : result ? (
              result.error ? (
                <p className="text-red-400 font-medium">{result.error}</p>
              ) : (
                <>
                  <CryptoFailuresReport results={result} />
                </>
              )
            ) : (
              <p className="text-gray-400 italic">Awaiting your command to scan for vulnerabilities.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
