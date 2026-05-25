/** @format */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Globe,
  Rocket,
  ArrowRight,
  Handshake,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

const Home = () => {
  return (
    <div className='flex flex-col w-full'>
      {/* Hero Section */}
      <section className='bg-primary text-white py-20 px-4 md:py-32 relative overflow-hidden'>
        {/* Background Image with Overlay */}
        <div className='absolute inset-0 z-0'>
          <img
            src='https://images.unsplash.com/photo-1523050335392-9ae824979603?auto=format&fit=crop&q=80&w=2000'
            alt='Campus Background'
            className='w-full h-full object-cover opacity-20'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent'></div>
        </div>

        <div className='max-w-7xl mx-auto flex flex-col items-center text-center relative z-10'>
          <h1 className='text-4xl md:text-6xl font-extrabold mb-6 leading-tight'>
            OLD TOMS – Class of 2016
          </h1>
          <p className='text-xl md:text-2xl text-secondary font-semibold mb-4 uppercase tracking-widest'>
            Brotherhood. Legacy. Impact.
          </p>
          <p className='text-lg md:text-xl text-gray-300 max-w-2xl mb-10'>
            A network of driven individuals shaping the future across industries
            and continents.
          </p>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link
              to='/join'
              className='bg-secondary text-primary hover:bg-yellow-400 px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg transform hover:-translate-y-1'>
              Join the Network
            </Link>
            <Link
              to='/events'
              className='bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg transform hover:-translate-y-1 flex items-center justify-center'>
              <Calendar className='mr-2 h-5 w-5' />
              Register for Event
            </Link>
            <Link
              to='/alumni'
              className='bg-transparent border-2 border-white hover:bg-white hover:text-primary px-8 py-3 rounded-full font-bold text-lg transition-all'>
              Explore Alumni
            </Link>
          </div>
          <p className='text-xxl md:text-2xl text-secondary font-semibold  mt-8   tracking-widest'>
            BeeB3!!!.
          </p>
        </div>
      </section>

      {/* About Preview */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
          <div>
            <h2 className='text-3xl md:text-4xl font-bold text-primary mb-6'>
              About the Class of 2016
            </h2>
            <p className='text-gray-600 text-lg mb-6 leading-relaxed'>
              The Old Toms Class of 2016 represents a generation built on
              discipline, excellence, and unity. From our days at St. Thomas
              Aquinas SHS to today, we continue to grow, support one another,
              and make meaningful impact in society.
            </p>
            <Link
              to='/about'
              className='text-primary font-bold flex items-center hover:gap-2 transition-all group'>
              Learn More{' '}
              <ArrowRight className='ml-2 h-5 w-5 group-hover:text-secondary' />
            </Link>
          </div>
          <div className='relative'>
            <img
              src='https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000'
              alt='Alumni Gathering'
              className='rounded-3xl shadow-2xl w-full h-80 object-cover transform -rotate-2 hover:rotate-0 transition-transform duration-500'
            />
            <div className='absolute -bottom-6 -right-6 bg-secondary p-6 rounded-2xl shadow-xl hidden md:block'>
              <p className='text-primary font-black text-xl'>Est. 1939</p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 text-center mb-16'>
          <h2 className='text-3xl font-bold text-primary mb-4'>
            Our Growing Network
          </h2>
        </div>
        <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center transform hover:scale-105 transition-transform'>
            <div className='bg-blue-50 p-4 rounded-full mb-6'>
              <Users className='h-10 w-10 text-primary' />
            </div>
            <h3 className='text-xl font-bold mb-2'>Diverse Expertise</h3>
            <p className='text-gray-600'>
              Graduates across multiple industries including Tech, Finance,
              Medicine, and Law.
            </p>
          </div>
          <div className='bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center transform hover:scale-105 transition-transform'>
            <div className='bg-yellow-50 p-4 rounded-full mb-6'>
              <Globe className='h-10 w-10 text-secondary' />
            </div>
            <h3 className='text-xl font-bold mb-2'>Global Presence</h3>
            <p className='text-gray-600'>
              Members spanning across different countries and continents making
              global impact.
            </p>
          </div>
          <div className='bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center transform hover:scale-105 transition-transform'>
            <div className='bg-green-50 p-4 rounded-full mb-6'>
              <Rocket className='h-10 w-10 text-green-600' />
            </div>
            <h3 className='text-xl font-bold mb-2'>Future Leaders</h3>
            <p className='text-gray-600'>
              Entrepreneurs, professionals, and leaders driving innovation and
              excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Sponsors & Collaborations Section */}
      <section className='py-20 bg-white border-t border-gray-100'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='text-center mb-12'>
            <div className='inline-flex items-center space-x-2 bg-primary/5 px-4 py-2 rounded-full mb-4'>
              <Handshake className='h-5 w-5 text-primary' />
              <span className='text-primary font-bold text-sm uppercase tracking-wider'>
                Partnerships
              </span>
            </div>
            <h2 className='text-3xl md:text-4xl font-bold text-primary'>
              Sponsors & Collaborations
            </h2>
            <p className='text-gray-500 mt-4 max-w-2xl mx-auto'>
              We are proud to collaborate with organizations and brands that
              support our vision for the Class of 2016.
            </p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 items-center'>
            {/* Sponsor Placeholders */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className='group relative grayscale hover:grayscale-0 transition-all duration-500'>
                <div className='bg-gray-50 rounded-2xl p-8 border border-gray-100 flex items-center justify-center h-32 group-hover:bg-white group-hover:shadow-xl group-hover:border-secondary/20'>
                  <div className='flex flex-col items-center'>
                    <ShieldCheck className='h-8 w-8 text-gray-300 group-hover:text-secondary mb-2' />
                    <span className='text-gray-400 font-bold text-xs uppercase tracking-tighter group-hover:text-primary'>
                      Sponsor {i}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-16 bg-primary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent'></div>
            <h3 className='text-2xl font-bold mb-4 relative z-10'>
              Want to collaborate with us?
            </h3>
            <p className='text-gray-300 mb-8 relative z-10 max-w-xl mx-auto'>
              Join our growing list of partners and reach a network of
              high-achieving alumni across the globe.
            </p>
            <Link
              to='/contact'
              className='bg-white text-primary hover:bg-secondary font-bold px-8 py-3 rounded-full transition-all relative z-10 inline-block'>
              Become a Partner
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='py-20 bg-primary text-white'>
        <div className='max-w-4xl mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            Be Part of the Network
          </h2>
          <p className='text-xl text-gray-300 mb-10'>
            Connect, collaborate, and grow with fellow Old Toms. Your presence
            strengthens our community.
          </p>
          <Link
            to='/join'
            className='bg-secondary text-primary hover:bg-yellow-400 px-10 py-4 rounded-full font-bold text-xl transition-all shadow-xl inline-block'>
            Submit Your Profile
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
