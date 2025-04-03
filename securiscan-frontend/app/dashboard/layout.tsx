export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-900 p-4 shadow-md border-r border-purple-800 rounded-l-2xl">
        <h2 className="text-xl font-bold mb-4 text-white text-center">
          OWASP Top 10
        </h2>
        <nav className="bg-purple-900 p-4 shadow-md border-b border-purple-800">
          {/* Functional Sections */}
          <a
            href="/dashboard/sql"
            className="block bg-purple-700 text-white text-center p-2 rounded-md hover:bg-purple-600 transition mb-2"
          >
            SQL Injection
          </a>
          <a
            href="/dashboard/xss"
            className="block bg-purple-700 text-white text-center p-2 rounded-md hover:bg-purple-600 transition mb-2"
          >
            XSS
          </a>

          {/* Remaining Sections */}
          <a
            href="/dashboard/csrf"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            CSRF
          </a>
          <a
            href="/dashboard/directory_enum"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            Directory Enumeration
          </a>
          <a
            href="/dashboard/command_injection"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            Command Injection
          </a>
          <a
            href="/dashboard/nosql_injection"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            NoSQL Injection
          </a>
          <a
            href="/dashboard/broken_access"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            Broken Access Control
          </a>
          <a
            href="/dashboard/crypto_failures"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            Cryptographic Failures
          </a>
          <a
            href="/dashboard/security_misconfig"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            Security Misconfig
          </a>
          <a
            href="/dashboard/dependency_scanner"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            Dependency Scanner
          </a>
          <a
            href="/dashboard/auth_failures"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            Auth Failures
          </a>
          <a
            href="/dashboard/logging_monitor"
            className="block bg-purple-800 text-white text-center p-2 rounded-md hover:bg-purple-700 transition mb-2"
          >
            Logging Monitor
          </a>
          <a
            href="/dashboard/ssrf"
            className="block bg-purple-700 text-white text-center p-2 rounded-md hover:bg-purple-600 transition mb-2"
          >
            SSRF
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gradient-to-br from-purple-950 via-indigo-900 to-gray-900 text-white rounded-r-2xl">
        {children}
      </main>
    </div>
  );
}