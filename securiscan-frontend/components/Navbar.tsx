"use client";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-gray-80 bg-opacity-35 p-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <Image
            src="/images/securiscan1.png"
            alt="SecuriScan Logo"
            width={80}
            height={20}
            className="cursor-pointer"
          />
        </Link>
        <div className="space-x-6 flex items-center">
          <Link href="/dashboard">
            <Image
              src="/images/Dashboad.png"
              alt="Dashboard Link"
              width={80}
              height={20}
              className="cursor-pointer"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}