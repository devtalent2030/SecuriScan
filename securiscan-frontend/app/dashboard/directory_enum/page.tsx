"use client";

import React, { useState } from "react";
import { scanUrl } from "../../api/scan";
import DirectoryEnumReport from "../../../components/DirectoryEnumReport";
import { ChevronDown, ChevronUp, FolderSearch, X, Minimize2, Copy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { jsPDF } from "jspdf";

interface DirectoryResult {
  url: string;
  status_code: number;
  vulnerable: boolean;
  evidence?: string;
}

interface DirectoryEnumScanResult {
  action: string;
  url: string;
  vulnerable_directories: DirectoryResult[];
  error?: string;
  note?: string;
}

export default function DirectoryEnumPage() {
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<DirectoryEnumScanResult | null>(null);
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
      const data: DirectoryEnumScanResult = await scanUrl(url, "directory_enum");
      setResult(data);
    } catch (error) {
      console.error("Directory Enum scan error:", error);
      setResult({
        action: "directory_enum",
        url,
        vulnerable_directories: [],
        error: "Error running Directory Enumeration scan.",
      });
    } finally {
      setLoading(false);
    }
  };

  const severityData = result?.vulnerable_directories.map((dir) => ({
    issue: dir.url.slice(-15),
    severity:
      dir.status_code === 200 ? 4 :
      dir.status_code === 403 ? 3 :
      dir.status_code === 500 ? 5 : 1
  })) || [];

  // Function to copy example URL to clipboard
  const copyExampleUrl = () => {
    navigator.clipboard.writeText("http://testphp.vulnweb.com/");
    alert("URL copied to clipboard!");
  };

  // Function to download report as PDF
  const downloadPdf = () => {
    if (!result) return;

    const doc = new jsPDF();
    let yPos = 10;

    // Add title
    doc.setFontSize(16);
    doc.text("Directory Enumeration Report", 10, yPos);
    yPos += 10;

    // Scan Summary
    doc.setFontSize(12);
    doc.text("1. Scan Summary", 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.text(`Scan ID: DIR-${new Date().getTime()}`, 15, yPos);
    yPos += 5;
    doc.text(`Target URL: ${result.url || "N/A"}`, 15, yPos);
    yPos += 5;
    doc.text(`Scan Date: ${new Date().toLocaleString()}`, 15, yPos);
    yPos += 5;
    doc.text("Scanner Version: SecuriScan v1.0.0", 15, yPos);
    yPos += 10;

    // Vulnerabilities
    doc.setFontSize(12);
    doc.text("2. Detected Vulnerable Directories", 10, yPos);
    yPos += 5;
    doc.setFontSize(10);
    if (result.error) {
      doc.text(result.error, 15, yPos);
    } else if (result.vulnerable_directories && result.vulnerable_directories.length > 0) {
      doc.text(`Found ${result.vulnerable_directories.length} vulnerable director(y/ies).`, 15, yPos);
      yPos += 5;
      result.vulnerable_directories.forEach((dir, idx) => {
        doc.text(`${idx + 1}. URL: ${dir.url}`, 15, yPos);
        yPos += 5;
        doc.text(`   Status Code: ${dir.status_code}`, 15, yPos);
        yPos += 5;
        doc.text(`   Vulnerable: ${dir.vulnerable ? "Yes" : "No"}`, 15, yPos);
        yPos += 5;
        if (dir.evidence) {
          doc.text(`   Evidence: ${dir.evidence}`, 15, yPos);
          yPos += 5;
        }
      });
    } else {
      doc.text("No vulnerable directories detected.", 15, yPos);
    }

    doc.save(`Directory-Enum-Report-${new Date().getTime()}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 rounded-2xl shadow-2xl animate-gradient text-white">
      <h1 className="text-4xl font-extrabold mb-4 tracking-wider flex items-center">
        <FolderSearch className="mr-2" /> Directory Enumeration Scanner
      </h1>
      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
        Launch this tool to find <strong>directory access vulnerabilities</strong>. These can expose sensitive files
        or directories due to server misconfigurations. Enter a URL to begin scanning.
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
          placeholder="http://testphp.vulnweb.com/"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <button
        onClick={handleScan}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 rounded-lg text-white font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg transform hover:scale-105"
        disabled={loading}
      >
        {loading ? "Scanning..." : "Run Directory Enumeration Scan"}
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
              <button onClick={() => setResult(null)} className="text-red-400 hover:text-red-200" title="Exit Scan">
                <X size={24} />
              </button>
            )}
            <button onClick={() => setShowResultsPanel(!showResultsPanel)} className="text-gray-400 hover:text-gray-200" title={showResultsPanel ? "Minimize" : "Expand"}>
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
                <p className="ml-3 text-gray-300">Scanning for exposed directories...</p>
              </div>
            ) : result?.error ? (
              <p className="text-red-400 font-medium">{result.error}</p>
            ) : (
              <>
                <DirectoryEnumReport results={result} />

                {showDetails && severityData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold">Directory Vulnerability Severity</h3>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}