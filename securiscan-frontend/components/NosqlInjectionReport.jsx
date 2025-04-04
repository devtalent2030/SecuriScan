"use client";

import React, { useState } from "react";

function getSeverityAndMitigation(payload, evidence) {
  const lower = payload.toLowerCase();
  if (!evidence) {
    return {
      severity: "Low",
      evidence: "No NoSQL injection detected in response.",
      mitigation: "No immediate action required; continue monitoring.",
    };
  }
  if (lower.includes("sleep") || lower.includes("func")) {
    return {
      severity: "High",
      evidence: evidence || "Significant delay observed.",
      mitigation: "Implement strict input validation and disable $where queries.",
    };
  } else if (lower.includes("$gt") || lower.includes("$ne") || lower.includes("$or")) {
    return {
      severity: "Critical",
      evidence: evidence || "Authentication bypass or data exposure detected.",
      mitigation: "Sanitize inputs and use parameterized queries.",
    };
  } else if (lower.includes("$where") || lower.includes("$eval")) {
    return {
      severity: "Critical",
      evidence: evidence || "Code execution detected.",
      mitigation: "Disable JavaScript execution in queries and sanitize inputs.",
    };
  } else {
    return {
      severity: "Medium",
      evidence: evidence || "Potential NoSQL injection context detected.",
      mitigation: "Validate and sanitize all user inputs.",
    };
  }
}

export default function NosqlInjectionReport({ results }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  if (!results) return <p className={isDarkMode ? "text-gray-300" : "text-gray-500"}>No scan results to show.</p>;

  const { url, vulnerable_params = [], detected_endpoints = [], time_based_test, note } = results;
  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = vulnerable_params.filter((v) => v.vulnerable).length;
  const vulnerableEntries = vulnerable_params.filter((v) => v.vulnerable);
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
        NoSQL Injection Security Report
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
            Found <strong>{vulnerableCount}</strong> vulnerable payload(s) out of{" "}
            <strong>{vulnerable_params.length}</strong> tested.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No vulnerabilities found.
          </p>
        )}

        {vulnerableEntries.length > 0 && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={isDarkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-black"}>
                  <th className="border p-3 text-left">Param</th>
                  <th className="border p-3 text-left">Payload</th>
                  <th className="border p-3 text-left">Method</th>
                  <th className="border p-3 text-left">Severity</th>
                  <th className="border p-3 text-left">Evidence</th>
                  {hasVulnerabilities && (
                    <th className="border p-3 text-left">Recommended Mitigation</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {vulnerableEntries.map((v, i) => {
                  const { severity, evidence, mitigation } = getSeverityAndMitigation(v.payload, v.evidence);
                  return (
                    <tr key={i} className={isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"}>
                      <td className="border p-3">{v.param}</td>
                      <td className="border p-3">{v.payload}</td>
                      <td className="border p-3">{v.method}</td>
                      <td
                        className={`border p-3 ${
                          severity === "Critical"
                            ? isDarkMode
                              ? "text-red-400"
                              : "text-red-600"
                            : severity === "High"
                            ? isDarkMode
                              ? "text-orange-400"
                              : "text-orange-600"
                            : isDarkMode
                            ? "text-green-400"
                            : "text-green-600"
                        }`}
                      >
                        {severity}
                      </td>
                      <td className="border p-3">{evidence}</td>
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

      {/* 3. Detected Vulnerable Endpoints */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          3. Detected Vulnerable Endpoints
        </h3>
        {detected_endpoints.length > 0 ? (
          <ul className={`ml-4 mt-2 list-disc ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {detected_endpoints.map((ep, i) => (
              <li key={i}>
                <strong>{ep.method}</strong>:{" "}
                <a
                  href={ep.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={isDarkMode ? "text-blue-400 underline" : "text-blue-500 underline"}
                >
                  {ep.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            No vulnerable endpoints detected.
          </p>
        )}
      </div>

      {/* 4. Time-based Blind Check */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          4. Time-based Blind NoSQL Injection Check
        </h3>
        {time_based_test ? (
          time_based_test.vulnerable ? (
            <div className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
              Potential time-based NoSQL injection detected with payload:{" "}
              <code
                className={isDarkMode ? "bg-gray-600 p-1 rounded" : "bg-gray-100 p-1 rounded"}
              >
                {time_based_test.payload}
              </code>
              {time_based_test.evidence && (
                <>
                  <br />
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    Evidence: {time_based_test.evidence}
                  </span>
                </>
              )}
              {time_based_test.note && (
                <>
                  <br />
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    Note: {time_based_test.note}
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
              No significant delay detected from time-based injection attempts.
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
            The site appears free of high-level NoSQL injection vulnerabilities tested.
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