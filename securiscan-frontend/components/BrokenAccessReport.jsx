"use client";

import React, { useState } from "react";

export default function BrokenAccessReport({ results }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  if (!results) return <p className={isDarkMode ? "text-gray-300" : "text-gray-500"}>No scan results to show.</p>;

  const { url, vulnerable_endpoints = [], time_based_test, detected_paths = [] } = results;
  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = vulnerable_endpoints.length;
  const hasVulnerabilities = vulnerableCount > 0 || (time_based_test && time_based_test.vulnerable);

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
        Broken Access Control Report
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
        </ul>
      </div>

      {/* 2. Identified Vulnerabilities */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          2. Identified Vulnerabilities
        </h3>
        {vulnerableCount > 0 ? (
          <>
            <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
              Found <strong>{vulnerableCount}</strong> potential broken access control vulnerabilit{vulnerableCount === 1 ? "y" : "ies"}.
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className={isDarkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-black"}>
                    <th className="border p-3 text-left">Issue</th>
                    <th className="border p-3 text-left">URL</th>
                    <th className="border p-3 text-left">Evidence</th>
                    <th className="border p-3 text-left">Status Code</th>
                  </tr>
                </thead>
                <tbody>
                  {vulnerable_endpoints.map((vuln, idx) => (
                    <tr key={idx} className={isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"}>
                      <td className="border p-3">{vuln.issue}</td>
                      <td className="border p-3">
                        <a
                          href={vuln.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={isDarkMode ? "text-blue-400 underline" : "text-blue-500 underline"}
                        >
                          {vuln.url}
                        </a>
                      </td>
                      <td className="border p-3">{vuln.evidence}</td>
                      <td className="border p-3">{vuln.status_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No broken access control vulnerabilities found.
          </p>
        )}
      </div>

      {/* 3. Detected Sensitive Paths */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          3. Detected Sensitive Paths
        </h3>
        {detected_paths.length > 0 ? (
          <ul className={`ml-4 mt-2 list-disc ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
            {detected_paths.map((path, idx) => (
              <li key={idx}>
                <a
                  href={path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={isDarkMode ? "text-blue-400 underline" : "text-blue-500 underline"}
                >
                  {path}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            No sensitive paths detected.
          </p>
        )}
      </div>

      {/* 4. Time-based Blind Check */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          4. Time-based Access Control Check
        </h3>
        {time_based_test ? (
          time_based_test.vulnerable ? (
            <div className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
              Potential time-based access control issue detected. Delay: {time_based_test.delay?.toFixed(2)}s
              {time_based_test.evidence && (
                <>
                  <br />
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    Evidence: {time_based_test.evidence}
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
              No significant delay detected from time-based access attempts.
            </p>
          )
        ) : (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            No time-based test data available.
          </p>
        )}
      </div>

      {/* 5. Scan Conclusion */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          5. Scan Conclusion
        </h3>
        {hasVulnerabilities ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
            This scan identified <strong>{vulnerableCount}</strong> potential vulnerabilities.
            Immediate remediation is recommended.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            The site appears free of high-level broken access control vulnerabilities tested.
            Periodic scanning is still recommended.
          </p>
        )}
      </div>

      {/* 6. Footer */}
      <div className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          6. Report Generated By
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