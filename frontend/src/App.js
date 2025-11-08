import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { Toaster } from './components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const REDIRECT_URL = `${window.location.origin}/dashboard`;
const AUTH_URL = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(REDIRECT_URL)}`;

const HomePage = ({ isAuthenticated, onSignIn, onSignOut, onNavigate }) => {
  return (
    <div className="bg-black min-h-screen">
      <Header 
        isAuthenticated={isAuthenticated} 
        onSignIn={onSignIn} 
        onSignOut={onSignOut}
        onNavigate={onNavigate}
      />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <Toaster />
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSignIn = () => {
    window.location.href = AUTH_URL;
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const processAuth = async () => {
      // Check for session_id in URL fragment
      const hash = window.location.hash;
      if (hash && hash.includes('session_id=')) {
        const sessionId = hash.split('session_id=')[1].split('&')[0];
        
        try {
          // Exchange session_id for user data and session token
          const response = await fetch(`${API}/auth/session`, {
            method: 'POST',
            headers: {
              'X-Session-ID': sessionId
            },
            credentials: 'include'
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            
            // Clean URL
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            console.error('Auth failed:', response.status);
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      } else {
        // Check for existing session via cookie
        try {
          const response = await fetch(`${API}/auth/me`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          console.error('Session check error:', error);
        }
      }
      
      setLoading(false);
    };

    processAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              isAuthenticated={!!user}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
              onNavigate={(path) => window.location.href = path}
            />
          } 
        />
        <Route 
          path="/dashboard" 
          element={<Dashboard user={user} onSignOut={handleSignOut} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;