import React from 'react';
import { Clock, Phone, Zap } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: <Clock className="w-12 h-12" />,
      title: '24/7 Availability',
      description: 'Never miss a call or inquiry. AIRA works around the clock to serve your customers.'
    },
    {
      icon: <Phone className="w-12 h-12" />,
      title: 'Voice-Enabled',
      description: 'Natural voice interactions that feel human. No more frustrating automated systems.'
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'AI-Powered',
      description: 'Advanced AI technology that learns and adapts to your business needs.'
    }
  ];

  return (
    <section id="about" className="py-24 bg-zinc-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose <span className="text-red-600">AIRA</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience the future of customer service with AI technology that never sleeps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-zinc-800 p-8 rounded-lg hover:bg-zinc-750 transition-all transform hover:scale-105 border border-zinc-700"
            >
              <div className="text-red-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;