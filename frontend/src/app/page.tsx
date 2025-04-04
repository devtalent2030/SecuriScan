export default function Home() {
	return (
	  <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
		<h1 className="text-5xl font-bold mb-6">Welcome to SecuriScan</h1>
		<p className="text-lg max-w-2xl mb-8">
		  Your one-stop solution for website vulnerability detection, penetration testing, 
		  and comprehensive security reports.
		</p>
		<div className="flex space-x-4">
		  <a
			href="/dashboard"
			className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
		  >
			Get Started
		  </a>
		  <a
			href="/reports"
			className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded"
		  >
			View Reports
		  </a>
		</div>
	  </section>
	);
  }