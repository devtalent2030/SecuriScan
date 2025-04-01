"use client";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Define minimal shape of the vulnerabilities array
interface SQLVulnerability {
  payload: string;
  vulnerable: boolean;
}

interface ScanResults {
  sql_vulnerabilities?: SQLVulnerability[];
}

interface ReportGeneratorProps {
  scanResults: ScanResults;
}

export default function ReportGenerator({ scanResults }: ReportGeneratorProps) {
  function handleDownloadPDF(): void {
    const doc = new jsPDF();

    doc.text("SecuriScan Report", 14, 14);

    if (scanResults.sql_vulnerabilities?.length) {
      const rows = scanResults.sql_vulnerabilities.map((vuln) => [
        vuln.payload,
        vuln.vulnerable ? "Yes" : "No",
      ]);

      (doc as unknown as { autoTable: (options: { head: string[][]; body: string[][] }) => void }).autoTable({
        head: [["Payload", "Vulnerable?"]],
        body: rows,
      });
    }

    doc.save("securiscan_report.pdf");
  }

  return (
    <button
      onClick={handleDownloadPDF}
      className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
    >
      Download PDF
    </button>
  );
}
