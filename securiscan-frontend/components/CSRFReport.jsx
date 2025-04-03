"use client";
import React from "react";

/**
 * getSeverityAndMitigation()
 * Classifies severity and offers mitigation advice for CSRF
 */
function getSeverityAndMitigation(csrfVuln) {
  if (csrfVuln?.vulnerable && csrfVuln?.method?.toUpperCase() === "POST") {
    return {
      severity: "High",
      mitigation: "Ensure all state-changing requests use CSRF tokens and verify origin headers.",
    };
  } else if (csrfVuln?.vulnerable && csrfVuln?.method?.toUpperCase() === "GET") {
    return {
      severity: "Medium",
      mitigation: "Avoid state-changing actions via GET requests and implement token validation.",
    };
  } else {
    return {
      severity: "Low",
      mitigation: "Continue to monitor forms and implement defensive-in-depth strategies.",
    };
  }
}

export default function CSRFReport({ results }) {
  if (!results) {
    return <p className="text-gray-600">No CSRF scan results to display.</p>;
  }

  const {
    url,
    csrf_vulnerabilities = [],
    time_based_test,
    error,
    note,
  } = results;

  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const total = Array.isArray(csrf_vulnerabilities) ? csrf_vulnerabilities.length : 0;
  const vulnerableCount = Array.isArray(csrf_vulnerabilities)
    ? csrf_vulnerabilities.filter((v) => v.vulnerable).length
    : 0;

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black">
      <h2 className="text-xl font-bold mb-4">CSRF Report</h2>

      {/* 1. Scan Metadata */}
      <div className="mb-4">
        <h3 className="font-semibold">1. Scan Summary</h3>
        <ul className="ml-4 list-disc">
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {url}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner Version:</strong> SecuriScan v1.0.0</li>
        </ul>
      </div>

      {/* 2. Identified Vulnerabilities */}
      <div className="mb-4">
        <h3 className="font-semibold">2. Identified Vulnerabilities</h3>
        {vulnerableCount > 0 ? (
          <p>
            Found <strong>{vulnerableCount}</strong> vulnerable form(s) out of{" "}
            <strong>{total}</strong> checked.
          </p>
        ) : (
          <p className="text-green-600">No CSRF vulnerabilities found.</p>
        )}

        {Array.isArray(csrf_vulnerabilities) && csrf_vulnerabilities.length > 0 && (
          <table className="w-full mt-2 border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200 text-black">
                <th className="border p-2">Form Action</th>
                <th className="border p-2">Method</th>
                <th className="border p-2">Vulnerable?</th>
                <th className="border p-2">Severity</th>
                <th className="border p-2">Evidence</th>
                <th className="border p-2">Recommended Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {csrf_vulnerabilities.map((vuln, idx) => {
                const { severity, mitigation } = getSeverityAndMitigation(vuln);
                return (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="border p-2">{vuln.form_action || "N/A"}</td>
                    <td className="border p-2">{vuln.method?.toUpperCase() || "Unknown"}</td>
                    <td className={`border p-2 ${vuln.vulnerable ? "text-red-600" : "text-green-600"}`}>
                      {vuln.vulnerable ? "Yes" : "No"}
                    </td>
                    <td className="border p-2">{severity}</td>
                    <td className="border p-2">{vuln.evidence || "No specific evidence"}</td>
                    <td className="border p-2">{mitigation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 3. Time-Based Checks (if any) */}
      {time_based_test && (
        <div className="mb-4">
          <h3 className="font-semibold">3. Time-Based Blind CSRF Detection</h3>
          {time_based_test.vulnerable ? (
            <div className="text-red-600">
              Delay-based response detected using:{" "}
              <code>{time_based_test.payload}</code>
            </div>
          ) : (
            <p className="text-gray-600">
              No suspicious delay-based response identified.
            </p>
          )}
        </div>
      )}

      {/* 4. Final Summary */}
      <div className="mb-4">
        <h3 className="font-semibold">4. Scan Conclusion</h3>
        {vulnerableCount > 0 ? (
          <p className="text-red-600">
            <strong>Warning:</strong> The application is vulnerable to CSRF attacks. Implement immediate mitigations.
          </p>
        ) : (
          <p className="text-green-600">
            No high-risk CSRF issues were found during the scan.
          </p>
        )}
      </div>

      {/* 5. Footer */}
      <div className="mb-2">
        <h3 className="font-semibold">5. Report Generator Info</h3>
        <p className="text-sm">
          Generated by: SecuriScan Automated Vulnerability Scanner <br />
          Format: HTML / PDF-ready <br />
          Contact: securiscan@gmail.com
        </p>
      </div>
    </div>
  );
}
