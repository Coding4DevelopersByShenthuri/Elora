import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Globe,
  Shield,
  Award,
  Users,
  BookOpen,
  Star
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            
            {/* Company Info & Logo */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="relative">
                  <img
                    src="/logo01.png"
                    alt="Speak Bee Logo"
                    className="h-16 w-auto group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <div>
                  <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Speak Bee
                  </span>
                  <p className="text-sm text-slate-400">English Learning Platform</p>
                </div>
              </Link>
              
              <p className="text-slate-300 mb-6 leading-relaxed max-w-md">
                Transform your English speaking skills with our AI-powered, offline learning platform. 
                Designed for learners of all ages - from kids to professionals preparing for IELTS/PTE.
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>100% Offline</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>All Ages</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span>5-Star Rated</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm font-medium">Follow us:</span>
                <div className="flex items-center gap-3">
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-slate-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4 group-hover:text-white" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-slate-700 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 group-hover:text-white" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-slate-700 hover:bg-blue-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4 group-hover:text-white" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-slate-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4 group-hover:text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Learning Categories */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Learning Paths
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/kids" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="text-lg">👶</span>
                    <span>Kids Learning</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/adults" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="text-lg">👨‍💼</span>
                    <span>Adults Program</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/adults/beginners" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group ml-4"
                  >
                    <span className="text-sm">•</span>
                    <span>Beginners</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/adults/intermediates" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group ml-4"
                  >
                    <span className="text-sm">•</span>
                    <span>Intermediate</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/adults/advanced" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group ml-4"
                  >
                    <span className="text-sm">•</span>
                    <span>Advanced</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/ielts-pte" 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="text-lg">🎓</span>
                    <span>IELTS / PTE Prep</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-400" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/" 
                    className="text-slate-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span>Home</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/why" 
                    className="text-slate-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span>Why Speak Bee</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/how" 
                    className="text-slate-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span>How It Works</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/help" 
                    className="text-slate-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span>Help Center</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-slate-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span>Contact Us</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Get In Touch
              </h3>
              
              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">support@speakbee.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">Global Learning Platform</span>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h4 className="font-semibold text-white mb-2 text-sm">Stay Updated</h4>
                <p className="text-slate-400 text-xs mb-3">Get the latest learning tips and updates</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                  <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 bg-slate-900/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-slate-400">
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
              
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Made with</span>
                <span className="text-red-400">❤️</span>
                <span>for English learners worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
