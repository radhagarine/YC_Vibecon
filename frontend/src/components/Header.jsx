import React, { useState } from 'react';
import { Button } from './ui/button';
import { User } from 'lucide-react';

const Header = ({ isAuthenticated, onSignIn, onSignOut, onNavigate }) => {
  const [logoError, setLogoError] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {!logoError ? (
            <video 
              autoPlay
              loop
              muted
              playsInline
              className="h-12 w-auto"
              style={{ backgroundColor: 'transparent', mixBlendMode: 'screen' }}
              onError={() => setLogoError(true)}
            >
              <source src="/logo.webm" type="video/webm" />
              <source src="/logo.mp4" type="video/mp4" />
            </video>
          ) : (
            <div className="text-red-600 font-bold text-3xl">AIRA</div>
          )}
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => scrollToSection('home')} className="text-white hover:text-red-500 transition-colors font-light">
            Home
          </button>
          <button onClick={() => scrollToSection('about')} className="text-white hover:text-red-500 transition-colors font-light">
            About
          </button>
          <button onClick={() => scrollToSection('services')} className="text-white hover:text-red-500 transition-colors font-light">
            Services
          </button>
          <button onClick={() => scrollToSection('faqs')} className="text-white hover:text-red-500 transition-colors font-light">
            FAQs
          </button>
          <button onClick={() => scrollToSection('contact')} className="text-white hover:text-red-500 transition-colors font-light">
            Contact
          </button>
          {isAuthenticated && (
            <button onClick={() => onNavigate('/dashboard')} className="text-white hover:text-red-500 transition-colors font-light">
              Dashboard
            </button>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <Button 
              onClick={onSignIn}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-full px-6 transition-all"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          ) : (
            <Button 
              onClick={onSignOut}
              className="bg-red-600 hover:bg-red-700 text-white rounded px-6 transition-all"
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;