"use client";

import React from "react";

function getSeverity(statusCode) {
  if (statusCode === 200) return "High";
  if (statusCode === 403) return "Medium";
  if (statusCode === 500) return "Critical";
  return "Low";
}

function getMitigation(severity) {
  switch (severity) {
    case "High":
      return "Restrict public access using .htaccess or server configs.";
    case "Medium":
      return "Review access permissions to confirm only authorized roles can access.";
    case "Critical":
      return "Immediately investigate server errors, patch misconfigurations.";
    default:
      return "No action needed.";
  }
}

export default function DirectoryEnumReport({ results }) {
  if (!results) return <p className="text-gray-600">No scan results to display.</p>;

  const { url, vulnerable_directories = [], note } = results;
  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black">
      <h2 className="text-xl font-bold mb-2">Directory Enumeration Security Report</h2>

      <div className="mb-4">
        <h3 className="font-semibold">1. Scan Summary</h3>
        <ul className="ml-4 list-disc">
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {url}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner:</strong> SecuriScan v1.2.0</li>
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">2. Detected Directories</h3>
        {vulnerable_directories.length > 0 ? (
          <table className="w-full mt-2 border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">URL</th>
                <th className="border p-2">Status Code</th>
                <th className="border p-2">Severity</th>
                <th className="border p-2">Mitigation</th>
                <th className="border p-2">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {vulnerable_directories.map((dir, idx) => {
                const severity = getSeverity(dir.status_code);
                const mitigation = getMitigation(severity);
                return (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="border p-2">{dir.url}</td>
                    <td className="border p-2">{dir.status_code}</td>
                    <td className={`border p-2 font-bold text-${severity === "High" ? "red" : severity === "Medium" ? "orange" : "green"}-600`}>
                      {severity}
                    </td>
                    <td className="border p-2">{mitigation}</td>
                    <td className="border p-2">{dir.evidence || "None"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-green-600">No accessible directories found.</p>
        )}
      </div>

      {note && (
        <div className="mb-4">
          <h3 className="font-semibold">3. Notes</h3>
          <p>{note}</p>
        </div>
      )}

      <div>
        <h3 className="font-semibold">4. Report Generated By</h3>
        <p className="text-sm">SecuriScan Automated Security Scanner</p>
      </div>
    </div>
  );
}
