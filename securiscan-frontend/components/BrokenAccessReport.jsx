// components/BrokenAccessReport.jsx
"use client";

import React from "react";

export default function BrokenAccessReport({ results }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white space-y-6">
      <h2 className="text-2xl font-bold mb-2">Broken Access Control Scan Report</h2>
      <p><strong>Target URL:</strong> {results.url}</p>

      {results.vulnerable_endpoints?.length > 0 ? (
        <>
          <h3 className="text-lg font-semibold">Detected Issues</h3>
          <ul className="list-disc pl-6">
            {results.vulnerable_endpoints.map((vuln, idx) => (
              <li key={idx} className="mb-2">
                <strong>Issue:</strong> {vuln.issue} <br />
                <strong>URL:</strong> <a href={vuln.url} className="text-indigo-300 underline" target="_blank">{vuln.url}</a> <br />
                <strong>Evidence:</strong> {vuln.evidence} <br />
                <strong>Status Code:</strong> {vuln.status_code}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-green-400">No Broken Access vulnerabilities found.</p>
      )}

      {results.time_based_test && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Time-Based Test</h3>
          <p className={results.time_based_test.vulnerable ? "text-red-400" : "text-green-400"}>
            {results.time_based_test.vulnerable ? "Vulnerable" : "Not Vulnerable"} — Delay: {results.time_based_test.delay?.toFixed(2)}s
            {results.time_based_test.evidence && ` (${results.time_based_test.evidence})`}
          </p>
        </div>
      )}

      {results.detected_paths?.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Detected Sensitive Paths</h3>
          <ul className="list-disc pl-6 text-indigo-300">
            {results.detected_paths.map((path, idx) => (
              <li key={idx}>
                <a href={path} target="_blank" rel="noopener noreferrer" className="underline">
                  {path}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
