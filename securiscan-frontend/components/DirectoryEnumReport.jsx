"use client";

import React, { useState } from "react";

function getSeverityAndMitigation(statusCode) {
  if (statusCode === 200) {
    return {
      severity: "High",
      evidence: "Directory openly accessible with successful response.",
      mitigation: "Restrict public access using .htaccess or server configurations.",
    };
  } else if (statusCode === 403) {
    return {
      severity: "Medium",
      evidence: "Access forbidden, indicating directory exists but is restricted.",
      mitigation: "Review access permissions to ensure only authorized roles can access.",
    };
  } else if (statusCode === 500) {
    return {
      severity: "Critical",
      evidence: "Server error suggests misconfiguration or sensitive data exposure.",
      mitigation: "Investigate server errors immediately and patch misconfigurations.",
    };
  } else {
    return {
      severity: "Low",
      evidence: "No significant response indicating directory presence.",
      mitigation: "No immediate action needed; monitor for unusual activity.",
    };
  }
}

export default function DirectoryEnumReport({ results }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  if (!results) return <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>No scan results to display.</p>;

  const { url, vulnerable_directories = [], note } = results;
  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = vulnerable_directories.length;
  const hasVulnerabilities = vulnerableCount > 0;

  const toggleMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div
      className={`p-6 rounded-lg max-w-full shadow-sm ${
        isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"
      }`}
    >
      {/* Mode Toggle Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleMode}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            isDarkMode
              ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
        Directory Enumeration Security Report
      </h2>

      {/* 1. Scan Summary */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          1. Scan Summary
        </h3>
        <ul className={`ml-4 mt-2 list-disc ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {url}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner Version:</strong> SecuriScan v1.0.0</li>
          {note && <li><strong>Note:</strong> {note}</li>}
        </ul>
      </div>

      {/* 2. Identified Vulnerabilities */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          2. Identified Vulnerabilities
        </h3>
        {vulnerableCount > 0 ? (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            Found <strong>{vulnerableCount}</strong> accessible or sensitive{" "}
            {vulnerableCount === 1 ? "directory" : "directories"} out of{" "}
            <strong>{vulnerable_directories.length}</strong> tested.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No vulnerabilities found.
          </p>
        )}

        {vulnerableCount > 0 && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-800"}>
                  <th className="border p-3 text-left">URL</th>
                  <th className="border p-3 text-left">Status Code</th>
                  <th className="border p-3 text-left">Severity</th>
                  <th className="border p-3 text-left">Evidence</th>
                  {hasVulnerabilities && (
                    <th className="border p-3 text-left">Recommended Mitigation</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {vulnerable_directories.map((dir, idx) => {
                  const { severity, evidence, mitigation } = getSeverityAndMitigation(dir.status_code);
                  return (
                    <tr key={idx} className={isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-50"}>
                      <td className="border p-3">{dir.url}</td>
                      <td className="border p-3">{dir.status_code}</td>
                      <td
                        className={`border p-3 ${
                          severity === "Critical"
                            ? isDarkMode
                              ? "text-red-400"
                              : "text-red-600"
                            : severity === "High"
                            ? isDarkMode
                              ? "text-red-400"
                              : "text-red-600"
                            : severity === "Medium"
                            ? isDarkMode
                              ? "text-yellow-400"
                              : "text-orange-600"
                            : isDarkMode
                            ? "text-green-400"
                            : "text-green-600"
                        }`}
                      >
                        {severity}
                      </td>
                      <td className="border p-3">{dir.evidence || evidence}</td>
                      {hasVulnerabilities && (
                        <td className="border p-3">{mitigation}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Time-based Check */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          3. Time-based Enumeration Check
        </h3>
        <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
          No time-based enumeration tests performed for directories.
        </p>
      </div>

      {/* 4. Conclusion */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          4. Scan Conclusion
        </h3>
        {hasVulnerabilities ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
            This scan identified <strong>{vulnerableCount}</strong> potential vulnerabilities.
            Immediate remediation is recommended.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            The site appears free of high-level directory enumeration vulnerabilities tested.
            Periodic scanning is still recommended.
          </p>
        )}
      </div>

      {/* 5. Footer */}
      <div className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          5. Report Generated By
        </h3>
        <p className="mt-2">
          Generated By: SecuriScan Automated Security Scanner <br />
          Report Format: PDF/HTML/Markdown <br />
          Contact:{" "}
          <a
            href="mailto:securiscan@gmail.com"
            className={isDarkMode ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline"}
          >
            securiscan@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}