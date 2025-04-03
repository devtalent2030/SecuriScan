"use client";

import React from "react";

export default function CryptoFailuresReport({ results }) {
  if (!results) return <p className="text-gray-500">No scan results to show.</p>;

  const { url, vulnerabilities = [], certificate_info, tls_info, exposed_data = [] } = results;
  const scanId = `SCAN-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();

  return (
    <div className="bg-white p-4 border rounded mt-4 text-black max-w-full">
      <h2 className="text-xl font-bold mb-2">Crypto Failures Report</h2>

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
        <h3 className="font-semibold">2. Identified Vulnerabilities</h3>
        {vulnerabilities.length > 0 ? (
          <>
            <p>Found <strong>{vulnerabilities.length}</strong> cryptographic vulnerabilit{vulnerabilities.length === 1 ? "y" : "ies"}.</p>
            <div className="overflow-x-auto">
              <table className="w-full mt-2 border-collapse text-sm max-w-full">
                <thead>
                  <tr className="bg-gray-200 text-black">
                    <th className="border p-2">Issue</th>
                    <th className="border p-2">Severity</th>
                    <th className="border p-2">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {vulnerabilities.map((vuln, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border p-2">{vuln.issue}</td>
                      <td className={`border p-2 ${vuln.severity === "Critical" ? "text-red-600" : vuln.severity === "High" ? "text-orange-600" : vuln.severity === "Medium" ? "text-yellow-600" : "text-green-600"}`}>
                        {vuln.severity}
                      </td>
                      <td className="border p-2">{vuln.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-green-600">No cryptographic vulnerabilities found.</p>
        )}
      </div>

      {/* 3. TLS Configuration */}
      <div className="mb-4">
        <h3 className="font-semibold">3. TLS Configuration</h3>
        {tls_info ? (
          tls_info.error ? (
            <p className="text-red-600">TLS check failed: {tls_info.error}</p>
          ) : (
            <ul className="ml-4 list-disc">
              <li><strong>Version:</strong> {tls_info.version}</li>
              <li><strong>Cipher:</strong> {tls_info.cipher}</li>
            </ul>
          )
        ) : (
          <p className="text-gray-600">No TLS information available.</p>
        )}
      </div>

      {/* 4. Certificate Details */}
      <div className="mb-4">
        <h3 className="font-semibold">4. Certificate Details</h3>
        {certificate_info ? (
          certificate_info.error ? (
            <p className="text-red-600">Certificate check failed: {certificate_info.error}</p>
          ) : (
            <ul className="ml-4 list-disc">
              <li><strong>Issuer:</strong> {certificate_info.issuer}</li>
              <li><strong>Subject:</strong> {certificate_info.subject}</li>
              <li><strong>Not Before:</strong> {certificate_info.not_before}</li>
              <li><strong>Not After:</strong> {certificate_info.not_after}</li>
              <li><strong>Expired:</strong> {certificate_info.expired ? "Yes" : "No"}</li>
            </ul>
          )
        ) : (
          <p className="text-gray-600">No certificate information available.</p>
        )}
      </div>

      {/* 5. Sensitive Data Exposure */}
      <div className="mb-4">
        <h3 className="font-semibold">5. Sensitive Data Exposure</h3>
        {exposed_data.length > 0 ? (
          <ul className="ml-4 list-disc text-red-600">
            {exposed_data.map((data, idx) => (
              <li key={idx}>{data.slice(0, 20)}...</li>
            ))}
          </ul>
        ) : (
          <p className="text-green-600">No sensitive data exposed in response.</p>
        )}
      </div>

      {/* 6. Scan Conclusion */}
      <div className="mb-4">
        <h3 className="font-semibold">6. Scan Conclusion</h3>
        {vulnerabilities.some(v => v.severity === "High" || v.severity === "Critical") ? (
          <p className="text-red-600">
            This scan identified critical or high-severity cryptographic vulnerabilities.
            Immediate remediation is recommended.
          </p>
        ) : vulnerabilities.length > 0 ? (
          <p className="text-yellow-600">
            This scan identified minor cryptographic issues.
            Review and address as needed.
          </p>
        ) : (
          <p className="text-green-600">
            No significant cryptographic vulnerabilities detected.
            Periodic scanning is still recommended.
          </p>
        )}
      </div>

      {/* 7. Footer */}
      <div className="mb-2">
        <h3 className="font-semibold">7. Report Generated By</h3>
        <p className="text-sm">
          Generated By: SecuriScan Automated Security Scanner <br />
          Report Format: PDF/HTML/Markdown <br />
          Contact: securiscan@gmail.com
        </p>
      </div>
    </div>
  );
}