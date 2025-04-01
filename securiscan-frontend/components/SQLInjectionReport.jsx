"use client";

import React from "react";

export default function SQLInjectionReport({ results }) {
  const { url, sql_vulnerabilities, time_based_test, note } = results;

  return (
    <div className="bg-gray-800 bg-opacity-60 p-6 rounded-xl text-white shadow-lg space-y-6">
      <h2 className="text-3xl font-bold mb-4">SQL Injection Scan Report</h2>

      <div className="space-y-2 text-sm text-gray-300">
        <p><strong>Target URL:</strong> <a href={url} className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">{url}</a></p>
        {note && <p><strong>Note:</strong> {note}</p>}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">1. Detected Vulnerabilities</h3>
        {!sql_vulnerabilities || sql_vulnerabilities.length === 0 ? (
          <p className="text-green-400">✅ No SQL injection vulnerabilities detected.</p>
        ) : (
          <table className="w-full text-sm table-auto border border-gray-600">
            <thead>
              <tr className="bg-gray-700 text-indigo-300">
                <th className="py-2 px-4 border-b border-gray-600">Parameter</th>
                <th className="py-2 px-4 border-b border-gray-600">Payload</th>
                <th className="py-2 px-4 border-b border-gray-600">Vulnerable</th>
                <th className="py-2 px-4 border-b border-gray-600">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {sql_vulnerabilities.map((vuln, idx) => (
                <tr key={idx} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="py-2 px-4">{vuln.param}</td>
                  <td className="py-2 px-4 text-yellow-300">{vuln.payload}</td>
                  <td className={`py-2 px-4 font-bold ${vuln.vulnerable ? "text-red-400" : "text-green-400"}`}>
                    {vuln.vulnerable ? "Yes" : "No"}
                  </td>
                  <td className="py-2 px-4">{vuln.evidence || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {time_based_test && (
        <div>
          <h3 className="text-xl font-semibold mb-2">2. Time-Based Blind Test</h3>
          <p>
            <strong>Payload:</strong> <span className="text-yellow-300">{time_based_test.payload}</span><br />
            <strong>Status:</strong>{" "}
            <span className={time_based_test.vulnerable ? "text-red-400" : "text-green-400"}>
              {time_based_test.vulnerable ? "Vulnerable" : "Not Vulnerable"}
            </span><br />
            {time_based_test.evidence && (
              <p><strong>Evidence:</strong> {time_based_test.evidence}</p>
            )}
            {time_based_test.note && (
              <p className="text-gray-400"><strong>Note:</strong> {time_based_test.note}</p>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
