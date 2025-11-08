import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    toast({
      title: "Message Sent!",
      description: "We'll get back to you soon.",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in <span className="text-red-600">Touch</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ready to transform your reception? Let's talk.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
              <p className="text-gray-400 mb-8">
                Reach out to us through any of these channels, and our team will respond promptly.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-red-600 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Email</h4>
                  <p className="text-gray-400">contact@aira-assistant.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-600 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Phone</h4>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-600 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Office</h4>
                  <p className="text-gray-400">123 AI Street, Tech City, TC 12345</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="text-white mb-2 block">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-white mb-2 block">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="text-white mb-2 block">Message</label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your needs..."
                  rows={5}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg transition-all transform hover:scale-105"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;