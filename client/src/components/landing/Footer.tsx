import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden mt-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Info & Logo */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-4 mb-8 group">
                <div className="relative">
            <img
              src="/logo01.png"
              alt="Speak Bee Logo"
                    className="h-30 w-50 group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <div>
                  <p className="text-base text-slate-400">SpokenEnglish Learning Platform</p>
                </div>
          </Link>
              
              <p className="text-slate-300 mb-6 leading-relaxed text-sm lg:text-base">
                Transform your English speaking skills with our AI-powered, offline learning platform. 
                Designed for learners of all ages.
              </p>

              {/* Social Links */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-slate-400 text-base font-medium">Follow us:</span>
                <div className="flex items-center gap-4">
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-slate-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5 group-hover:text-white" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-slate-700 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 group-hover:text-white" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-slate-700 hover:bg-blue-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5 group-hover:text-white" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-slate-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5 group-hover:text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Learning Categories */}
            <div className="sm:col-span-1">
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-3">
                Learning Paths
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/kids" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    Kids Learning
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/adults" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    Adults Program
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/ielts-pte" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    IELTS / PTE Prep
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="sm:col-span-1">
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-3">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/why" 
                    className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-sm"
                  >
                    Why Speak Bee
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/how" 
                    className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-sm"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/help" 
                    className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-sm"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-sm"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400" />
                Get In Touch
              </h3>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">speakbee.ai@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">+94 74 389 9907</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">Chavakachcheri, Jaffna, Sri Lanka</span>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h4 className="font-semibold text-white mb-2 text-base">Stay Updated</h4>
                <p className="text-slate-400 text-xs mb-3">Get the latest learning tips and updates</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                  <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-1">
                    <span>Subscribe</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 bg-slate-900/50">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-400">
                <p>© {new Date().getFullYear()} Speak Bee. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <Link 
                    to="/privacy" 
                    className="hover:text-white transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                  <Link 
                    to="/terms" 
                    className="hover:text-white transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                  <Link 
                    to="/cookies" 
                    className="hover:text-white transition-colors duration-300"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Crafted with</span>
                <span className="text-red-400">❤️</span>
                <span>By Shenthuri Maran</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
