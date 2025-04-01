"use client";

import React from "react";
import { SQLScanResult, SQLVulnerability } from "../dashboard/types";

/**
 * Classify severity & provide recommended mitigations.
 */
function getSeverityAndMitigation(payload: string) {
  const lower = payload.toLowerCase();

  if (lower.includes("' or '1'='1") || lower.includes("union select")) {
    return {
      severity: "High",
      mitigation: "Use parameterized queries/prepared statements to prevent injection.",
    };
  } else if (lower.includes("sleep") || lower.includes("admin'--")) {
    return {
      severity: "High",
      mitigation: "Validate & sanitize user input. Avoid constructing queries from raw user input.",
    };
  } else {
    return {
      severity: "Medium",
      mitigation: "Implement server-side escaping and filtering for special characters.",
    };
  }
}

interface SecuriScanReportProps {
  results: SQLScanResult;
}

export default function SecuriScanReport({ results }: SecuriScanReportProps) {
  if (!results) {
    return <p className="text-gray-600">No scan results to display.</p>;
  }

  const {
    url,
    sql_vulnerabilities: vulnerabilities = [],
    time_based_test: timeTest,
  } = results;

  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = vulnerabilities.filter((v) => v.vulnerable).length;

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black max-w-full">
      <h2 className="text-xl font-bold mb-2">SecuriScan Security Report</h2>

      {/* 1. Scan Summary */}
      <div className="mb-4">
        <h3 className="font-semibold">1. Scan Summary</h3>
        <ul className="ml-4 list-disc">
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {url}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner Version:</strong> SecuriScan v1.2.0</li>
        </ul>
      </div>

      {/* 2. Identified Vulnerabilities */}
      <div className="mb-4">
        <h3 className="font-semibold">2. Identified Vulnerability</h3>
        {vulnerableCount > 0 ? (
          <p>
            Found <strong>{vulnerableCount}</strong> vulnerable payload(s) out of{" "}
            <strong>{vulnerabilities.length}</strong> tested.
          </p>
        ) : (
          <p className="text-green-600">No vulnerabilities found.</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full mt-2 border-collapse text-sm max-w-full">
            <thead>
              <tr className="bg-gray-200 text-black">
                <th className="border p-2">Param</th>
                <th className="border p-2">Payload</th>
                <th className="border p-2">Vulnerable?</th>
                <th className="border p-2">Severity</th>
                <th className="border p-2">Evidence</th>
                <th className="border p-2">Recommended Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.map((vuln: SQLVulnerability, idx: number) => {
                const { severity, mitigation } = getSeverityAndMitigation(vuln.payload ?? "");
                return (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="border p-2">{vuln.param || "N/A"}</td>
                    <td className="border p-2">{vuln.payload}</td>
                    <td
                      className={`border p-2 ${vuln.vulnerable ? "text-red-600" : "text-green-600"}`}
                    >
                      {vuln.vulnerable ? "Yes" : "No"}
                    </td>
                    <td className="border p-2">{severity}</td>
                    <td className="border p-2">{vuln.evidence || "No direct evidence"}</td>
                    <td className="border p-2">{mitigation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Time-based Test */}
      <div className="mb-4">
        <h3 className="font-semibold">3. Time-based Blind SQLi Check</h3>
        {timeTest?.vulnerable ? (
          <div className="text-red-600">
            Potential time-based SQL injection detected with payload:{" "}
            <code>{timeTest.payload}</code>
          </div>
        ) : (
          <p className="text-gray-600">
            No significant delay detected from time-based injection attempts.
          </p>
        )}
      </div>

      {/* 4. Conclusion */}
      <div className="mb-4">
        <h3 className="font-semibold">4. Scan Conclusion</h3>
        {vulnerableCount > 0 ? (
          <p className="text-red-600">
            This scan identified <strong>{vulnerableCount}</strong> potential vulnerabilities.
            Immediate remediation is recommended.
          </p>
        ) : (
          <p className="text-green-600">
            The site appears free of high-level SQL injection vulnerabilities tested.
            Periodic scanning is still recommended.
          </p>
        )}
      </div>

      {/* 5. Footer */}
      <div className="mb-2">
        <h3 className="font-semibold">5. Report Generated By</h3>
        <p className="text-sm">
          Generated By: SecuriScan Automated Security Scanner <br />
          Report Format: PDF/HTML/Markdown <br />
          Contact: security@example.com
        </p>
      </div>
    </div>
  );
}
