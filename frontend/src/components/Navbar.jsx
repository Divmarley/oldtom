/** @format */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Menu,
  X,
  User,
  ChevronDown,
} from 'lucide-react';
import { authService } from '../services/api';

const profileFieldLabels = {
  name: 'full name',
  email: 'email address',
  profession: 'profession',
  location: 'location',
  bio: 'short bio',
};

const getIncompleteProfile = (profile) => {
  const missingFields = profile.missing_profile_fields ??
    Object.keys(profileFieldLabels).filter(
      (field) => !String(profile[field] ?? '').trim(),
    );

  const isComplete = profile.profile_complete ?? missingFields.length === 0;
  if (isComplete) return null;

  return {
    percentage: profile.profile_completion_percentage ?? 0,
    missingFields,
  };
};

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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [incompleteProfile, setIncompleteProfile] = useState(null);
  const [authRejected, setAuthRejected] = useState(false);
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem('access_token')) && !authRejected;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    let cancelled = false;

    if (!token) {
      return undefined;
    }

    const fetchProfileStatus = async () => {
      try {
        const response = await authService.getProfile();
        if (!cancelled) {
          setAuthRejected(false);
          setIncompleteProfile(getIncompleteProfile(response.data));
        }
      } catch (error) {
        if (!cancelled) {
          if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');
            setAuthRejected(true);
          }
          setIncompleteProfile(null);
        }
      }
    };

    void fetchProfileStatus();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleProfileUpdated = (event) => {
      if (event.detail) {
        setIncompleteProfile(getIncompleteProfile(event.detail));
      }
    };

    window.addEventListener('alumni-profile-updated', handleProfileUpdated);
    return () => {
      window.removeEventListener('alumni-profile-updated', handleProfileUpdated);
    };
  }, []);

  const mainLinks = [
    { name: 'Home', path: '/' },
    { name: 'Induction', path: '/induction' },
    { name: 'Store', path: '/store' },
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

  return (
    <nav className='bg-primary text-white sticky top-0 z-50 shadow-md'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <Link to='/' className='flex items-center space-x-2'>
              <img
                src='/logo.jpg'
                alt='Old Toms 2016'
                className='w-9 h-9 object-cover rounded-sm '
              />
              <span className='font-bold text-xl tracking-tight'>
                OLD TOMS 2016
              </span>
            </Link>
          </div>

          <div className='hidden xl:flex items-center space-x-4'>
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

          <div className='xl:hidden flex items-center'>
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
        <div className='xl:hidden bg-primary border-t border-blue-900 overflow-y-auto max-h-[calc(100vh-64px)]'>
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

      {isLoggedIn && incompleteProfile && (
        <Link
          to='/profile?edit=1#profile-details'
          onClick={() => setIsOpen(false)}
          className='group block bg-secondary text-primary border-t border-yellow-300/70'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
            <div className='flex items-start sm:items-center gap-3'>
              <AlertCircle className='h-5 w-5 shrink-0 mt-0.5 sm:mt-0' />
              <div>
                <span className='font-black text-sm uppercase tracking-wide'>
                  Complete your alumni profile
                </span>
                <span className='block sm:inline sm:ml-2 text-xs font-semibold text-primary/75'>
                  {incompleteProfile.percentage}% complete · Add{' '}
                  {incompleteProfile.missingFields
                    .map((field) => profileFieldLabels[field] ?? field)
                    .join(', ')}
                </span>
              </div>
            </div>
            <span className='inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all'>
              Complete now <ArrowRight className='h-4 w-4' />
            </span>
          </div>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
