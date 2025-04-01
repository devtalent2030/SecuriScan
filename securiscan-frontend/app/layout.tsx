import "./globals.css"; // Tailwind global styles
import Navbar from "../components/Navbar"; // Custom navbar component
import Footer from "../components/Footer"; // Custom footer component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6 pt-24">{children}</div>
        <Footer />
      </body>
    </html>
  );
}