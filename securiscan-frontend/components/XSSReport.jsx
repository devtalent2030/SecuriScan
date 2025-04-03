"use client";

import React from "react";

function getSeverityAndMitigation(payload) {
  const lower = payload.toLowerCase();

  if (lower.includes("<script")) {
    return {
      severity: "High",
      evidence: "Payload reflected in response as executable script.",
      mitigation: "Escape HTML characters and implement strict Content Security Policy (CSP) to block inline scripts."
    };
  } else if (lower.includes("onerror") || lower.includes("onload") || lower.includes("onfocus")) {
    return {
      severity: "High",
      evidence: "Payload executed via event handler attribute in HTML response.",
      mitigation: "Sanitize attributes and use CSP to restrict event handler execution."
    };
  } else if (lower.includes("javascript:")) {
    return {
      severity: "High",
      evidence: "Payload executed as a pseudo-protocol in a URL attribute.",
      mitigation: "Filter out 'javascript:' schemes and validate URL inputs."
    };
  } else if (lower.includes("<img") || lower.includes("<svg") || lower.includes("<iframe")) {
    return {
      severity: "High",
      evidence: "Payload injected as an HTML element with potential script execution.",
      mitigation: "Escape HTML tags and enforce strict input validation."
    };
  } else if (lower.includes("alert")) {
    return {
      severity: "Medium",
      evidence: "Payload potentially reflected in a context allowing script execution.",
      mitigation: "Validate and sanitize all user inputs to prevent script injection."
    };
  } else {
    return {
      severity: "Medium",
      evidence: "Payload reflected in response without clear execution context.",
      mitigation: "Implement server-side input sanitization and output encoding."
    };
  }
}

export default function XSSReport({ results }) {
  if (!results) return <p className="text-gray-600">No scan results to display.</p>;

  const { url, vulnerable_params = [], time_based_test: timeTest } = results;
  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = vulnerable_params.filter(p => p.vulnerable).length;

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black max-w-full">
      <h2 className="text-xl font-bold mb-2">XSS Report</h2>

      {/* 1. Scan Summary */}
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
        <h3 className="font-semibold">2. Identified Vulnerability</h3>
        {vulnerableCount > 0 ? (
          <p>
            Found <strong>{vulnerableCount}</strong> vulnerable payload(s) out of{" "}
            <strong>{vulnerable_params.length}</strong> tested.
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
              {vulnerable_params.map((v, i) => {
                const { severity, evidence, mitigation } = getSeverityAndMitigation(v.payload || "");
                return (
                  <tr key={i} className="hover:bg-gray-100">
                    <td className="border p-2">{v.param || "N/A"}</td>
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
      </div>

      {/* 3. Time-based Blind XSS Check */}
      <div className="mb-4">
        <h3 className="font-semibold">3. Time-based Blind XSS Check</h3>
        {timeTest ? (
          timeTest.vulnerable ? (
            <div className="text-red-600">
              Potential time-based XSS detected with payload:{" "}
              <code>{timeTest.payload}</code>
              {timeTest.evidence && (
                <>
                  <br />
                  Evidence: {timeTest.evidence}
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

      {/* 4. Conclusion */}
      <div className="mb-4">
        <h3 className="font-semibold">4. Scan Conclusion</h3>
        {vulnerableCount > 0 || (timeTest && timeTest.vulnerable) ? (
          <p className="text-red-600">
            This scan identified <strong>{vulnerableCount}</strong> potential vulnerabilities.
            Immediate remediation is recommended.
          </p>
        ) : (
          <p className="text-green-600">
            The site appears free of high-level XSS vulnerabilities tested.
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