import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowRight, Phone } from 'lucide-react';

const HeroSection = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOverlay(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Force video to play
    if (videoRef.current && !videoError) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay failed:', error);
        setVideoError(true);
      });
    }
  }, [videoError]);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ backgroundColor: 'transparent' }}
        onError={() => {
          console.log('Video failed to load');
          setVideoError(true);
        }}
        onLoadedData={() => {
          console.log('Video loaded successfully');
        }}
      >
        <source src="/logo.mp4" type="video/mp4" />
      </video>

      {/* Animated Background Fallback - only show if video fails */}
      {videoError && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>

      {/* Text Overlay */}
      <div 
        className={`absolute top-0 left-0 w-full h-full flex items-center transition-opacity duration-1000 ${
          showOverlay ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-3xl">
            <h2 className="text-white text-2xl md:text-3xl font-light mb-6">
              Meet
            </h2>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8" style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #FF8C00 50%, #FF4500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(255, 215, 0, 0.5)'
            }}>
              AiRA
            </h1>
            <h3 className="text-white text-2xl md:text-3xl font-light mb-6">
              Your AI-Powered Reception Assistant
            </h3>
            <p className="text-gray-300 text-lg md:text-xl mb-12 font-light">
              Transform your business with 24/7 voice-enabled customer service that never sleeps.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded transition-all transform hover:scale-105"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg rounded transition-all transform hover:scale-105"
              >
                <Phone className="mr-2 w-5 h-5" />
                Try Live Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;