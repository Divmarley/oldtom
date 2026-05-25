/** @format */

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const FacebookIcon = () => (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1'
      strokeLinecap='round'
      strokeLinejoin='round'
      >
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
      strokeWidth='1'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
      <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
      <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
    </svg>
  );

  const LinkedinIcon = () => (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
      <rect x='2' y='9' width='4' height='12' />
      <circle cx='4' cy='4' r='2' />
    </svg>
  );
  
  const XIcon = () => (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
    </svg>
  );

  return (
    <footer className='bg-primary text-white pt-12 pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
          <div className='col-span-1 md:col-span-2'>
            <h3 className='text-xl font-bold mb-4 text-secondary uppercase tracking-tight'>
              OLD TOMS – Class of 2016
            </h3>
            <p className='text-gray-300 mb-6 max-w-md leading-relaxed'>
              A network of driven individuals shaping the future across
              industries and continents. Built on discipline, excellence, and
              unity.
            </p>
            <div className='flex items-center gap-5'>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-white/5 p-3 rounded-xl hover:bg-secondary hover:text-primary transition-all'>
                <FacebookIcon />
              </a>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-white/5 p-3 rounded-xl hover:bg-secondary hover:text-primary transition-all'>
                <XIcon />
              </a>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-white/5 p-3 rounded-xl hover:bg-secondary hover:text-primary transition-all'>
                <InstagramIcon />
              </a>
              <a
                href='https://linkedin.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-white/5 p-3 rounded-xl hover:bg-secondary hover:text-primary transition-all'>
                <LinkedinIcon />
              </a>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4 border-b border-blue-900 pb-2'>
              Quick Links
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  to='/about'
                  className='text-gray-300 hover:text-secondary transition-colors'>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to='/alumni'
                  className='text-gray-300 hover:text-secondary transition-colors'>
                  Alumni Directory
                </Link>
              </li>
              <li>
                <Link
                  to='/events'
                  className='text-gray-300 hover:text-secondary transition-colors'>
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  to='/blog'
                  className='text-gray-300 hover:text-secondary transition-colors'>
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to='/contact'
                  className='text-gray-300 hover:text-secondary transition-colors'>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4 border-b border-blue-900 pb-2'>
              Contact Info
            </h3>
            <ul className='space-y-3 text-gray-300'>
              <li className='flex items-center space-x-3'>
                <Mail className='h-5 w-5 text-secondary' />
                <span>info@oldtoms.com</span>
              </li>
              <li className='flex items-center space-x-3'>
                <MapPin className='h-5 w-5 text-secondary' />
                <span>Accra, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-blue-900 pt-8 text-center text-gray-400 text-sm'>
          <p>
            © {new Date().getFullYear()} Old Toms – Class of 2016. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
