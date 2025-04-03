"use client";
import React from "react";

function getSeverityAndMitigation(payload, evidence) {
  const lower = payload.toLowerCase();
  if (!evidence) {
    return {
      severity: "Low",
      evidence: "No command execution detected in response.",
      mitigation: "No immediate action required; continue monitoring."
    };
  }
  if (lower.includes("sleep") || lower.includes("ping")) {
    return {
      severity: "High",
      evidence: evidence || "Significant delay observed in response.",
      mitigation: "Implement strict input validation and use parameterized commands."
    };
  } else if (lower.includes("id") || lower.includes("whoami") || lower.includes("uname") || lower.includes("%username%")) {
    return {
      severity: "Critical",
      evidence: evidence || "User or system identity exposed in response.",
      mitigation: "Sanitize inputs and restrict command execution privileges."
    };
  } else if (lower.includes("passwd") || lower.includes("win.ini") || lower.includes("dir") || lower.includes("type")) {
    return {
      severity: "Critical",
      evidence: evidence || "Sensitive file contents exposed in response.",
      mitigation: "Block file access via input sanitization and server hardening."
    };
  } else if (lower.includes("curl") || lower.includes("powershell")) {
    return {
      severity: "High",
      evidence: evidence || "External command execution detected.",
      mitigation: "Filter external command calls and enforce least privilege."
    };
  } else {
    return {
      severity: "Medium",
      evidence: evidence || "Command execution detected in response.",
      mitigation: "Validate and sanitize all user inputs to prevent injection."
    };
  }
}

export default function CommandInjectionReport({ results }) {
  if (!results) return <p className="text-gray-500">No scan results to show.</p>;

  const { url, vulnerable_params = [], time_based_test, note } = results;
  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = vulnerable_params.filter(v => v.vulnerable).length;
  const vulnerableEntries = vulnerable_params.filter(v => v.vulnerable);

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black max-w-full">
      <h2 className="text-xl font-bold mb-2">Command Injection Report</h2>

      {/* 1. Scan Summary */}
      <div className="mb-4">
        <h3 className="font-semibold">1. Scan Summary</h3>
        <ul className="ml-4 list-disc">
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {url}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner Version:</strong> SecuriScan v1.0.0</li>
          {note && <li><strong>Note:</strong> {note}</li>}
        </ul>
      </div>

      {/* 2. Identified Vulnerabilities */}
      <div className="mb-4">
        <h3 className="font-semibold">2. Identified Vulnerability</h3>
        {vulnerableCount > 0 ? (
          <p>
            Found <strong>{vulnerableCount}</strong> vulnerable payload(s) out of{" "}
            <strong>{vulnerable_params.length}</strong> tested.
          </p>
        ) : (
          <p className="text-green-600">No vulnerabilities found.</p>
        )}

        {vulnerableEntries.length > 0 && (
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
                {vulnerableEntries.map((v, i) => {
                  const { severity, evidence, mitigation } = getSeverityAndMitigation(v.payload, v.evidence);
                  return (
                    <tr key={i} className="hover:bg-gray-100">
                      <td className="border p-2">{v.param}</td>
                      <td className="border p-2">{v.payload}</td>
                      <td className={`border p-2 ${v.vulnerable ? "text-red-600" : "text-green-600"}`}>
                        {v.vulnerable ? "Yes" : "No"}
                      </td>
                      <td className="border p-2">{severity}</td>
                      <td className="border p-2">{evidence}</td>
                      <td className="border p-2">{mitigation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Time-based Blind Check */}
      <div className="mb-4">
        <h3 className="font-semibold">3. Time-based Blind Command Injection Check</h3>
        {time_based_test ? (
          time_based_test.vulnerable ? (
            <div className="text-red-600">
              Potential time-based command injection detected with payload:{" "}
              <code>{time_based_test.payload}</code>
              {time_based_test.evidence && (
                <>
                  <br />
                  Evidence: {time_based_test.evidence}
                </>
              )}
              {time_based_test.note && (
                <>
                  <br />
                  Note: {time_based_test.note}
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-600">
              No significant delay detected from time-based injection attempts.
            </p>
          )
        ) : (
          <p className="text-gray-600">No time-based test data available.</p>
        )}
      </div>

      {/* 4. Scan Conclusion */}
      <div className="mb-4">
        <h3 className="font-semibold">4. Scan Conclusion</h3>
        {vulnerableCount > 0 || (time_based_test && time_based_test.vulnerable) ? (
          <p className="text-red-600">
            This scan identified <strong>{vulnerableCount}</strong> potential vulnerabilities.
            Immediate remediation is recommended.
          </p>
        ) : (
          <p className="text-green-600">
            The site appears free of high-level command injection vulnerabilities tested.
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
          Contact: securiscan@gmail.com
        </p>
      </div>
    </div>
  );
}