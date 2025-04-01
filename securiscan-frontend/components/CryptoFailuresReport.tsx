"use client";

import React from "react";
import { CryptoFailuresScanResult } from "../app/dashboard/types";

export default function CryptoFailuresReport({ results }: { results: CryptoFailuresScanResult }) {
  const { url, vulnerabilities = [], certificate_info, tls_info, exposed_data = [], note, error } = results;

  return (
    <div className="bg-gray-800 bg-opacity-60 p-6 rounded-xl text-white shadow-lg space-y-6">
      <h2 className="text-3xl font-bold mb-4">Cryptographic Failures Scan Report</h2>

      <div className="space-y-2 text-sm text-gray-300">
        <p>
          <strong>Target URL:</strong>{" "}
          <a
            href={url}
            className="text-indigo-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {url}
          </a>
        </p>
        {note && <p><strong>Note:</strong> {note}</p>}
      </div>

      {/* 1. Vulnerabilities */}
      <div>
        <h3 className="text-xl font-semibold mb-2">1. Detected Vulnerabilities</h3>
        {error ? (
          <p className="text-red-400">❌ {error}</p>
        ) : vulnerabilities.length === 0 ? (
          <p className="text-green-400">✅ No cryptographic failures detected.</p>
        ) : (
          <table className="w-full text-sm table-auto border border-gray-600">
            <thead>
              <tr className="bg-gray-700 text-indigo-300">
                <th className="py-2 px-4 border-b border-gray-600">Issue</th>
                <th className="py-2 px-4 border-b border-gray-600">Severity</th>
                <th className="py-2 px-4 border-b border-gray-600">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.map((vuln, idx) => (
                <tr key={idx} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="py-2 px-4">{vuln.issue}</td>
                  <td className={`py-2 px-4 font-bold ${
                    vuln.severity === "Critical" || vuln.severity === "High"
                      ? "text-red-400"
                      : "text-yellow-300"
                  }`}>
                    {vuln.severity}
                  </td>
                  <td className="py-2 px-4">{vuln.evidence || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 2. Certificate */}
      {certificate_info && (
        <div>
          <h3 className="text-xl font-semibold mb-2">2. Certificate Details</h3>
          {certificate_info.error ? (
            <p className="text-red-400">❌ Certificate Error: {certificate_info.error}</p>
          ) : (
            <ul className="text-sm text-gray-300 list-disc pl-5">
              <li>Issuer: {certificate_info.issuer}</li>
              <li>Subject: {certificate_info.subject}</li>
              <li>Valid From: {certificate_info.not_before}</li>
              <li>Valid Until: {certificate_info.not_after}</li>
              <li>
                Expired:{" "}
                <span className={certificate_info.expired ? "text-red-400" : "text-green-400"}>
                  {certificate_info.expired ? "Yes" : "No"}
                </span>
              </li>
            </ul>
          )}
        </div>
      )}

      {/* 3. TLS Info */}
      {tls_info && (
        <div>
          <h3 className="text-xl font-semibold mb-2">3. TLS Configuration</h3>
          {tls_info.error ? (
            <p className="text-red-400">❌ TLS Error: {tls_info.error}</p>
          ) : (
            <ul className="text-sm text-gray-300 list-disc pl-5">
              <li>Version: {tls_info.version}</li>
              <li>Cipher: {tls_info.cipher}</li>
            </ul>
          )}
        </div>
      )}

      {/* 4. Exposed Data */}
      {exposed_data.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2 text-red-400">4. Exposed Sensitive Data</h3>
          <ul className="text-sm text-red-300 list-disc pl-5">
            {exposed_data.map((entry, i) => (
              <li key={i}>{entry.slice(0, 30)}...</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
