/** @format */

import React, { useState, useEffect } from 'react';
import { alumniService } from '../services/api';
import {
  Search,
  Filter,
  Mail,
  MapPin,
  Briefcase,
  Users,
  Globe,
  Palette,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Directory = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  // Custom SVG icons for social brands
  const FacebookIcon = () => (
    <svg
      width='18'
      height='18'
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
      width='18'
      height='18'
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
    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
    </svg>
  );
  const LinkedinIcon = () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
      <rect x='2' y='9' width='4' height='12' />
      <circle cx='4' cy='4' r='2' />
    </svg>
  );

  useEffect(() => {
    fetchAlumni();
  }, [searchTerm]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const response = await alumniService.getAll(searchTerm);
      setAlumni(response.data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'All',
    'Tech',
    'Business',
    'Health',
    'Engineering',
    'Arts',
    'Education',
    'Other',
  ];

  const filteredAlumni =
    category === 'All' ? alumni : alumni.filter((a) => a.category === category);

  return (
    <div className='bg-gray-50 min-h-screen pb-20'>
      <div className='bg-primary text-white py-16 px-4 mb-12'>
        <div className='max-w-7xl mx-auto text-center'>
          <h1 className='text-4xl font-bold mb-4'>
            Class of 2016 Alumni Network
          </h1>
          <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
            Explore members of our community and the impact they are making
            across various industries.
          </p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4'>
        {/* Filters and Search */}
        <div className='flex flex-col md:flex-row gap-4 mb-12 bg-white p-6 rounded-xl shadow-sm'>
          <div className='relative flex-grow'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
            <input
              type='text'
              placeholder='Search by name, profession, or skills...'
              className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex items-center space-x-2 min-w-[200px]'>
            <Filter className='text-gray-400 h-5 w-5' />
            <select
              className='w-full border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary outline-none'
              value={category}
              onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
          </div>
        ) : filteredAlumni.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {filteredAlumni.map((member) => (
              <div
                key={member.id}
                className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col'>
                <div className='h-48 bg-gray-200 relative'>
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-blue-100'>
                      <Users className='h-16 w-16 text-primary opacity-20' />
                    </div>
                  )}
                  <div className='absolute top-4 right-4 bg-secondary text-primary px-3 py-1 rounded-full text-xs font-bold uppercase'>
                    {member.category}
                  </div>
                </div>
                <div className='p-6 flex-grow flex flex-col'>
                  <h3 className='text-xl font-bold text-primary mb-1'>
                    {member.name}
                  </h3>
                  <div className='flex items-center text-gray-600 mb-4 text-sm'>
                    <Briefcase className='h-4 w-4 mr-2' />
                    <span>
                      {member.profession}{' '}
                      {member.company ? `at ${member.company}` : ''}
                    </span>
                  </div>
                  <div className='flex items-center text-gray-500 mb-4 text-sm'>
                    <MapPin className='h-4 w-4 mr-2' />
                    <span>{member.location}</span>
                  </div>
                  <p className='text-gray-600 text-sm mb-6 line-clamp-3 italic'>
                    "{member.bio}"
                  </p>

                  {member.portfolio_url && (
                    <div className='mb-4 flex items-center gap-2 text-xs font-black text-secondary uppercase tracking-widest bg-secondary/5 p-3 rounded-xl border border-secondary/10'>
                      <Palette className='h-4 w-4' />
                      <a
                        href={member.portfolio_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:underline'>
                        View Portfolio
                      </a>
                    </div>
                  )}

                  <div className='mb-6'>
                    <div className='flex flex-wrap gap-2'>
                      {member.skills.split(',').map((skill, index) => (
                        <span
                          key={index}
                          className='bg-blue-50 text-primary text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider'>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className='flex items-center justify-between pt-4 border-t border-gray-100 mt-auto'>
                    <div className='flex items-center space-x-3'>
                      <a
                        href={`mailto:${member.email}`}
                        className='text-gray-400 hover:text-red-500 transition-colors'>
                        <Mail className='h-4 w-4' />
                      </a>
                      {member.facebook && (
                        <a
                          href={member.facebook}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-blue-600 transition-colors'>
                          <FacebookIcon />
                        </a>
                      )}
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-pink-600 transition-colors'>
                          <InstagramIcon />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-black transition-colors'>
                          <XIcon />
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-blue-700 transition-colors'>
                          <LinkedinIcon />
                        </a>
                      )}
                    </div>
                    <Link
                      to={`/alumni/${member.id}`}
                      className='text-primary font-bold text-xs hover:text-secondary transition-colors uppercase tracking-widest'>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-20 bg-white rounded-xl shadow-sm'>
            <p className='text-xl text-gray-500'>
              No alumni found matching your search.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className='mt-20 bg-primary rounded-2xl p-8 md:p-12 text-center text-white'>
          <h2 className='text-2xl md:text-3xl font-bold mb-4'>
            Want to be listed here?
          </h2>
          <p className='text-gray-300 mb-8 max-w-xl mx-auto'>
            Become part of our growing alumni directory and showcase your
            professional journey.
          </p>
          <Link
            to='/join'
            className='bg-secondary text-primary px-8 py-3 rounded-full font-bold transition-all hover:bg-yellow-400'>
            Submit Your Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Directory;
