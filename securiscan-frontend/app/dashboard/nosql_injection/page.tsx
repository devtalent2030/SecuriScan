"use client";

import React, { useState } from "react";
import { scanUrl } from "../../api/scan";
import NosqlInjectionReport from "../../../components/NosqlInjectionReport";
import { NosqlInjectionScanResult } from "../types";
import { ChevronDown, ChevronUp, Database, X, Minimize2, Copy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { jsPDF } from "jspdf";

export default function NosqlInjectionPage() {
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<NosqlInjectionScanResult | null>(null);
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
      const data: NosqlInjectionScanResult = await scanUrl(url, "nosql");
      setResult(data);
    } catch (error) {
      console.error("NoSQL injection scan error:", error);
      setResult({ error: "Error running NoSQL injection scan." });
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

  // Function to copy example URL to clipboard
  const copyExampleUrl = () => {
    navigator.clipboard.writeText("http://juice-shop.herokuapp.com/rest/user/login");
    alert("URL copied to clipboard!");
  };

  // Function to download report as PDF
  const downloadPdf = () => {
    if (!result) return;

    const doc = new jsPDF();
    let yPos = 10;

    // Add title
    doc.setFontSize(16);
    doc.text("NoSQL Injection Report", 10, yPos);
    yPos += 10;

    // Scan Summary
    doc.setFontSize(12);
    doc.text("1. Scan Summary", 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.text(`Scan ID: NOSQL-${new Date().getTime()}`, 15, yPos);
    yPos += 5;
    doc.text(`Target URL: ${result.url || "N/A"}`, 15, yPos);
    yPos += 5;
    doc.text(`Scan Date: ${new Date().toLocaleString()}`, 15, yPos);
    yPos += 5;
    doc.text("Scanner Version: SecuriScan v1.0.0", 15, yPos);
    yPos += 10;

    // Vulnerabilities
    doc.setFontSize(12);
    doc.text("2. Detected NoSQL Injection Vulnerabilities", 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    if (result.error) {
      doc.text(result.error, 15, yPos);
    } else if (result.vulnerabilities && result.vulnerabilities.length > 0) {
      doc.text(`Found ${result.vulnerabilities.length} potential vulnerability(s).`, 15, yPos);
      yPos += 5;
      result.vulnerabilities.forEach((vuln, idx) => {
        doc.text(`${idx + 1}. Issue: ${vuln.issue}`, 15, yPos);
        yPos += 5;
        doc.text(`   Severity: ${vuln.severity || "Low"}`, 15, yPos);
        yPos += 5;
        if (vuln.evidence) {
          doc.text(`   Evidence: ${vuln.evidence}`, 15, yPos);
          yPos += 5;
        }
      });
    } else {
      doc.text("No NoSQL injection vulnerabilities detected.", 15, yPos);
    }

    doc.save(`NoSQL-Injection-Report-${new Date().getTime()}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 rounded-2xl shadow-2xl animate-gradient text-white">
      <h1 className="text-4xl font-extrabold mb-4 tracking-wider flex items-center">
        <Database className="mr-2" /> NoSQL Injection Scanner
      </h1>
      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
        Unleash this cutting-edge tool to detect <strong>NoSQL Injection</strong> vulnerabilities in apps using NoSQL databases (e.g., MongoDB). Probe for query manipulation, data leaks, and blind injections. Enter a URL to dive into the database abyss.
      </p>

      <div className="mb-8">
        <label className="block text-xl font-semibold mb-2 flex items-center">
          Target URL:
          <button
            onClick={copyExampleUrl}
            className="ml-2 text-indigo-400 hover:text-indigo-200"
            title="Copy example URL"
          >
            <Copy size={18} />
          </button>
        </label>
        <input
          type="text"
          className="w-full p-4 border border-indigo-500 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-4 focus:ring-indigo-400 transition-all"
          placeholder="http://juice-shop.herokuapp.com/rest/user/login"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <button
        onClick={handleScan}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 rounded-lg text-white font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg transform hover:scale-105"
        disabled={loading}
      >
        {loading ? "Scanning..." : "Launch NoSQL Scan"}
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
            {result && (
              <button
                onClick={downloadPdf}
                className="text-purple-400 hover:text-purple-200"
                title="Download PDF"
              >
                Download PDF
              </button>
            )}
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
                <p className="ml-3 text-gray-300">Scanning the NoSQL void...</p>
              </div>
            ) : result ? (
              result.error ? (
                <p className="text-red-400 font-medium">{result.error}</p>
              ) : (
                <>
                  <NosqlInjectionReport results={result} />
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
                      {result.vulnerable_params && result.vulnerable_params.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold">Vulnerable Parameters:</h3>
                          <ul className="text-gray-300 list-disc pl-5">
                            {result.vulnerable_params.map((param, index) => (
                              <li key={index}>
                                <span className="font-medium">{param.param}</span> - Payload: {param.payload || "N/A"}
                                {param.vulnerable && <span className="text-red-400"> (Vulnerable)</span>}
                                {param.evidence && ` - Evidence: ${param.evidence.slice(0, 20)}...`}
                                {param.method && ` - Method: ${param.method}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.detected_endpoints && result.detected_endpoints.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold">Detected Vulnerable Endpoints:</h3>
                          <ul className="list-disc pl-5 text-gray-300">
                            {result.detected_endpoints.map((endpoint, index) => (
                              <li key={index}>
                                <span className="font-medium">{endpoint.method}</span>:{" "}
                                <a href={endpoint.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                                  {endpoint.url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.time_based_test && (
                        <div>
                          <h3 className="text-lg font-semibold">Time-Based Test:</h3>
                          <p className={result.time_based_test.vulnerable ? "text-red-400" : "text-green-400"}>
                            {result.time_based_test.vulnerable ? "Vulnerable" : "Not Vulnerable"}
                            {result.time_based_test.payload && ` - Payload: ${result.time_based_test.payload}`}
                            {result.time_based_test.evidence && ` - Evidence: ${result.time_based_test.evidence.slice(0, 20)}...`}
                            {result.time_based_test.note && ` - Note: ${result.time_based_test.note}`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            ) : (
              <p className="text-gray-400 italic">Awaiting your command to scan the digital frontier.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}