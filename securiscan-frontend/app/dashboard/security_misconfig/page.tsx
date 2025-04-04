"use client";

import React, { useState } from "react";
import { scanUrl } from "../../api/scan";
import SecurityMisconfigReport from "../../../components/SecurityMisconfigReport";
import { ChevronDown, ChevronUp, AlertTriangle, X, Minimize2, Copy } from "lucide-react";
import { jsPDF } from "jspdf";

// Type definitions for Security Misconfig result
interface Vulnerability {
  issue: string;
  evidence: string;
  severity: string;
}

interface SecurityMisconfigScanResult {
  url: string;
  vulnerabilities: Vulnerability[];
  exposed_paths?: string[];
  headers?: Record<string, string>;
  error?: string;
  note?: string;
}

export default function SecurityMisconfigPage() {
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<SecurityMisconfigScanResult | null>(null);
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
      const data: SecurityMisconfigScanResult = await scanUrl(url, "security_misconfig");
      setResult(data);
    } catch (error) {
      console.error("Security Misconfiguration scan error:", error);
      setResult({
        url,
        vulnerabilities: [],
        error: "Error running Security Misconfiguration scan.",
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

  // Function to copy example URL to clipboard
  const copyExampleUrl = () => {
    navigator.clipboard.writeText("https://gail.com/");
    alert("URL copied to clipboard!");
  };

  // Function to download report as PDF
  const downloadPdf = () => {
    if (!result) return;

    const doc = new jsPDF();
    let yPos = 10;

    // Add title
    doc.setFontSize(16);
    doc.text("Security Misconfiguration Report", 10, yPos);
    yPos += 10;

    // Scan Summary
    doc.setFontSize(12);
    doc.text("1. Scan Summary", 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.text(`Scan ID: MISCONFIG-${new Date().getTime()}`, 15, yPos);
    yPos += 5;
    doc.text(`Target URL: ${result.url || "N/A"}`, 15, yPos);
    yPos += 5;
    doc.text(`Scan Date: ${new Date().toLocaleString()}`, 15, yPos);
    yPos += 5;
    doc.text("Scanner Version: SecuriScan v1.0.0", 15, yPos);
    yPos += 10;

    // Vulnerabilities
    doc.setFontSize(12);
    doc.text("2. Detected Misconfigurations", 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    if (result.error) {
      doc.text(result.error, 15, yPos);
    } else if (result.vulnerabilities && result.vulnerabilities.length > 0) {
      doc.text(`Found ${result.vulnerabilities.length} misconfiguration(s).`, 15, yPos);
      yPos += 5;
      result.vulnerabilities.forEach((vuln, idx) => {
        doc.text(`${idx + 1}. Issue: ${vuln.issue}`, 15, yPos);
        yPos += 5;
        doc.text(`   Severity: ${vuln.severity || "Low"}`, 15, yPos);
        yPos += 5;
        doc.text(`   Evidence: ${vuln.evidence}`, 15, yPos);
        yPos += 5;
      });
    } else {
      doc.text("No security misconfigurations detected.", 15, yPos);
    }

    doc.save(`Security-Misconfig-Report-${new Date().getTime()}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 rounded-2xl shadow-2xl animate-gradient text-white">
      {/* Page Header */}
      <h1 className="text-4xl font-extrabold mb-4 tracking-wider flex items-center">
        <AlertTriangle className="mr-2" /> Security Misconfiguration Scanner
      </h1>
      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
        Use this tool to uncover <strong>Security Misconfigurations</strong> — such as exposed admin interfaces,
        verbose server errors, or missing security headers. Paste a URL to begin scanning.
      </p>

      {/* URL Input */}
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
          placeholder="https://gail.com/"
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
        {loading ? "Scanning..." : "Launch Misconfig Scan"}
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
                  <SecurityMisconfigReport results={result} />
                </>
              )
            ) : (
              <p className="text-gray-400 italic">Awaiting your command to scan for misconfigurations.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}