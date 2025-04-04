export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="flex min-h-screen bg-gray-400 dark:bg-gray-800 text-black dark:text-white">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-200 dark:bg-gray-800 p-4">
          <h2 className="text-xl font-bold mb-4">OWASP Top 10</h2>
          <nav className="space-y-2">
            {/* Only these two are fully functional now */}
            <a href="/dashboard/sql" className="block hover:bg-gray-700 p-2">
              SQL Injection
            </a>
            <a href="/dashboard/xss" className="block hover:bg-gray-700 p-2">
              XSS
            </a>
  
            {/* Remaining placeholders */}
            <a href="/dashboard/csrf" className="block hover:bg-gray-700 p-2">
              CSRF
            </a>
            <a href="/dashboard/directory_enum" className="block hover:bg-gray-700 p-2">
              Directory Enumeration
            </a>
            <a href="/dashboard/command_injection" className="block hover:bg-gray-700 p-2">
              Command Injection
            </a>
            <a href="/dashboard/nosql_injection" className="block hover:bg-gray-700 p-2">
              NoSQL Injection
            </a>
            <a href="/dashboard/broken_access" className="block hover:bg-gray-700 p-2">
              Broken Access Control
            </a>
            <a href="/dashboard/crypto_failures" className="block hover:bg-gray-700 p-2">
              Cryptographic Failures
            </a>
            <a href="/dashboard/security_misconfig" className="block hover:bg-gray-700 p-2">
              Security Misconfig
            </a>
            <a href="/dashboard/dependency_scanner" className="block hover:bg-gray-700 p-2">
              Dependency Scanner
            </a>
            <a href="/dashboard/auth_failures" className="block hover:bg-gray-700 p-2">
              Auth Failures
            </a>
            <a href="/dashboard/logging_monitor" className="block hover:bg-gray-700 p-2">
              Logging Monitor
            </a>
            <a href="/dashboard/ssrf" className="block hover:bg-gray-700 p-2">
              SSRF
            </a>
          </nav>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-400 dark:bg-gray-900 text-black dark:text-white">{children}</main>
      </div>
    );
  }