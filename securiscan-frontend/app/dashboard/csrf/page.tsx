"use client";

import React, { useState } from "react";
import { scanUrl } from "../../api/scan";
import CSRFReport from "../../../components/CSRFReport";
import { CSRFScanResult } from "../types";
import { ChevronDown, ChevronUp, ShieldOff, X, Minimize2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CsrfPage() {
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<CSRFScanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showResultsPanel, setShowResultsPanel] = useState<boolean>(true);

  async function handleScan() {
    if (!url) {
      alert("Please enter a URL.");
      return;
    }
    setLoading(true);
    setResult(null);
    setShowResultsPanel(true);

    try {
      const data: CSRFScanResult = await scanUrl(url, "csrf");
      setResult(data);
    } catch (error) {
      console.error("CSRF scan error:", error);
      setResult({ error: `Failed to scan: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setLoading(false);
    }
  }

  const handleExit = () => {
    setResult(null);
    setShowDetails(false);
  };

  const toggleResultsPanel = () => {
    setShowResultsPanel(!showResultsPanel);
  };

  const severityData = result?.vulnerabilities?.map(v => ({
    issue: v.issue.slice(0, 10) + "...",
    severity: ["Low", "Medium", "High", "Critical"].indexOf(v.severity || "Low") + 1
  })) || [];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 rounded-2xl shadow-2xl animate-gradient text-white">
      <h1 className="text-4xl font-extrabold mb-4 tracking-wider flex items-center">
        <ShieldOff className="mr-2" /> CSRF Scanner
      </h1>
      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
        Activate this tool to detect <strong>Cross-Site Request Forgery (CSRF)</strong> vulnerabilities—gaps that let attackers trick users into unwanted actions like money transfers. Enter a URL to scan for risks.
      </p>

      <div className="mb-8">
        <label className="block text-xl font-semibold mb-2">Target URL:</label>
        <input
          type="text"
          className="w-full p-4 border border-indigo-500 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-4 focus:ring-indigo-400 transition-all"
          placeholder="http://testasp.vulnweb.com/login.asp"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <button
        onClick={handleScan}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 rounded-lg text-white font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg transform hover:scale-105"
        disabled={loading}
      >
        {loading ? "Scanning..." : "Run CSRF Scan"}
      </button>

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
            <button onClick={toggleResultsPanel} className="text-gray-400 hover:text-gray-200" title={showResultsPanel ? "Minimize" : "Expand"}>
              {showResultsPanel ? <Minimize2 size={24} /> : <ChevronUp size={24} />}
            </button>
          </div>
        </div>
        {showResultsPanel && (
          <div className="p-6 pt-0 animate-fade-in">
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"></path>
                </svg>
                <p className="ml-3 text-gray-300">Scanning for forgery...</p>
              </div>
            ) : result ? (
              result.error ? (
                <p className="text-red-400 font-medium">{result.error}</p>
              ) : (
                <>
                  <CSRFReport results={result} />

                  {showDetails && (
                    <div className="mt-6">
                      {severityData.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold">Vulnerability Severity</h3>
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
                    </div>
                  )}
                </>
              )
            ) : (
              <p className="text-gray-400 italic">Awaiting your command to scan for forgery.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}