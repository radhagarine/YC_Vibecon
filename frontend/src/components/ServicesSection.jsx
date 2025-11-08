import React from 'react';
import { Calendar, MessageSquare, Users, Headphones } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const ServicesSection = () => {
  const services = [
    {
      icon: <Calendar className="w-10 h-10" />,
      title: 'Appointment Scheduling',
      description: 'Automatically schedule and manage appointments with integrated calendar systems.'
    },
    {
      icon: <MessageSquare className="w-10 h-10" />,
      title: 'Customer Inquiries',
      description: 'Answer common questions instantly with AI-powered responses.'
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: 'Visitor Management',
      description: 'Greet visitors professionally and route them to the right department.'
    },
    {
      icon: <Headphones className="w-10 h-10" />,
      title: 'Call Handling',
      description: 'Handle incoming calls with natural voice conversations and smart routing.'
    }
  ];

  return (
    <section id="services" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our <span className="text-red-600">Services</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Comprehensive AI reception services tailored to your business needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="bg-zinc-900 border-zinc-800 hover:border-red-600 transition-all transform hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="text-red-600 mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;