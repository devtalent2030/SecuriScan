"use client";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface ReportGeneratorProps {
  scanResults: any; // or a typed interface
}

export default function ReportGenerator({ scanResults }: ReportGeneratorProps) {
  function handleDownloadPDF() {
    const doc = new jsPDF();

    doc.text("SecuriScan Report", 14, 14);

    // Example: if `scanResults` is an object with vulnerabilities
    if (scanResults.sql_vulnerabilities) {
      // You can convert them to table rows
      const rows = scanResults.sql_vulnerabilities.map((vuln: any) => [
        vuln.payload,
        vuln.vulnerable ? "Yes" : "No",
      ]);

      (doc as any).autoTable({
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