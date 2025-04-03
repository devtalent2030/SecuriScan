"use client";

import React from "react";

export default function SsrfReport({ results }) {
  if (!results) {
    return <p className="text-gray-300">No scan results to display.</p>;
  }

  const scanId = `SSRF-${new Date().getTime()}`;
  const scanDate = new Date().toLocaleString();
  const vulnerableCount = results.vulnerabilities ? results.vulnerabilities.length : 0;

  // Enhanced function to provide specific SSRF mitigation recommendations
  const getMitigationRecommendation = (vuln) => {
    if (!vuln?.issue || !vuln?.evidence) return "Review and secure the endpoint";

    const issueLower = vuln.issue.toLowerCase();
    const evidenceLower = vuln.evidence.toLowerCase();

    // SSRF-specific recommendations
    if (issueLower.includes("ssrf") && issueLower.includes("redirect")) {
      if (evidenceLower.includes("127.0.0.1") || evidenceLower.includes("localhost") || evidenceLower.includes("0.0.0.0")) {
        return "Block internal IP addresses (localhost, 127.0.0.1) and implement strict URL whitelisting";
      }
      if (evidenceLower.includes("169.254.169.254")) {
        return "Prevent access to cloud metadata services and implement network-level restrictions";
      }
      if (evidenceLower.includes("metadata.google.internal")) {
        return "Restrict access to Google Cloud metadata endpoints and validate redirect destinations";
      }
      if (evidenceLower.includes("192.168.") || evidenceLower.includes("10.0.") || evidenceLower.includes("172.16.")) {
        return "Restrict private network access and validate redirect URLs against an allowlist";
      }
      if (evidenceLower.includes("file://")) {
        return "Disable file protocol access and sanitize URL schemes in redirect handling";
      }
      if (evidenceLower.includes("gopher://")) {
        return "Block unsupported protocols (gopher) and restrict to HTTP/HTTPS only";
      }
      if (evidenceLower.includes("internal.example.com")) {
        return "Implement domain whitelisting and prevent internal domain redirection";
      }
      if (evidenceLower.includes("burpcollaborator.net")) {
        return "Validate all redirect URLs and implement outbound request filtering";
      }
    }

    // Fallback for generic SSRF
    if (issueLower.includes("ssrf")) {
      return "Implement strict URL validation, use a whitelist for allowed domains, and restrict internal network access";
    }

    // Generic fallback
    return "Validate and sanitize all user inputs, implement input filtering";
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg text-white max-w-full">
      <h2 className="text-xl font-bold mb-2">SSRF Report</h2>

      {/* 1. Scan Summary */}
      <div className="mb-4">
        <h3 className="font-semibold">1. Scan Summary</h3>
        <ul className="ml-4 list-disc">
          <li><strong>Scan ID:</strong> {scanId}</li>
          <li><strong>Target URL:</strong> {results.url || "N/A"}</li>
          <li><strong>Scan Date:</strong> {scanDate}</li>
          <li><strong>Scanner Version:</strong> SecuriScan v1.0.0</li>
        </ul>
      </div>

      {/* 2. Detected SSRF Vulnerabilities */}
      <div className="mb-4">
        <h3 className="font-semibold">2. Detected SSRF Vulnerabilities</h3>
        {results.error ? (
          <p className="text-red-400">{results.error}</p>
        ) : vulnerableCount > 0 ? (
          <p>
            Found <strong>{vulnerableCount}</strong> potential SSRF vulnerability(s).
          </p>
        ) : (
          <p className="text-green-400">No SSRF vulnerabilities detected.</p>
        )}

        {results.vulnerabilities && results.vulnerabilities.length > 0 && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th className="border p-2">Issue</th>
                  <th className="border p-2">Evidence</th>
                  <th className="border p-2">Severity</th>
                  <th className="border p-2">Recommended Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {results.vulnerabilities.map((vuln, idx) => (
                  <tr key={idx} className="hover:bg-gray-600">
                    <td className="border p-2">{vuln.issue}</td>
                    <td className="border p-2">{vuln.evidence || "N/A"}</td>
                    <td
                      className={`border p-2 ${
                        vuln.severity === "Critical" || vuln.severity === "High"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {vuln.severity || "Medium"}
                    </td>
                    <td className="border p-2">
                      {getMitigationRecommendation(vuln)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Additional Observations */}
      <div className="mb-4">
        <h3 className="font-semibold">3. Additional Observations</h3>
        {results.suspicious_endpoints && results.suspicious_endpoints.length > 0 ? (
          <div className="text-red-400">
            <p>Detected <strong>{results.suspicious_endpoints.length}</strong> suspicious endpoint(s):</p>
            <ul className="list-disc pl-5">
              {results.suspicious_endpoints.map((endpoint, idx) => (
                <li key={idx}>{endpoint}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-300">No suspicious endpoints detected.</p>
        )}
      </div>

      {/* 4. Conclusion */}
      <div className="mb-4">
        <h3 className="font-semibold">4. Scan Conclusion</h3>
        {results.error ? (
          <p className="text-red-400">Scan failed: {results.error}</p>
        ) : vulnerableCount > 0 || (results.suspicious_endpoints && results.suspicious_endpoints.length > 0) ? (
          <p className="text-red-400">
            Detected <strong>{vulnerableCount + (results.suspicious_endpoints ? results.suspicious_endpoints.length : 0)}</strong> issue(s).
            Immediate remediation recommended to prevent SSRF attacks.
          </p>
        ) : (
          <p className="text-green-400">
            No SSRF vulnerabilities found. Regular scans advised.
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