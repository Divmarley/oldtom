/** @format */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { alumniService } from '../services/api';
import { 
  Mail, MapPin, Briefcase, User, ArrowLeft, 
  Globe, Palette, Award, ExternalLink, MessageSquare 
} from 'lucide-react';

const AlumniDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await alumniService.getById(id);
        setMember(response.data);
      } catch (err) {
        console.error('Error fetching alumni details:', err);
        setError('Alumni member not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
    window.scrollTo(0, 0);
  }, [id]);

  // Custom SVG icons for social brands
  const FacebookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  );
  const InstagramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  );
  const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
  const LinkedinIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
  );

  if (loading) return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary'></div>
    </div>
  );

  if (error || !member) return (
    <div className='text-center py-40'>
      <h2 className='text-2xl font-black text-primary mb-4'>{error || 'Member not found'}</h2>
      <Link to='/alumni' className='text-secondary font-bold hover:underline'>Back to Directory</Link>
    </div>
  );

  return (
    <div className='bg-white min-h-screen'>
      {/* Header / Hero Section */}
      <div className='bg-primary text-white py-20 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-1/3 h-full bg-secondary opacity-10 skew-x-12 translate-x-20'></div>
        <div className='max-w-6xl mx-auto px-4 relative z-10'>
          <Link to='/alumni' className='inline-flex items-center text-white/70 hover:text-secondary mb-8 transition-colors font-bold uppercase tracking-widest text-xs'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Directory
          </Link>
          
          <div className='flex flex-col md:flex-row items-center gap-10'>
            <div className='w-48 h-48 rounded-3xl border-4 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shadow-2xl'>
              {member.photo ? (
                <img src={member.photo} alt={member.name} className='w-full h-full object-cover' />
              ) : (
                <User className='h-24 w-24 text-white/20' />
              )}
            </div>
            
            <div className='text-center md:text-left'>
              <div className='flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4'>
                <h1 className='text-4xl md:text-6xl font-black uppercase tracking-tighter'>{member.name}</h1>
                <span className='bg-secondary text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg'>
                  Class of 2016
                </span>
              </div>
              <p className='text-blue-100 text-xl md:text-2xl font-medium opacity-80 mb-6'>
                {member.profession} {member.company && `at ${member.company}`}
              </p>
              
              <div className='flex flex-wrap justify-center md:justify-start gap-4'>
                {member.facebook && (
                  <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-3 rounded-2xl hover:bg-secondary hover:text-primary transition-all">
                    <FacebookIcon />
                  </a>
                )}
                {member.instagram && (
                  <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-3 rounded-2xl hover:bg-secondary hover:text-primary transition-all">
                    <InstagramIcon />
                  </a>
                )}
                {member.twitter && (
                  <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-3 rounded-2xl hover:bg-secondary hover:text-primary transition-all">
                    <XIcon />
                  </a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-3 rounded-2xl hover:bg-secondary hover:text-primary transition-all">
                    <LinkedinIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-6xl mx-auto px-4 py-20'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-16'>
          
          {/* Left Column: Details */}
          <div className='lg:col-span-8 space-y-16'>
            
            {/* Bio Section */}
            <section>
              <h2 className='text-3xl font-black text-primary uppercase tracking-tighter mb-8 pb-4 border-b-4 border-secondary inline-block'>
                Professional Journey
              </h2>
              <p className='text-xl text-gray-600 leading-loose italic mb-10'>
                "{member.bio}"
              </p>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='bg-gray-50 p-8 rounded-[2rem] border border-gray-100'>
                  <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4 block'>Current Location</label>
                  <div className='flex items-center gap-3 text-lg font-bold text-primary'>
                    <MapPin className='h-6 w-6 text-secondary' />
                    {member.location || 'Accra, Ghana'}
                  </div>
                </div>
                <div className='bg-gray-50 p-8 rounded-[2rem] border border-gray-100'>
                  <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4 block'>Expertise</label>
                  <div className='flex items-center gap-3 text-lg font-bold text-primary'>
                    <Award className='h-6 w-6 text-secondary' />
                    {member.category}
                  </div>
                </div>
              </div>
            </section>

            {/* Skills Section */}
            <section>
              <h3 className='text-2xl font-black text-primary uppercase tracking-tighter mb-8'>Skills & Specialties</h3>
              <div className='flex flex-wrap gap-3'>
                {member.skills?.split(',').map((skill, idx) => (
                  <span key={idx} className='bg-primary/5 text-primary px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-primary/10'>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>

            {/* Portfolio Section */}
            {(member.portfolio_url || member.art_work_description) && (
              <section className='bg-secondary/5 p-10 md:p-14 rounded-[3rem] border border-secondary/10'>
                <div className='flex items-center gap-4 mb-10'>
                  <div className='h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center shadow-lg'>
                    <Palette className='h-6 w-6 text-primary' />
                  </div>
                  <h3 className='text-2xl font-black text-primary uppercase tracking-tighter'>Creative Portfolio</h3>
                </div>
                
                {member.art_work_description && (
                  <p className='text-lg text-gray-700 leading-relaxed font-medium mb-10'>
                    {member.art_work_description}
                  </p>
                )}
                
                {member.portfolio_url && (
                  <a 
                    href={member.portfolio_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className='inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-all shadow-xl'
                  >
                    View Full Portfolio <ExternalLink className='h-4 w-4' />
                  </a>
                )}
              </section>
            )}
          </div>

          {/* Right Column: Sidebar Actions */}
          <aside className='lg:col-span-4 space-y-8'>
            <div className='bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 text-center'>
              <h3 className='text-xl font-black text-primary uppercase tracking-tighter mb-6'>Get in Touch</h3>
              <p className='text-gray-500 font-medium mb-8 leading-relaxed'>
                Interested in collaborating or reconnecting with {member.name.split(' ')[0]}?
              </p>
              <a 
                href={`mailto:${member.email}`}
                className='block w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3'
              >
                <Mail className='h-5 w-5' /> Send Message
              </a>
              <button className='mt-4 block w-full bg-gray-50 text-gray-400 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-3'>
                <MessageSquare className='h-5 w-5' /> Request Intro
              </button>
            </div>

            <div className='bg-secondary p-10 rounded-[2.5rem] shadow-xl text-primary relative overflow-hidden group'>
              <div className='absolute -bottom-10 -right-10 w-40 h-40 bg-primary opacity-5 rounded-full group-hover:scale-150 transition-transform duration-1000'></div>
              <h3 className='text-2xl font-black uppercase tracking-tighter mb-4'>Old Tom Spirit</h3>
              <p className='font-bold opacity-80 leading-relaxed mb-8'>
                Empowering the next generation of St. Thomas Aquinas alumni through unity and excellence.
              </p>
              <Link to="/join" className='inline-block text-xs font-black uppercase tracking-[0.3em] border-b-2 border-primary pb-1 hover:text-white transition-colors'>
                Join Circle
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default AlumniDetail;
