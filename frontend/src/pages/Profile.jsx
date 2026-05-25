/** @format */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, blogService, eventService } from '../services/api';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Camera,
  Edit3,
  Save,
  LogOut,
  CheckCircle,
  Clock,
  Globe,
  Palette,
  Calendar,
  ChevronRight,
  X,
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activities, setActivities] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchActivities();
    window.scrollTo(0, 0);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      setProfile(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const [blogRes, eventRes] = await Promise.all([
        blogService.getAll(),
        eventService.getAll(),
      ]);

      const blogPosts = blogRes.data
        .slice(0, 3)
        .map((p) => ({ ...p, type: 'blog' }));
      const events = eventRes.data
        .slice(0, 3)
        .map((e) => ({ ...e, type: 'event' }));

      const combined = [...blogPosts, ...events].sort(
        (a, b) =>
          new Date(b.created_at || b.date) - new Date(a.created_at || a.date),
      );
      setActivities(combined.slice(0, 5));
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const FacebookIcon = ({ className }) => (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}>
      <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
    </svg>
  );
  const InstagramIcon = ({ className }) => (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}>
      <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
      <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
      <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
    </svg>
  );
  const LinkedinIcon = ({ className }) => (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}>
      <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
      <rect x='2' y='9' width='4' height='12' />
      <circle cx='4' cy='4' r='2' />
    </svg>
  );
  const XIcon = ({ className }) => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='currentColor'
      className={className}>
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
    </svg>
  );

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      if (photoFile) {
        data.append('photo', photoFile);
      }

      data.append('has_edit_request', 'true');
      data.append(
        'edit_request_notes',
        `Profile update requested on ${new Date().toLocaleDateString()}`,
      );

      const response = await authService.updateProfile(data);
      setProfile(response.data);
      setEditing(false);
      setPhotoFile(null);
      setMessage({
        type: 'success',
        text: 'Edit request submitted! Admin will review.',
      });
      window.scrollTo(0, 0);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setProfile({ ...profile, photo: URL.createObjectURL(file) });
    }
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Remove profile picture?')) {
      try {
        const data = new FormData();
        data.append('photo', ''); // Send empty to clear
        const response = await authService.updateProfile(data);
        setProfile(response.data);
        setMessage({ type: 'success', text: 'Photo removed successfully.' });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to remove photo.' });
      }
    }
  };

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin h-12 w-12 border-t-4 border-b-4 border-primary rounded-full'></div>
      </div>
    );

  return (
    <div className='bg-gray-50 min-h-screen pb-20'>
      {/* Dynamic Header */}
      <div className='bg-primary text-white py-24 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-1/3 h-full bg-secondary opacity-10 skew-x-12 translate-x-20'></div>
        <div className='max-w-6xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-10'>
          <div className='relative group'>
            <div className='w-40 h-40 rounded-full border-4 border-white/20 overflow-hidden bg-secondary flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105 duration-500'>
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <User className='h-20 w-20 text-primary' />
              )}
            </div>
            <label className='absolute bottom-2 right-2 bg-white text-primary p-3 rounded-full shadow-xl hover:scale-110 transition-all border-4 border-primary cursor-pointer'>
              <Camera className='h-6 w-6' />
              <input
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handlePhotoChange}
              />
            </label>
            {profile.photo && (
              <button
                onClick={handleRemovePhoto}
                className='absolute -top-2 -left-2 bg-red-500 text-white p-2 rounded-full shadow-xl hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100'>
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          <div className='flex-1 text-center md:text-left'>
            <div className='flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4'>
              <h1 className='text-4xl md:text-5xl font-black uppercase tracking-tighter'>
                {profile.name}
              </h1>
              <span className='bg-secondary text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg'>
                Class of 2016
              </span>
            </div>
            <p className='text-blue-100 text-xl font-medium mb-8 opacity-80 max-w-2xl'>
              {profile.profession || 'Alumni Member'}
            </p>

            <div className='flex flex-wrap justify-center md:justify-start gap-4'>
              {['facebook', 'instagram', 'twitter', 'linkedin'].map(
                (social) => {
                  if (!profile[social]) return null;
                  return (
                    <a
                      key={social}
                      href={profile[social]}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-white/10 p-3 rounded-2xl hover:bg-secondary hover:text-primary transition-all shadow-sm group'>
                      {social === 'facebook' && (
                        <FacebookIcon className='h-5 w-5' />
                      )}
                      {social === 'instagram' && (
                        <InstagramIcon className='h-5 w-5' />
                      )}
                      {social === 'twitter' && <XIcon className='h-5 w-5' />}
                      {social === 'linkedin' && (
                        <LinkedinIcon className='h-5 w-5' />
                      )}
                    </a>
                  );
                },
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className='bg-white/10 hover:bg-red-500/20 hover:text-red-200 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all border border-white/10'>
            <LogOut className='h-5 w-5' /> Logout
          </button>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 -mt-16 relative z-20'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Main Info Column */}
          <div className='lg:col-span-8 space-y-8'>
            <div className='bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-14 border border-gray-100'>
              <div className='flex items-center justify-between mb-12 pb-8 border-b border-gray-50'>
                <h2 className='text-3xl font-black text-primary uppercase tracking-tighter'>
                  Identity & Professional
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className='flex items-center gap-2 bg-primary/5 text-primary px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary transition-colors'>
                    <Edit3 className='h-4 w-4' /> Request Update
                  </button>
                )}
              </div>

              {message.text && (
                <div
                  className={`p-6 rounded-3xl mb-12 flex items-center gap-4 font-black uppercase tracking-widest text-xs ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {message.type === 'success' ? (
                    <CheckCircle className='h-6 w-6' />
                  ) : (
                    <Clock className='h-6 w-6' />
                  )}
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-12'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10'>
                  <div className='space-y-3'>
                    <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]'>
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type='text'
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className='w-full bg-gray-50 px-8 py-5 rounded-3xl font-bold focus:ring-4 focus:ring-primary/10 outline-none border-2 border-transparent focus:border-primary transition-all'
                      />
                    ) : (
                      <div className='text-xl font-black text-primary uppercase tracking-tight'>
                        {profile.name}
                      </div>
                    )}
                  </div>
                  <div className='space-y-3'>
                    <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]'>
                      Email Address
                    </label>
                    {editing ? (
                      <input
                        type='email'
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className='w-full bg-gray-50 px-8 py-5 rounded-3xl font-bold focus:ring-4 focus:ring-primary/10 outline-none border-2 border-transparent focus:border-primary transition-all'
                      />
                    ) : (
                      <div className='flex items-center gap-3 text-lg font-bold text-primary'>
                        <Mail className='h-5 w-5 text-secondary' />{' '}
                        {profile.email}
                      </div>
                    )}
                  </div>
                  <div className='space-y-3'>
                    <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]'>
                      Profession
                    </label>
                    {editing ? (
                      <input
                        type='text'
                        value={formData.profession}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profession: e.target.value,
                          })
                        }
                        className='w-full bg-gray-50 px-8 py-5 rounded-3xl font-bold focus:ring-4 focus:ring-primary/10 outline-none border-2 border-transparent focus:border-primary transition-all'
                      />
                    ) : (
                      <div className='flex items-center gap-3 text-lg font-bold text-primary'>
                        <Briefcase className='h-5 w-5 text-secondary' />{' '}
                        {profile.profession || 'Member'}
                      </div>
                    )}
                  </div>
                  <div className='space-y-3'>
                    <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]'>
                      Location
                    </label>
                    {editing ? (
                      <input
                        type='text'
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className='w-full bg-gray-50 px-8 py-5 rounded-3xl font-bold focus:ring-4 focus:ring-primary/10 outline-none border-2 border-transparent focus:border-primary transition-all'
                      />
                    ) : (
                      <div className='flex items-center gap-3 text-lg font-bold text-primary'>
                        <MapPin className='h-5 w-5 text-secondary' />{' '}
                        {profile.location || 'Accra, Ghana'}
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-3'>
                  <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]'>
                    Bio / About
                  </label>
                  {editing ? (
                    <textarea
                      rows='4'
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className='w-full bg-gray-50 px-8 py-5 rounded-3xl font-bold focus:ring-4 focus:ring-primary/10 outline-none border-2 border-transparent focus:border-primary transition-all resize-none'
                    />
                  ) : (
                    <p className='text-lg text-gray-600 leading-relaxed font-medium'>
                      {profile.bio || 'Sharing the Old Tom spirit.'}
                    </p>
                  )}
                </div>

                {/* Art & Portfolio Section */}
                <div className='pt-12 border-t border-gray-100'>
                  <div className='flex items-center gap-4 mb-8'>
                    <div className='h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center shadow-lg'>
                      <Palette className='h-6 w-6 text-primary' />
                    </div>
                    <h3 className='text-2xl font-black text-primary uppercase tracking-tighter'>
                      Art & Creative Portfolio
                    </h3>
                  </div>

                  <div className='space-y-10'>
                    <div className='space-y-3'>
                      <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]'>
                        Portfolio/Website URL
                      </label>
                      {editing ? (
                        <input
                          type='url'
                          value={formData.portfolio_url}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              portfolio_url: e.target.value,
                            })
                          }
                          className='w-full bg-gray-50 px-8 py-5 rounded-3xl font-bold focus:ring-4 focus:ring-primary/10 outline-none border-2 border-transparent focus:border-primary transition-all'
                          placeholder='https://...'
                        />
                      ) : (
                        <p className='text-lg font-bold'>
                          {profile.portfolio_url ? (
                            <a
                              href={profile.portfolio_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-secondary hover:underline flex items-center gap-2'>
                              {profile.portfolio_url}{' '}
                              <ChevronRight className='h-4 w-4' />
                            </a>
                          ) : (
                            'No portfolio linked'
                          )}
                        </p>
                      )}
                    </div>
                    <div className='space-y-3'>
                      <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]'>
                        Work Description
                      </label>
                      {editing ? (
                        <textarea
                          rows='4'
                          value={formData.art_work_description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              art_work_description: e.target.value,
                            })
                          }
                          className='w-full bg-gray-50 px-8 py-5 rounded-3xl font-bold focus:ring-4 focus:ring-primary/10 outline-none border-2 border-transparent focus:border-primary transition-all resize-none'
                          placeholder='Tell us about your creative projects...'
                        />
                      ) : (
                        <p className='text-lg text-gray-600 leading-relaxed font-medium'>
                          {profile.art_work_description ||
                            'Share your creative journey with the community.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Networks Grid */}
                <div className='pt-12 border-t border-gray-100'>
                  <h3 className='text-xl font-black text-primary uppercase tracking-tighter mb-8'>
                    Social Networks
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    {['facebook', 'instagram', 'twitter', 'linkedin'].map(
                      (social) => (
                        <div key={social} className='space-y-3'>
                          <label className='text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]'>
                            {social}
                          </label>
                          {editing ? (
                            <input
                              type='url'
                              value={formData[social]}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [social]: e.target.value,
                                })
                              }
                              className='w-full bg-gray-50 px-6 py-4 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 outline-none border-2 border-transparent focus:border-primary transition-all'
                              placeholder={`Your ${social} URL`}
                            />
                          ) : (
                            <div className='text-sm font-black text-primary truncate bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100'>
                              {profile[social] || (
                                <span className='opacity-30'>Not linked</span>
                              )}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {editing && (
                  <div className='flex gap-6 pt-10'>
                    <button
                      type='submit'
                      disabled={submitting}
                      className='flex-1 bg-primary text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-900 transition-all shadow-2xl hover:shadow-primary/40 flex items-center justify-center gap-3'>
                      {submitting ? (
                        <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                      ) : (
                        <>
                          <Save className='h-5 w-5' /> Submit for Review
                        </>
                      )}
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setEditing(false);
                        setFormData(profile);
                      }}
                      className='px-12 bg-gray-100 text-gray-400 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-200 transition-all'>
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className='lg:col-span-4 space-y-8'>
            <div className='bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100'>
              <h3 className='text-2xl font-black text-primary uppercase tracking-tighter mb-10 pb-4 border-b-4 border-secondary inline-block'>
                Activities
              </h3>
              <div className='space-y-10'>
                {activities.length > 0 ? (
                  activities.map((act, idx) => (
                    <div key={idx} className='flex gap-5 group relative'>
                      <div
                        className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform ${act.type === 'blog' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {act.type === 'blog' ? (
                          <Edit3 className='h-5 w-5' />
                        ) : (
                          <Calendar className='h-5 w-5' />
                        )}
                      </div>
                      <div>
                        <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2'>
                          {act.type === 'blog'
                            ? 'Magazine Post'
                            : 'Upcoming Event'}
                        </p>
                        <h4 className='font-black text-primary group-hover:text-secondary transition-colors leading-snug line-clamp-2 uppercase tracking-tight'>
                          {act.title}
                        </h4>
                        <Link
                          to={
                            act.type === 'blog'
                              ? `/blog/${act.slug}`
                              : `/events`
                          }
                          className='inline-flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-[0.3em] mt-3 hover:gap-4 transition-all'>
                          Details <ChevronRight className='h-3 w-3' />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-12'>
                    <Clock className='h-12 w-12 text-gray-100 mx-auto mb-4' />
                    <p className='text-gray-400 font-black uppercase tracking-widest text-[10px]'>
                      Nothing to show
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className='bg-primary p-12 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group'>
              <div className='absolute -bottom-10 -right-10 w-40 h-40 bg-secondary opacity-10 rounded-full group-hover:scale-150 transition-transform duration-1000'></div>
              <h3 className='text-3xl font-black uppercase tracking-tighter mb-6 relative z-10'>
                Legacy Circle
              </h3>
              <p className='font-bold text-blue-100 leading-relaxed mb-10 relative z-10 opacity-80'>
                Continue building the legacy. Connect, mentor, and grow with the
                global Old Toms network.
              </p>
              <Link
                to='/alumni'
                className='block w-full bg-secondary text-primary text-center py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all relative z-10 shadow-xl'>
                Explore Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
