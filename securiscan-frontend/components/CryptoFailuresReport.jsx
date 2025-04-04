"use client";

import React, { useState } from "react";

export default function CryptoFailuresReport({ results }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  if (!results) return <p className={isDarkMode ? "text-gray-300" : "text-gray-500"}>No scan results to show.</p>;

  const { url, vulnerabilities = [], certificate_info, tls_info, exposed_data = [] } = results;
  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const hasVulnerabilities = vulnerabilities.length > 0 || exposed_data.length > 0;

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
        Cryptographic Failures Report
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
        {vulnerabilities.length > 0 ? (
          <>
            <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
              Found <strong>{vulnerabilities.length}</strong> cryptographic vulnerabilit{vulnerabilities.length === 1 ? "y" : "ies"}.
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className={isDarkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-black"}>
                    <th className="border p-3 text-left">Issue</th>
                    <th className="border p-3 text-left">Severity</th>
                    <th className="border p-3 text-left">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {vulnerabilities.map((vuln, idx) => (
                    <tr key={idx} className={isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"}>
                      <td className="border p-3">{vuln.issue}</td>
                      <td
                        className={`border p-3 ${
                          vuln.severity === "Critical"
                            ? isDarkMode
                              ? "text-red-400"
                              : "text-red-600"
                            : vuln.severity === "High"
                            ? isDarkMode
                              ? "text-orange-400"
                              : "text-orange-600"
                            : vuln.severity === "Medium"
                            ? isDarkMode
                              ? "text-yellow-400"
                              : "text-yellow-600"
                            : isDarkMode
                            ? "text-green-400"
                            : "text-green-600"
                        }`}
                      >
                        {vuln.severity}
                      </td>
                      <td className="border p-3">{vuln.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No cryptographic vulnerabilities found.
          </p>
        )}
      </div>

      {/* 3. TLS Configuration */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          3. TLS Configuration
        </h3>
        {tls_info ? (
          tls_info.error ? (
            <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
              TLS check failed: {tls_info.error}
            </p>
          ) : (
            <ul className={`ml-4 mt-2 list-disc ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              <li><strong>Version:</strong> {tls_info.version}</li>
              <li><strong>Cipher:</strong> {tls_info.cipher}</li>
            </ul>
          )
        ) : (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            No TLS information available.
          </p>
        )}
      </div>

      {/* 4. Certificate Details */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          4. Certificate Details
        </h3>
        {certificate_info ? (
          certificate_info.error ? (
            <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
              Certificate check failed: {certificate_info.error}
            </p>
          ) : (
            <ul className={`ml-4 mt-2 list-disc ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              <li><strong>Issuer:</strong> {certificate_info.issuer}</li>
              <li><strong>Subject:</strong> {certificate_info.subject}</li>
              <li><strong>Not Before:</strong> {certificate_info.not_before}</li>
              <li><strong>Not After:</strong> {certificate_info.not_after}</li>
              <li>
                <strong>Expired:</strong>{" "}
                <span className={certificate_info.expired ? (isDarkMode ? "text-red-400" : "text-red-600") : ""}>
                  {certificate_info.expired ? "Yes" : "No"}
                </span>
              </li>
            </ul>
          )
        ) : (
          <p className={isDarkMode ? "text-gray-300 mt-2" : "text-gray-600 mt-2"}>
            No certificate information available.
          </p>
        )}
      </div>

      {/* 5. Sensitive Data Exposure */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          5. Sensitive Data Exposure
        </h3>
        {exposed_data.length > 0 ? (
          <ul className={`ml-4 mt-2 list-disc ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
            {exposed_data.map((data, idx) => (
              <li key={idx}>{data.slice(0, 20)}...</li>
            ))}
          </ul>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No sensitive data exposed in response.
          </p>
        )}
      </div>

      {/* 6. Scan Conclusion */}
      <div className="mb-6">
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          6. Scan Conclusion
        </h3>
        {vulnerabilities.some((v) => v.severity === "High" || v.severity === "Critical") ? (
          <p className={isDarkMode ? "text-red-400 mt-2" : "text-red-600 mt-2"}>
            This scan identified critical or high-severity cryptographic vulnerabilities.
            Immediate remediation is recommended.
          </p>
        ) : vulnerabilities.length > 0 ? (
          <p className={isDarkMode ? "text-yellow-400 mt-2" : "text-yellow-600 mt-2"}>
            This scan identified minor cryptographic issues.
            Review and address as needed.
          </p>
        ) : (
          <p className={isDarkMode ? "text-green-400 mt-2" : "text-green-600 mt-2"}>
            No significant cryptographic vulnerabilities detected.
            Periodic scanning is still recommended.
          </p>
        )}
      </div>

      {/* 7. Footer */}
      <div className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
        <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          7. Report Generated By
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