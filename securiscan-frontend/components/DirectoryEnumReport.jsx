"use client";

import React from "react";

function getSeverityAndMitigation(statusCode) {
  if (statusCode === 200) {
    return {
      severity: "High",
      evidence: "Directory openly accessible with successful response.",
      mitigation: "Restrict public access using .htaccess or server configurations."
    };
  } else if (statusCode === 403) {
    return {
      severity: "Medium",
      evidence: "Access forbidden, indicating directory exists but is restricted.",
      mitigation: "Review access permissions to ensure only authorized roles can access."
    };
  } else if (statusCode === 500) {
    return {
      severity: "Critical",
      evidence: "Server error suggests misconfiguration or sensitive data exposure.",
      mitigation: "Investigate server errors immediately and patch misconfigurations."
    };
  } else {
    return {
      severity: "Low",
      evidence: "No significant response indicating directory presence.",
      mitigation: "No immediate action needed; monitor for unusual activity."
    };
  }
}

export default function DirectoryEnumReport({ results }) {
  if (!results) return <p className="text-gray-600">No scan results to display.</p>;

  const { url, vulnerable_directories = [], note } = results;
  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = vulnerable_directories.length;

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black max-w-full">
      <h2 className="text-xl font-bold mb-2">Directory Enumeration Security Report</h2>

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
            Found <strong>{vulnerableCount}</strong> accessible or sensitive {vulnerableCount === 1 ? "directory" : "directories"} out of{" "}
            <strong>{vulnerable_directories.length}</strong> tested.
          </p>
        ) : (
          <p className="text-green-600">No vulnerabilities found.</p>
        )}

        {vulnerableCount > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full mt-2 border-collapse text-sm max-w-full">
              <thead>
                <tr className="bg-gray-200 text-black">
                  <th className="border p-2">URL</th>
                  <th className="border p-2">Status Code</th>
                  <th className="border p-2">Severity</th>
                  <th className="border p-2">Evidence</th>
                  <th className="border p-2">Recommended Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {vulnerable_directories.map((dir, idx) => {
                  const { severity, evidence, mitigation } = getSeverityAndMitigation(dir.status_code);
                  return (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border p-2">{dir.url}</td>
                      <td className="border p-2">{dir.status_code}</td>
                      <td className={`border p-2 ${severity === "Critical" ? "text-red-600" : severity === "High" ? "text-red-600" : severity === "Medium" ? "text-orange-600" : "text-green-600"}`}>
                        {severity}
                      </td>
                      <td className="border p-2">{dir.evidence || evidence}</td>
                      <td className="border p-2">{mitigation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Time-based Check (Placeholder) */}
      <div className="mb-4">
        <h3 className="font-semibold">3. Time-based Enumeration Check</h3>
        <p className="text-gray-600">No time-based enumeration tests performed for directories.</p>
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
            The site appears free of high-level directory enumeration vulnerabilities tested.
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