import React from 'react';
import { Target, Eye, Heart, Shield, TrendingUp, Users } from 'lucide-react';

const About = () => {
  const values = [
    { name: 'Unity', icon: Users, description: 'Bound by shared experiences and lifelong friendships.' },
    { name: 'Excellence', icon: TrendingUp, description: 'Striving for the highest standards in all our endeavors.' },
    { name: 'Integrity', icon: Shield, description: 'Honesty and strong moral principles in our professional lives.' },
    { name: 'Growth', icon: Target, description: 'Commitment to continuous personal and professional development.' },
    { name: 'Support', icon: Heart, description: 'Fostering a supportive network for every member.' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Who We Are</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Old Toms is the official alumni group for the 2016 graduating class of St. Thomas Aquinas Senior High School. We are a community bound by shared experiences, lifelong friendships, and a commitment to growth.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-blue-50 p-10 rounded-2xl border-l-8 border-primary">
          <h2 className="text-3xl font-bold text-primary mb-6">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            To build a strong and supportive network that fosters connection, collaboration, and continuous development among members.
          </p>
        </div>
        <div className="bg-yellow-50 p-10 rounded-2xl border-l-8 border-secondary">
          <h2 className="text-3xl font-bold text-primary mb-6">Our Vision</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            To become a global alumni community recognized for impact, unity, and excellence.
          </p>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.name} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                <div className="bg-blue-50 p-4 rounded-full mb-6 group-hover:bg-primary transition-colors">
                  <value.icon className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{value.name}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History/Story Section */}
      <div className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
             <div className="aspect-video bg-gray-200 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="text-gray-400 italic text-lg">School Memory Placeholder</span>
             </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold text-primary mb-6">Our Legacy</h2>
            <p className="text-gray-600 text-lg mb-6">
              Founded on the principles of discipline and brotherhood at St. Thomas Aquinas SHS, the Class of 2016 has always been a trailblazing group. 
            </p>
            <p className="text-gray-600 text-lg">
              Today, our members are leaders in tech, medicine, business, and more, but we remain connected by the blue and white colors that shaped our formative years.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
