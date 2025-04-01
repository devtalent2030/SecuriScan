"use client";
import React from "react";

export default function CommandInjectionReport({ results }) {
  if (!results) return <p className="text-gray-500">No scan results to show.</p>;

  const { url, vulnerabilities = [], time_based_test, note } = results;
  const scanId = `CMD-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const found = vulnerabilities.filter(v => v.vulnerable).length;

  return (
    <div className="bg-white p-6 rounded-md text-black shadow">
      <h2 className="text-xl font-bold mb-4">Command Injection Scan Report</h2>
      <ul className="mb-4">
        <li><strong>Scan ID:</strong> {scanId}</li>
        <li><strong>Target URL:</strong> {url}</li>
        <li><strong>Scan Date:</strong> {scanDate}</li>
        <li><strong>Detected Vulnerabilities:</strong> {found} / {vulnerabilities.length}</li>
      </ul>

      {vulnerabilities.length > 0 && (
        <table className="w-full text-sm border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Param</th>
              <th className="border p-2">Payload</th>
              <th className="border p-2">Vulnerable?</th>
              <th className="border p-2">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {vulnerabilities.map((v, i) => (
              <tr key={i} className="hover:bg-gray-100">
                <td className="border p-2">{v.param}</td>
                <td className="border p-2">{v.payload}</td>
                <td className={`border p-2 font-semibold ${v.vulnerable ? "text-red-600" : "text-green-600"}`}>
                  {v.vulnerable ? "Yes" : "No"}
                </td>
                <td className="border p-2">{v.evidence || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {time_based_test && (
        <div className="mt-4">
          <h3 className="font-semibold">Time-Based Blind Check</h3>
          <p>
            <strong>Payload:</strong> <code>{time_based_test.payload}</code><br />
            <strong>Status:</strong>{" "}
            {time_based_test.vulnerable ? (
              <span className="text-red-600 font-semibold">Vulnerable</span>
            ) : (
              <span className="text-green-600">Not Vulnerable</span>
            )}
            <br />
            <strong>Evidence:</strong> {time_based_test.evidence || "N/A"}
          </p>
        </div>
      )}

      {note && <p className="mt-4 italic text-gray-700">{note}</p>}
    </div>
  );
}
