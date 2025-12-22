import { Linkedin, Instagram, Globe, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Row 1 - Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
          {/* Col 1 - About Us */}
          <div className="text-center">
            <h3 className="mb-4 text-white">About Us</h3>
            <p className="text-gray-400 text-sm">
              WebAcademy is supporting you to grow in your career by providing curated learning tracks and educational resources
            </p>
          </div>

          {/* Col 2 - Resources */}
          <div>
            <h3 className="mb-4 text-white text-center">Resources</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <li className="text-center">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Tracks
                </a>
              </li>
              <li className="text-center">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Courses
                </a>
              </li>
              <li className="text-center">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Books
                </a>
              </li>
              <li className="text-center">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Projects
                </a>
              </li>
              <li className="text-center">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Articles & Blogs
                </a>
              </li>
              <li className="text-center">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Talks & Videos
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 - Contact Us */}
          <div className="text-center">
            <h3 className="mb-4 text-white">Contact Us</h3>
            <ul className="space-y-2 text-sm flex flex-col items-center">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <a href="mailto:academy@one-web.nl" className="hover:text-white transition-colors">
                  academy@one-web.nl
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <a href="tel:+31402180558" className="hover:text-white transition-colors">
                  +31 40 218 0558
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 - Follow Us */}
          <div className="text-center">
            <h3 className="mb-4 text-white">Follow Us</h3>
            <ul className="space-y-2 text-sm flex flex-col items-center">
              <li className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-gray-400" />
                <a
                  href="https://nl.linkedin.com/company/webeindhoven-porto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-gray-400" />
                <a
                  href="https://www.instagram.com/webeindhoven/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <a
                  href="https://one-web.nl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Website
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Row 2 - Bottom Row aligned with columns */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Empty column 1 */}
            <div></div>
            
            {/* Column 2 - Copyright */}
            <div className="text-center text-sm text-gray-400">
              <p>© One WEB 2025</p>
            </div>
            
            {/* Column 3 - Privacy Policy */}
            <div className="text-center text-sm text-gray-400">
              <a
                href="https://one-web.nl/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Privacy policy
              </a>
            </div>
            
            {/* Empty column 4 */}
            <div></div>
          </div>
        </div>
      </div>
    </footer>
  );
}