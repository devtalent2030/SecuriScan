"use client";

import React, { useState } from "react";

export default function SsrfReport({ results }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  if (!results) return <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>No scan results to display.</p>;

  const scanId = `SSRF-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = results.vulnerabilities ? results.vulnerabilities.length : 0;
  const hasVulnerabilities = vulnerableCount > 0;

  // Enhanced function to provide specific SSRF mitigation recommendations
  const getMitigationRecommendation = (vuln) => {
    if (!vuln?.issue || !vuln?.evidence) return "Review and secure the endpoint";

    const issueLower = vuln.issue.toLowerCase();
    const evidenceLower = vuln.evidence.toLowerCase();

    // SSRF-specific recommendations
    if (issueLower.includes("ssrf") && issueLower.includes("redirect")) {
      if (evidenceLower.includes("127.0.0.1") || evidenceLower.includes("localhost") || evidenceLower.includes("0.0.0.0")) {
        return "Block internal IP addresses (localhost, 127.0.0.1) and implement strict URL whitelisting";
      }
      if (evidenceLower.includes("169.254.169.254")) {
        return "Prevent access to cloud metadata services and implement network-level restrictions";
      }
      if (evidenceLower.includes("metadata.google.internal")) {
        return "Restrict access to Google Cloud metadata endpoints and validate redirect destinations";
      }
      if (evidenceLower.includes("192.168.") || evidenceLower.includes("10.0.") || evidenceLower.includes("172.16.")) {
        return "Restrict private network access and validate redirect URLs against an allowlist";
      }
      if (evidenceLower.includes("file://")) {
        return "Disable file protocol access and sanitize URL schemes in redirect handling";
      }
      if (evidenceLower.includes("gopher://")) {
        return "Block unsupported protocols (gopher) and restrict to HTTP/HTTPS only";
      }
      if (evidenceLower.includes("internal.example.com")) {
        return "Implement domain whitelisting and prevent internal domain redirection";
      }
      if (evidenceLower.includes("burpcollaborator.net")) {
        return "Validate all redirect URLs and implement outbound request filtering";
      }
    }

    // Fallback for generic SSRF
    if (issueLower.includes("ssrf")) {
      return "Implement strict URL validation, use a whitelist for allowed domains, and restrict internal network access";
    }

    // Generic fallback
    return "Validate and sanitize all user inputs, implement input filtering";
  };

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
        Server-Side Request Forgery (SSRF) Report
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

      {/* 2. Detected SSRF Vulnerabilities */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          2. Detected SSRF Vulnerabilities
        </h3>
        {results.error ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>{results.error}</p>
        ) : vulnerableCount > 0 ? (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            Found <strong>{vulnerableCount}</strong> potential SSRF vulnerability(s).
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No SSRF vulnerabilities detected.
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
                  {hasVulnerabilities && (
                    <th className="border p-3 text-left">Recommended Mitigation</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {results.vulnerabilities.map((vuln, idx) => (
                  <tr key={idx} className={isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"}>
                    <td className="border p-3">{vuln.issue}</td>
                    <td className="border p-3">{vuln.evidence || "N/A"}</td>
                    <td
                      className={`border p-3 ${
                        vuln.severity === "Critical" || vuln.severity === "High"
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
                    {hasVulnerabilities && (
                      <td className="border p-3">{getMitigationRecommendation(vuln)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Additional Observations */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          3. Additional Observations
        </h3>
        {results.suspicious_endpoints && results.suspicious_endpoints.length > 0 ? (
          <div className={isDarkMode ? "text-red-400" : "text-red-600"}>
            <p className="mt-2">
              Detected <strong>{results.suspicious_endpoints.length}</strong> suspicious endpoint(s):
            </p>
            <ul className="ml-4 mt-2 list-disc">
              {results.suspicious_endpoints.map((endpoint, idx) => (
                <li key={idx}>{endpoint}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            No suspicious endpoints detected.
          </p>
        )}
      </div>

      {/* 4. Conclusion */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          4. Scan Conclusion
        </h3>
        {results.error ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>Scan failed: {results.error}</p>
        ) : vulnerableCount > 0 || (results.suspicious_endpoints && results.suspicious_endpoints.length > 0) ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
            Detected <strong>{vulnerableCount + (results.suspicious_endpoints ? results.suspicious_endpoints.length : 0)}</strong> issue(s).
            Immediate remediation recommended to prevent SSRF attacks.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No SSRF vulnerabilities found. Regular scans advised.
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