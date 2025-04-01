"use client";
import dynamic from "next/dynamic";

// Dynamically import the Shader component
const TanhShaderCanvas = dynamic(() => import("./TanhShader"), { ssr: false });

export default function AnimationPage() {
  return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* Fullscreen Animation Background */}
      <div className="absolute inset-0 -z-10">
        <TanhShaderCanvas />
      </div>

      {/* Page Content */}
      <div className="relative flex flex-col items-center justify-start flex-grow text-center px-4 mt-20">
        {/* Moved the text upwards */}
        <h1 className="text-5xl font-bold text-black">Welcome to SecuriScan</h1>
        <p className="mt-1 text-sm text-black max-w-lg">
          Your one-stop solution for website vulnerability detection, penetration testing, and security reports.
        </p>

        {/* Call to Action Button */}
        <div className="mt-6">
          <a href="/dashboard" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Get Started
          </a>
        </div>

        {/* Security Cards Section */}
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {/* Security Card 1 - Blue (Trust) */}
          <div className="w-64 h-64 p-6 rounded-lg bg-blue-500/30 backdrop-blur-lg shadow-md">
            <h3 className="text-lg font-bold text-black">Vulnerability Analysis</h3>
            <p className="text-sm text-gray-900">
              Scan your website for vulnerabilities and potential risks.
            </p>
          </div>

          {/* Security Card 2 - Red (Alert) */}
          <div className="w-64 h-64 p-6 rounded-lg bg-red-500/30 backdrop-blur-lg shadow-md">
            <h3 className="text-lg font-bold text-black">Penetration Testing</h3>
            <p className="text-sm text-gray-900">
              Simulate real-world attacks and assess security gaps.
            </p>
          </div>

          {/* Security Card 3 - Green (Safe) */}
          <div className="w-64 h-64 p-6 rounded-lg bg-green-500/30 backdrop-blur-lg shadow-md">
            <h3 className="text-lg font-bold text-black">Security Reports</h3>
            <p className="text-sm text-gray-900">
              Receive detailed reports with recommendations to improve security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}