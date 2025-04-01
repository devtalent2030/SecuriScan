"use client";

import React from "react";
import { AuthFailuresScanResult } from "../app/dashboard/types"; // Import from the same source as page.tsx

interface AuthFailuresReportProps {
  results: AuthFailuresScanResult;
}

export default function AuthFailuresReport({ results }: AuthFailuresReportProps) {
  if (!results) {
    return <p className="text-gray-600">No scan results to display.</p>;
  }

  const { url, vulnerabilities = [], error } = results; // Use vulnerabilities instead of auth_failures

  const scanId = `AUTH-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = vulnerabilities.filter((v) => v.severity !== "Low").length; // Adjust logic as needed

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black max-w-full">
      <h2 className="text-xl font-bold mb-2">SecuriScan Authentication Report</h2>

      {/* 1. Scan Summary */}
      <div className="mb-4">
        <h3 className="font-semibold">1. Scan Summary</h3>
        <ul className="ml-4 list-disc">
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {url || "N/A"}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner Version:</strong> SecuriScan v1.2.0</li>
        </ul>
      </div>

      {/* 2. Identified Authentication Failures */}
      <div className="mb-4">
        <h3 className="font-semibold">2. Detected Authentication Issues</h3>
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : vulnerableCount > 0 ? (
          <p>
            Found <strong>{vulnerableCount}</strong> potentially vulnerable issue(s) out of{" "}
            <strong>{vulnerabilities.length}</strong> detected.
          </p>
        ) : (
          <p className="text-green-600">No authentication vulnerabilities detected.</p>
        )}

        {vulnerabilities.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full mt-2 border-collapse text-sm max-w-full">
              <thead>
                <tr className="bg-gray-200 text-black">
                  <th className="border p-2">Issue</th>
                  <th className="border p-2">Severity</th>
                  <th className="border p-2">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {vulnerabilities.map((vuln, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="border p-2">{vuln.issue}</td>
                    <td
                      className={`border p-2 ${
                        vuln.severity === "High" || vuln.severity === "Critical"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {vuln.severity}
                    </td>
                    <td className="border p-2">{vuln.evidence || "No evidence"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Conclusion */}
      <div className="mb-4">
        <h3 className="font-semibold">3. Scan Conclusion</h3>
        {error ? (
          <p className="text-red-600">Scan failed: {error}</p>
        ) : vulnerableCount > 0 ? (
          <p className="text-red-600">
            Authentication issues found in <strong>{vulnerableCount}</strong> instance(s).
            Please apply appropriate access control and hardening techniques.
          </p>
        ) : (
          <p className="text-green-600">
            No exploitable authentication vulnerabilities were detected.
          </p>
        )}
      </div>

      {/* 4. Footer */}
      <div className="mb-2">
        <h3 className="font-semibold">4. Report Generated By</h3>
        <p className="text-sm">
          Generated By: SecuriScan Automated Security Scanner <br />
          Report Format: PDF/HTML/Markdown <br />
          Contact: security@example.com
        </p>
      </div>
    </div>
  );
}