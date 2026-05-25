import React, { useState } from 'react';
import { contactService } from '../services/api';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactService.sendMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions or want to collaborate? Reach out to the Old Toms executive team.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-8">Get in Touch</h2>
            <p className="text-gray-600 text-lg mb-12 leading-relaxed">
              We are always open to hearing from fellow alumni, potential partners, and the community. 
              Whether it's a suggestion, a project proposal, or a general inquiry, we're here to help.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary mb-1">Email</h4>
                  <p className="text-gray-600 text-lg">info@oldtoms.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <MapPin className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary mb-1">Location</h4>
                  <p className="text-gray-600 text-lg">St. Thomas Aquinas SHS, Accra, Ghana</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="bg-green-50 p-4 rounded-xl">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary mb-1">Phone</h4>
                  <p className="text-gray-600 text-lg">+233 24 000 0000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-primary mb-4">Message Sent!</h3>
                <p className="text-gray-600 mb-8">
                  Thank you for reaching out. We will get back to you as soon as possible.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-primary font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                  <input
                    required
                    name="name"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input
                    required
                    name="email"
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    name="message"
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <button
                  disabled={loading}
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-lg ${
                    loading ? 'bg-gray-400' : 'bg-primary text-white hover:bg-blue-900'
                  }`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
