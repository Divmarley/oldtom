/** @format */

import React, { useState, useEffect } from 'react';
import { alumniService } from '../services/api';
import { Award, Star, Users, ExternalLink, ShieldCheck } from 'lucide-react';

const HallOfFame = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await alumniService.getAll();
        setAlumni(response.data);
      } catch (error) {
        console.error('Error fetching alumni for Hall of Fame:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  return (
    <div className='bg-[#0a0a0a] min-h-screen pb-20 text-white'>
      {/* Premium Hero Section */}
      <div className='relative py-20 px-4 overflow-hidden border-b border-white/5'>
        <div className='absolute inset-0 bg-primary/5 pointer-events-none'></div>

        <div className='max-w-7xl mx-auto text-center relative z-10'>
          <div className='inline-flex items-center space-x-2 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6'>
            <Star className='h-4 w-4 text-secondary fill-current' />
            <span className='text-secondary text-sm font-bold uppercase tracking-widest'>
              Premium Recognition
            </span>
          </div>
          <h1 className='text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-secondary to-white bg-clip-text text-transparent uppercase tracking-tighter'>
            Hall of Fame
          </h1>
          <p className='text-lg text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed'>
            Celebrating the legacy of the{' '}
            <span className='text-secondary'>Class of 2016</span> excellence and
            leadership.
          </p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4'>
        {loading ? (
          <div className='flex justify-center py-40'>
            <div className='relative w-20 h-20'>
              <div className='absolute inset-0 border-4 border-secondary/20 rounded-full'></div>
              <div className='absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin'></div>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {alumni.map((member) => (
              <div
                key={member.id}
                className='group relative bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-secondary/30 transition-all duration-500 shadow-2xl'>
                {/* Image Container */}
                <div className='aspect-[4/5] relative overflow-hidden'>
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-[#1a1a1a]'>
                      <Users className='h-20 w-20 text-white/10' />
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60'></div>

                  {/* Badge */}
                  <div className='absolute top-4 right-4 bg-secondary text-primary p-2 rounded-lg shadow-xl transform -rotate-3 group-hover:rotate-0 transition-transform'>
                    <Award className='h-5 w-5 fill-current' />
                  </div>
                </div>

                {/* Content */}
                <div className='p-6 relative -mt-12'>
                  <div className='bg-[#111] p-1 rounded-xl mb-3 inline-block'>
                    <div className='bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-lg'>
                      <span className='text-secondary text-[10px] font-black uppercase tracking-tighter'>
                        {member.category}
                      </span>
                    </div>
                  </div>
                  <h3 className='text-2xl font-bold mb-1 group-hover:text-secondary transition-colors line-clamp-1'>
                    {member.name}
                  </h3>
                  <p className='text-gray-400 text-sm font-medium mb-4 flex items-center'>
                    <ShieldCheck className='h-4 w-4 mr-2 text-secondary/60' />
                    {member.profession}
                  </p>

                  <div className='pt-4 border-t border-white/5 flex items-center justify-between'>
                    <span className='text-[10px] text-gray-500 font-bold tracking-widest uppercase'>
                      Class of 2016
                    </span>
                    <button className='text-white/40 hover:text-secondary transition-colors'>
                      <ExternalLink className='h-4 w-4' />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {!loading && alumni.length === 0 && (
          <div className='text-center py-40 border-2 border-dashed border-white/5 rounded-3xl'>
            <Users className='h-16 w-16 mx-auto mb-4 text-gray-700' />
            <h2 className='text-2xl font-bold text-gray-500'>
              The Gallery is Empty
            </h2>
            <p className='text-gray-600 mt-2'>
              Nominate your year group mates to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HallOfFame;
