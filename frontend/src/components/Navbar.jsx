/** @format */

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, User, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, [location]);

  const mainLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Alumni', path: '/alumni' },
    { name: 'Blog', path: '/blog' },
    { name: 'Events', path: '/events' },
  ];

  const exploreLinks = [
    { name: 'Hall of Fame', path: '/hall-of-fame' },
    { name: 'Yearbook', path: '/yearbook' },
    { name: 'Projects', path: '/projects' },
    { name: 'Donations', path: '/donations' },
    { name: 'Contact', path: '/contact' },
  ];

  // Custom SVG icons for social brands
  const FacebookIcon = () => (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
    </svg>
  );
  const InstagramIcon = () => (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
      <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
      <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
    </svg>
  );
  const XIcon = () => (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
    </svg>
  );

  const OldTomsLogo = () => (
    <svg
      width='40'
      height='40'
      viewBox='0 0 200 240'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='text-secondary'>
      {/* Shield Outline */}
      <path
        d='M40 20H160V110C160 160 130 195 100 215C70 195 40 160 40 110V20Z'
        stroke='currentColor'
        strokeWidth='8'
        strokeLinejoin='round'
      />

      {/* Top Divider */}
      <line
        x1='40'
        y1='60'
        x2='160'
        y2='60'
        stroke='currentColor'
        strokeWidth='6'
      />

      {/* Book */}
      <path d='M60 35H90V55H60Z' stroke='currentColor' strokeWidth='5' />

      {/* Lamp */}
      <path
        d='M125 38C118 38 114 42 114 48H136C136 42 132 38 125 38Z'
        stroke='currentColor'
        strokeWidth='5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <line
        x1='125'
        y1='48'
        x2='125'
        y2='58'
        stroke='currentColor'
        strokeWidth='5'
      />

      {/* Center Circle */}
      <circle cx='100' cy='95' r='22' stroke='currentColor' strokeWidth='6' />

      {/* Rays */}
      <line
        x1='100'
        y1='55'
        x2='100'
        y2='70'
        stroke='currentColor'
        strokeWidth='4'
      />
      <line
        x1='70'
        y1='95'
        x2='85'
        y2='95'
        stroke='currentColor'
        strokeWidth='4'
      />
      <line
        x1='115'
        y1='95'
        x2='130'
        y2='95'
        stroke='currentColor'
        strokeWidth='4'
      />
      <line
        x1='80'
        y1='75'
        x2='90'
        y2='85'
        stroke='currentColor'
        strokeWidth='4'
      />
      <line
        x1='110'
        y1='85'
        x2='120'
        y2='75'
        stroke='currentColor'
        strokeWidth='4'
      />

      {/* Bottom Animal Placeholder */}
      <path
        d='M70 150C85 140 115 140 130 150'
        stroke='currentColor'
        strokeWidth='6'
        strokeLinecap='round'
      />

      {/* Ribbon */}
      <path
        d='M65 210H135'
        stroke='currentColor'
        strokeWidth='6'
        strokeLinecap='round'
      />
    </svg>
  );

  return (
    <nav className='bg-primary text-white sticky top-0 z-50 shadow-md'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <Link to='/' className='flex items-center space-x-2'>
              {/* <GraduationCap className='h-8 w-8 text-secondary' />
               */}
              {/* <OldTomsLogo /> */}
              <img src='/logo.jpg' className="w-9 h-9 object-cover rounded-sm "/>
              <span className='font-bold text-xl tracking-tight'>
                OLD TOMS 2016
              </span>
            </Link>
          </div>

          <div className='hidden lg:flex items-center space-x-4'>
            <div className='flex items-baseline space-x-2'>
              {mainLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className='hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors'>
                  {link.name}
                </Link>
              ))}

              {/* Dropdown for Explore */}
              <div className='relative group'>
                <button
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  className='flex items-center hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors'>
                  <span>Explore</span>
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    onMouseLeave={() => setIsDropdownOpen(false)}
                    className='absolute left-0 mt-0 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2'>
                    {exploreLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsDropdownOpen(false)}
                        className='block px-4 py-2 text-sm text-primary hover:bg-blue-50 hover:text-secondary font-bold'>
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center space-x-3 border-l border-white/10 pl-4'>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-white/70 hover:text-secondary transition-colors'>
                <FacebookIcon />
              </a>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-white/70 hover:text-secondary transition-colors'>
                <InstagramIcon />
              </a>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-white/70 hover:text-secondary transition-colors'>
                <XIcon />
              </a>
            </div>

            <div className='flex items-center space-x-3 ml-4'>
              {isLoggedIn ? (
                <Link
                  to='/profile'
                  className='flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-white/10'>
                  <User className='h-4 w-4' />
                  <span>Profile</span>
                </Link>
              ) : (
                <Link
                  to='/login'
                  className='hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors'>
                  Login
                </Link>
              )}
              {!isLoggedIn && (
              <Link
                to='/join'
                className='bg-secondary text-primary hover:bg-yellow-400 px-5 py-2 rounded-xl text-sm font-black transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-tight'>
                Join
              </Link>
              )}
            </div>
          </div>

          <div className='lg:hidden flex items-center'>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='inline-flex items-center justify-center p-2 rounded-md text-white hover:text-secondary focus:outline-none'>
              {isOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className='lg:hidden bg-primary border-t border-blue-900 overflow-y-auto max-h-[calc(100vh-64px)]'>
          <div className='px-4 pt-4 pb-6 space-y-2'>
            {[...mainLinks, ...exploreLinks].map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className='block hover:text-secondary px-3 py-3 rounded-xl text-base font-bold border-b border-white/5 last:border-0'
                onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>
            ))}

            <div className='flex items-center space-x-6 py-6 justify-center'>
              <a
                href='https://facebook.com'
                className='text-white/70 hover:text-secondary'>
                <FacebookIcon />
              </a>
              <a
                href='https://instagram.com'
                className='text-white/70 hover:text-secondary'>
                <InstagramIcon />
              </a>
              <a
                href='https://twitter.com'
                className='text-white/70 hover:text-secondary'>
                <XIcon />
              </a>
            </div>

            <div className='space-y-3 pt-4'>
              {isLoggedIn ? (
                <Link
                  to='/profile'
                  className='block bg-white/10 hover:bg-white/20 px-3 py-4 rounded-xl text-base font-bold text-center'
                  onClick={() => setIsOpen(false)}>
                  Profile
                </Link>
              ) : (
                <Link
                  to='/login'
                  className='block hover:text-secondary px-3 py-4 rounded-xl text-base font-bold text-center'
                  onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              )}
              <Link
                to='/join'
                className='block bg-secondary text-primary hover:bg-yellow-400 px-3 py-4 rounded-xl text-base font-black text-center uppercase tracking-tight'
                onClick={() => setIsOpen(false)}>
                Join Network
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
