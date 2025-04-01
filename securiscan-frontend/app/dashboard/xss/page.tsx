"use client";

import React, { useState } from "react";
import { scanUrl } from "../../api/scan";
import XSSReport from "../../../components/XSSReport";
import { ChevronDown, ChevronUp, Code, X, Minimize2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Type definitions for XSS scan result
interface VulnerableParam {
  param: string;
  payload: string;
  vulnerable: boolean;
  evidence?: string;
}

interface TimeBasedTest {
  payload: string;
  vulnerable: boolean;
  evidence?: string;
  note?: string;
}

interface XSSScanResult {
  action: string;
  url: string;
  vulnerable_params: VulnerableParam[];
  time_based_test?: TimeBasedTest | null;
  error?: string;
  note?: string;
}

export default function XssPage() {
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<XSSScanResult | null>(null);
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
      const data: XSSScanResult = await scanUrl(url, "xss");
      setResult(data);
    } catch (error) {
      console.error("XSS scan error:", error);
      setResult({
        action: "check_xss",
        url,
        vulnerable_params: [],
        time_based_test: null,
        error: "Error running XSS scan.",
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

  const severityData =
    result?.vulnerable_params?.map((v) => ({
      issue: `${v.param}=${v.payload.slice(0, 10)}...`,
      severity: v.vulnerable ? 4 : 1,
    })) || [];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 rounded-2xl shadow-2xl animate-gradient text-white">
      {/* Page Header */}
      <h1 className="text-4xl font-extrabold mb-4 tracking-wider flex items-center">
        <Code className="mr-2" /> XSS Scanner
      </h1>
      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
        Activate this tool to detect <strong>Cross-Site Scripting (XSS)</strong> vulnerabilities—code injection
        weaknesses that allow attackers to run malicious scripts in a user’s browser. Paste a URL to test.
      </p>

      {/* URL Input */}
      <div className="mb-8">
        <label className="block text-xl font-semibold mb-2">Target URL:</label>
        <input
          type="text"
          className="w-full p-4 border border-indigo-500 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-4 focus:ring-indigo-400 transition-all"
          placeholder="http://testphp.vulnweb.com/search.php?test=query"
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
        {loading ? "Scanning..." : "Run XSS Scan"}
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
                <p className="ml-3 text-gray-300">Scanning for vulnerabilities...</p>
              </div>
            ) : result ? (
              result.error ? (
                <p className="text-red-400 font-medium">{result.error}</p>
              ) : (
                <>
                  <XSSReport results={result} />

                  {showDetails && severityData.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold">Vulnerability Severity (Chart)</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={severityData}>
                          <XAxis dataKey="issue" stroke="#fff" />
                          <YAxis stroke="#fff" />
                          <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
                          <Bar dataKey="severity" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
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
