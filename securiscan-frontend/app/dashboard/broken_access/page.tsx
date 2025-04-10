"use client";

import React, { useState } from "react";
import { scanUrl } from "../../api/scan";
import BrokenAccessReport from "../../../components/BrokenAccessReport.jsx";
import { ChevronDown, ChevronUp, LockOpen, X, Minimize2, Copy } from "lucide-react";
import { jsPDF } from "jspdf";

// Type definitions
interface VulnerableEndpoint {
  issue: string;
  url: string;
  evidence: string;
  status_code: number;
}

interface BrokenAccessScanResult {
  url?: string;
  vulnerable_endpoints?: VulnerableEndpoint[];
  time_based_test?: {
    vulnerable: boolean;
    delay?: number;
    evidence?: string;
  };
  detected_paths?: string[];
  error?: string;
}

export default function BrokenAccessPage() {
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<BrokenAccessScanResult | null>(null);
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
      const data: BrokenAccessScanResult = await scanUrl(url, "access_control");
      setResult(data);
    } catch (error) {
      console.error("Broken Access Control scan error:", error);
      setResult({
        error: `Failed to scan: ${error instanceof Error ? error.message : String(error)}`
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
    navigator.clipboard.writeText("http://juice-shop.herokuapp.com/#/login");
    alert("URL copied to clipboard!");
  };

  // Function to download report as PDF
  const downloadPdf = () => {
    if (!result) return;

    const doc = new jsPDF();
    let yPos = 10;

    // Add title
    doc.setFontSize(16);
    doc.text("Broken Access Control Report", 10, yPos);
    yPos += 10;

    // Scan Summary
    doc.setFontSize(12);
    doc.text("1. Scan Summary", 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.text(`Scan ID: BAC-${new Date().getTime()}`, 15, yPos);
    yPos += 5;
    doc.text(`Target URL: ${result.url || "N/A"}`, 15, yPos);
    yPos += 5;
    doc.text(`Scan Date: ${new Date().toLocaleString()}`, 15, yPos);
    yPos += 5;
    doc.text("Scanner Version: SecuriScan v1.0.0", 15, yPos);
    yPos += 10;

    // Vulnerabilities
    doc.setFontSize(12);
    doc.text("2. Detected Vulnerable Endpoints", 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    if (result.error) {
      doc.text(result.error, 15, yPos);
    } else if (result.vulnerable_endpoints && result.vulnerable_endpoints.length > 0) {
      doc.text(`Found ${result.vulnerable_endpoints.length} vulnerable endpoint(s).`, 15, yPos);
      yPos += 5;
      result.vulnerable_endpoints.forEach((endpoint, idx) => {
        doc.text(`${idx + 1}. Issue: ${endpoint.issue}`, 15, yPos);
        yPos += 5;
        doc.text(`   URL: ${endpoint.url}`, 15, yPos);
        yPos += 5;
        doc.text(`   Status Code: ${endpoint.status_code}`, 15, yPos);
        yPos += 5;
        doc.text(`   Evidence: ${endpoint.evidence}`, 15, yPos);
        yPos += 5;
      });
    } else {
      doc.text("No broken access control vulnerabilities detected.", 15, yPos);
    }

    doc.save(`Broken-Access-Report-${new Date().getTime()}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 rounded-2xl shadow-2xl animate-gradient text-white">
      <h1 className="text-4xl font-extrabold mb-4 tracking-wider flex items-center">
        <LockOpen className="mr-2" /> Broken Access Control Scanner
      </h1>
      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
        Detect <strong>Broken Access Control</strong> vulnerabilities—gaps that let attackers bypass restrictions and
        access unauthorized data or features. Enter a URL to begin scanning.
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
          placeholder="http://juice-shop.herokuapp.com/#/login"
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
        {loading ? "Scanning..." : "Run Broken Access Scan"}
      </button>

      {/* Results Panel */}
      <div className="mt-10 bg-gray-900 bg-opacity-80 rounded-lg shadow-inner relative transition-all duration-300">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Scan Results</h2>
          <div className="flex items-center space-x-4">
            {result && !result.error && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-indigo-400 hover:text-indigo-200"
              >
                {showDetails ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            )}
            {result && (
              <button
                onClick={handleExit}
                className="text-red-400 hover:text-red-200"
                title="Exit Scan"
              >
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
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  ></path>
                </svg>
                <p className="ml-3 text-gray-300">Testing for vulnerabilities...</p>
              </div>
            ) : result ? (
              result.error ? (
                <p className="text-red-400 font-medium">{result.error}</p>
              ) : (
                <>
                  <BrokenAccessReport results={result} />
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