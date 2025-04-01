"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-80 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-bold cursor-pointer">SecuriScan</span>
        </Link>
        <div className="space-x-6">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/reports">Reports</Link>
        </div>
      </div>
    </nav>
  );
}