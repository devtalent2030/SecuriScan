import Image from "next/image";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-230 text-white py-8 px-6 mt-12 border-t border-gray-700">
      <div className="container mx-auto flex flex-col md:flex-row justify-center items-center gap-8">
        {/* Left Section: Project Contributors */}
        <div className="w-full md:w-1/2 text-center">
          <h2 className="text-xl font-bold">Project Contributors</h2>
          <div className="mt-4 space-y-3">
            {/* Grayson Hardy */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4">
              <Image
                src="/images/grayson.png"
                alt="Grayson Hardy"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-white">Grayson Hardy</p>
                <p className="text-sm text-white">
                  Project Manager & Security Specialist – Oversees penetration testing & project milestones.
                </p>
              </div>
            </div>

            {/* Talent Nyota */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4">
              <Image
                src="/images/talent.png"
                alt="Talent Nyota"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-white">Talent Nyota</p>
                <p className="text-sm text-white">
                  Backend & Frontend Developer,  – Leads backend architecture.
                </p>
              </div>
            </div>

            {/* Alexzander Saddler */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4">
              <Image
                src="/images/alexzander.png"
                alt="Alexzander Saddler"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-white">Alexzander Saddler</p>
                <p className="text-sm text-white">
                  Frontend Developer – Designs and develops the user interface & ensures seamless UX.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Quick Links */}
        <div className="w-full md:w-1/2 text-center">
          <h2 className="text-xl font-bold">Quick Links</h2>
          <nav className="mt-4 space-y-2">
            <a href="/about" className="block text-white font-bold hover:text-white">
              About Us
            </a>
            <a href="/privacy-policy" className="block text-white font-bold hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="block text-white font-bold hover:text-white">
              Terms of Service
            </a>
            <a href="/contact" className="block text-white font-bold hover:text-white">
              Contact
            </a>
          </nav>
        </div>
      </div>

      {/* Bottom Section: Social Media & Copyright */}
      <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-white font-bold">
        <div className="flex justify-center space-x-6">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            <FaGithub size={20} />
          </a>
        </div>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} SecuriScan. All rights reserved.
        </p>
      </div>
    </footer>
  );
}