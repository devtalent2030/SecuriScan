export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 shadow-md border-r border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-black text-center">
          OWASP Top 10
        </h2>
        <nav className="bg-white p-4 shadow-md border-b border-gray-300">
          {/* Functional Sections */}
          <a href="/dashboard/sql" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            SQL Injection
          </a>
          <a href="/dashboard/xss" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            XSS
          </a>

          {/* Remaining Sections */}
          <a href="/dashboard/csrf" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            CSRF
          </a>
          <a href="/dashboard/directory_enum" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            Directory Enumeration
          </a>
          <a href="/dashboard/command_injection" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            Command Injection
          </a>
          <a href="/dashboard/nosql_injection" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            NoSQL Injection
          </a>
          <a href="/dashboard/broken_access" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            Broken Access Control
          </a>
          <a href="/dashboard/crypto_failures" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            Cryptographic Failures
          </a>
          <a href="/dashboard/security_misconfig" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            Security Misconfig
          </a>
          <a href="/dashboard/dependency_scanner" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            Dependency Scanner
          </a>
          <a href="/dashboard/auth_failures" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            Auth Failures
          </a>
          <a href="/dashboard/logging_monitor" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            Logging Monitor
          </a>
          <a href="/dashboard/ssrf" className="block bg-gray-200 text-black text-center p-2 rounded-md hover:bg-gray-300 transition">
            SSRF
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white text-black">{children}</main>
    </div>
  );
}