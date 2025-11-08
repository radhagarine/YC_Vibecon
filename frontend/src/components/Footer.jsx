import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-zinc-800 py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-red-600 font-bold text-2xl mb-4">AIRA</h3>
            <p className="text-gray-400 text-sm">
              Your AI-Powered Reception Assistant. Transforming customer service with intelligent automation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Home</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-red-600 transition-colors text-sm">About</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Services</a></li>
              <li><a href="#faqs" className="text-gray-400 hover:text-red-600 transition-colors text-sm">FAQs</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Help Center</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-zinc-800 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} AIRA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;