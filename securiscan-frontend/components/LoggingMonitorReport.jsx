"use client";

import React, { useState } from "react";

export default function LoggingMonitorReport({ results }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  if (!results) return <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>No scan results to display.</p>;

  const scanId = `LOG-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = results.vulnerabilities ? results.vulnerabilities.length : 0;
  const hasVulnerabilities = vulnerableCount > 0 || results.error;

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
        Logging & Monitoring Report
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
          2. Detected Logging Issues
        </h3>
        {results.error ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>{results.error}</p>
        ) : vulnerableCount > 0 ? (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            Found <strong>{vulnerableCount}</strong> logging or monitoring issues.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No logging or monitoring issues detected.
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
                    <td className="border p-3">{vuln.evidence || "N/A"}</td>
                    <td
                      className={`border p-3 ${
                        vuln.severity === "High"
                          ? isDarkMode
                            ? "text-red-400"
                            : "text-red-600"
                          : isDarkMode
                          ? "text-yellow-400"
                          : "text-yellow-600"
                      }`}
                    >
                      {vuln.severity || "Medium"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Additional Details */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          3. Additional Observations
        </h3>
        {results.response_time ? (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            Response Time: {results.response_time} ms (
            {results.response_time > 1000 ? (
              <span className={isDarkMode ? "text-red-400" : "text-red-600"}>Slow - potential logging delay</span>
            ) : (
              "Acceptable"
            )})
          </p>
        ) : (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>No response time data available.</p>
        )}
        {results.headers && Object.keys(results.headers).length > 0 ? (
          <div className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            <p>Security Headers Present: {Object.keys(results.headers).length}</p>
            <ul className="ml-4 mt-2 list-disc text-sm">
              {Object.entries(results.headers).map(([key, value], idx) => (
                <li key={idx}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>No security headers detected.</p>
        )}
      </div>

      {/* 4. Conclusion */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          4. Scan Conclusion
        </h3>
        {results.error ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>Scan failed: {results.error}</p>
        ) : hasVulnerabilities ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
            Detected <strong>{vulnerableCount}</strong> logging issues. Enhance logging and monitoring practices immediately.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            Logging and monitoring appear adequate based on this scan. Regular checks recommended.
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