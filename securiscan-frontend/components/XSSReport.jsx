"use client";
import React from "react";

function getSeverityAndMitigation(payload) {
  const lower = payload.toLowerCase();
  if (lower.includes("<script") || lower.includes("onerror") || lower.includes("alert")) {
    return {
      severity: "High",
      mitigation: "Escape HTML characters and use CSP headers to prevent XSS."
    };
  } else {
    return {
      severity: "Medium",
      mitigation: "Validate and sanitize user input properly."
    };
  }
}

export default function XSSReport({ results }) {
  if (!results) return <p className="text-gray-600">No results found.</p>;

  const { url, vulnerable_params = [], time_based_test: timeTest } = results;
  const scanId = `XSS-${Date.now()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = vulnerable_params.filter(p => p.vulnerable).length;

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black">
      <h2 className="text-xl font-bold mb-2">XSS Security Report</h2>

      <div className="mb-4">
        <h3 className="font-semibold">1. Scan Summary</h3>
        <ul className="ml-4 list-disc">
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {url}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner:</strong> SecuriScan XSS Engine v1.0</li>
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">2. Detected Vulnerabilities</h3>
        {vulnerableCount === 0 ? (
          <p className="text-green-600">No XSS vulnerabilities detected.</p>
        ) : (
          <table className="w-full mt-2 border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200 text-black">
                <th className="border p-2">Param</th>
                <th className="border p-2">Payload</th>
                <th className="border p-2">Vulnerable?</th>
                <th className="border p-2">Severity</th>
                <th className="border p-2">Evidence</th>
                <th className="border p-2">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {vulnerable_params.map((v, i) => {
                const { severity, mitigation } = getSeverityAndMitigation(v.payload || "");
                return (
                  <tr key={i} className="hover:bg-gray-100">
                    <td className="border p-2">{v.param || "N/A"}</td>
                    <td className="border p-2">{v.payload}</td>
                    <td className={`border p-2 ${v.vulnerable ? "text-red-600" : "text-green-600"}`}>
                      {v.vulnerable ? "Yes" : "No"}
                    </td>
                    <td className="border p-2">{severity}</td>
                    <td className="border p-2">{v.evidence || "No evidence"}</td>
                    <td className="border p-2">{mitigation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Time-based blind XSS */}
      <div className="mb-4">
        <h3 className="font-semibold">3. Time-based Blind XSS Check</h3>
        {timeTest?.vulnerable ? (
          <p className="text-red-600">
            Detected delay with payload: <code>{timeTest.payload}</code> <br />
            Evidence: {timeTest.evidence || "Significant delay observed."}
          </p>
        ) : (
          <p className="text-gray-600">No significant delay detected.</p>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">4. Conclusion</h3>
        {vulnerableCount > 0 ? (
          <p className="text-red-600">
            XSS vulnerabilities detected. Immediate remediation is advised.
          </p>
        ) : (
          <p className="text-green-600">
            No XSS risks found. Continue periodic scans for ongoing safety.
          </p>
        )}
      </div>
    </div>
  );
}
