// components/SecurityMisconfigReport.jsx
"use client";

import React from "react";

export default function SecurityMisconfigReport({ results }) {
  if (!results) {
    return <p className="text-gray-600">No scan results to display.</p>;
  }

  const scanId = `MISCONFIG-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = results.vulnerabilities ? results.vulnerabilities.length : 0;

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black max-w-full">
      <h2 className="text-xl font-bold mb-2">Misconfiguration Report</h2>

      {/* 1. Scan Summary */}
      <div className="mb-4">
        <h3 className="font-semibold">1. Scan Summary</h3>
        <ul className="ml-4 list-disc">
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {results.url || "N/A"}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner Version:</strong> SecuriScan v1.0.0</li>
        </ul>
      </div>

      {/* 2. Detected Misconfigurations */}
      <div className="mb-4">
        <h3 className="font-semibold">2. Detected Misconfigurations</h3>
        {results.error ? (
          <p className="text-red-600">{results.error}</p>
        ) : vulnerableCount > 0 ? (
          <p>
            Found <strong>{vulnerableCount}</strong> security misconfiguration(s).
          </p>
        ) : (
          <p className="text-green-600">No security misconfigurations detected.</p>
        )}

        {results.vulnerabilities && results.vulnerabilities.length > 0 && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 text-black">
                  <th className="border p-2">Issue</th>
                  <th className="border p-2">Evidence</th>
                  <th className="border p-2">Severity</th>
                </tr>
              </thead>
              <tbody>
                {results.vulnerabilities.map((vuln, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="border p-2">{vuln.issue}</td>
                    <td className="border p-2">{vuln.evidence || "N/A"}</td>
                    <td
                      className={`border p-2 ${
                        vuln.severity === "Critical" || vuln.severity === "High"
                          ? "text-red-600"
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

      {/* 3. Exposed Paths */}
      <div className="mb-4">
        <h3 className="font-semibold">3. Exposed Paths</h3>
        {results.exposed_paths && results.exposed_paths.length > 0 ? (
          <div className="text-red-600">
            <p>Detected <strong>{results.exposed_paths.length}</strong> exposed path(s):</p>
            <ul className="list-disc pl-5">
              {results.exposed_paths.map((path, idx) => (
                <li key={idx}>
                  <a
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 underline"
                  >
                    {path}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600">No exposed paths detected.</p>
        )}
      </div>

      {/* 4. Response Headers */}
      <div className="mb-4">
        <h3 className="font-semibold">4. Response Headers</h3>
        {results.headers && Object.keys(results.headers).length > 0 ? (
          <div>
            <p>Headers Found: {Object.keys(results.headers).length}</p>
            <ul className="list-disc pl-5 text-sm">
              {Object.entries(results.headers).map(([key, value], idx) => (
                <li key={idx}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600">No response headers detected.</p>
        )}
      </div>

      {/* 5. Conclusion */}
      <div className="mb-4">
        <h3 className="font-semibold">5. Scan Conclusion</h3>
        {results.error ? (
          <p className="text-red-600">Scan failed: {results.error}</p>
        ) : vulnerableCount > 0 || (results.exposed_paths && results.exposed_paths.length > 0) ? (
          <p className="text-red-600">
            Detected <strong>{vulnerableCount + (results.exposed_paths ? results.exposed_paths.length : 0)}</strong> issue(s).
            Review and secure configurations immediately.
          </p>
        ) : (
          <p className="text-green-600">
            No critical misconfigurations found. Regular scans advised.
          </p>
        )}
      </div>

      {/* 6. Footer */}
      <div className="mb-2">
        <h3 className="font-semibold">6. Report Generated By</h3>
        <p className="text-sm">
          Generated By: SecuriScan Automated Security Scanner <br />
          Report Format: PDF/HTML/Markdown <br />
          Contact: securiscan@gmail.com
        </p>
      </div>
    </div>
  );
}