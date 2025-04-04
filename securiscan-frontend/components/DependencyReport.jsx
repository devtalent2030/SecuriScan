"use client";

import React, { useState } from "react";

export default function DependencyReport({ results }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  if (!results) return <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>No scan results to display.</p>;

  const scanId = `DEP-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = results.vulnerabilities?.length || 0;
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
        Dependency Security Report
      </h2>

      {/* 1. Scan Summary */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          1. Scan Summary
        </h3>
        <ul className={`ml-4 mt-2 list-disc ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {results.url || "N/A"}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner Version:</strong> SecuriScan v1.0.0</li>
        </ul>
      </div>

      {/* 2. Detected Vulnerabilities */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          2. Detected Vulnerabilities
        </h3>
        {vulnerableCount > 0 ? (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            Found <strong>{vulnerableCount}</strong> vulnerabilities in dependencies.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No vulnerable dependencies found.
          </p>
        )}

        {results.vulnerabilities && results.vulnerabilities.length > 0 && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={isDarkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-black"}>
                  <th className="border p-3 text-left">Issue</th>
                  <th className="border p-3 text-left">Evidence</th>
                  <th className="border p-3 text-left">Severity</th>
                </tr>
              </thead>
              <tbody>
                {results.vulnerabilities.map((vuln, idx) => (
                  <tr key={idx} className={isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"}>
                    <td className="border p-3">{vuln.issue}</td>
                    <td className="border p-3">{vuln.evidence}</td>
                    <td
                      className={`border p-3 ${
                        vuln.severity === "High" || vuln.severity === "Critical"
                          ? isDarkMode
                            ? "text-red-400"
                            : "text-red-600"
                          : isDarkMode
                          ? "text-yellow-400"
                          : "text-yellow-600"
                      }`}
                    >
                      {vuln.severity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Detected Dependencies */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          3. Detected Dependencies
        </h3>
        {results.dependencies && results.dependencies.length > 0 ? (
          <ul className={`ml-4 mt-2 list-disc text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {results.dependencies.map((dep, index) => (
              <li key={index} className={dep.library === "Unknown" ? (isDarkMode ? "text-gray-500" : "text-gray-500") : ""}>
                <strong>{dep.library}</strong> {dep.version || "unknown"} — {dep.status || "No status"} (
                <a
                  href={dep.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={isDarkMode ? "text-blue-400 underline" : "text-indigo-500 underline"}
                >
                  Source
                </a>)
              </li>
            ))}
          </ul>
        ) : (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            No third-party dependencies detected.
          </p>
        )}
      </div>

      {/* 4. Conclusion */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          4. Scan Conclusion
        </h3>
        {hasVulnerabilities ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
            Vulnerable packages found. Please update or replace outdated libraries immediately.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No known vulnerable dependencies detected. Regular scans are recommended.
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