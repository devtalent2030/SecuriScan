"use client";

import React from "react";

export default function NosqlInjectionReport({ results }) {
  const {
    url,
    vulnerable_params = [],
    detected_endpoints = [],
    time_based_test,
    note,
  } = results || {};

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">NoSQL Injection Scan Report</h2>

      <p><strong>Target URL:</strong> {url}</p>
      <p><strong>Note:</strong> {note || "Scan completed."}</p>

      {/* 1. Vulnerable Parameters */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">1. Vulnerable Parameters</h3>
        {vulnerable_params.length === 0 ? (
          <p className="text-green-600">No vulnerable parameters detected.</p>
        ) : (
          <ul className="list-disc pl-5 text-red-600">
            {vulnerable_params.map((param, idx) => (
              <li key={idx}>
                <strong>{param.param}</strong> — Payload: <code>{param.payload}</code>{" "}
                {param.vulnerable && <span className="font-bold">(VULNERABLE)</span>}
                {param.evidence && <> — Evidence: {param.evidence}</>}
                {param.method && <> — Method: {param.method}</>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. Detected Endpoints */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">2. Detected Endpoints</h3>
        {detected_endpoints?.length === 0 ? (
          <p className="text-gray-600">No vulnerable endpoints detected.</p>
        ) : (
          <ul className="list-disc pl-5">
            {detected_endpoints.map((ep, idx) => (
              <li key={idx}>
                <strong>{ep.method}</strong> — <a className="text-blue-500 underline" href={ep.url} target="_blank" rel="noopener noreferrer">{ep.url}</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3. Time-Based Blind Injection */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">3. Time-Based Blind Check</h3>
        {time_based_test ? (
          <p className={time_based_test.vulnerable ? "text-red-600" : "text-green-600"}>
            {time_based_test.vulnerable ? "Vulnerable" : "Not Vulnerable"} — Payload: <code>{time_based_test.payload}</code>
            {time_based_test.evidence && <> — Evidence: {time_based_test.evidence}</>}
            {time_based_test.note && <> — Note: {time_based_test.note}</>}
          </p>
        ) : (
          <p className="text-gray-600">No time-based test result found.</p>
        )}
      </div>
    </div>
  );
}
