/** @format */

import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
  Palette,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const editableProfileFields = [
  'name',
  'email',
  'profession',
  'company',
  'location',
  'bio',
  'skills',
  'linkedin',
  'facebook',
  'instagram',
  'twitter',
  'portfolio_url',
  'art_work_description',
  'category',
];

const profileSteps = [
  {
    title: 'Identity & Professional',
    shortTitle: 'Identity',
    description: 'Your personal and professional details',
  },
  {
    title: 'Art & Portfolio',
    shortTitle: 'Portfolio',
    description: 'Your website and creative work',
  },
  {
    title: 'Social Networks',
    shortTitle: 'Social',
    description: 'Where classmates can connect with you',
  },
  {
    title: 'Review & Save',
    shortTitle: 'Review',
    description: 'Check everything before saving',
  },
];

const fieldStep = {
  name: 0,
  email: 0,
  profession: 0,
  company: 0,
  location: 0,
  bio: 0,
  skills: 0,
  category: 0,
  portfolio_url: 1,
  art_work_description: 1,
  facebook: 2,
  instagram: 2,
  twitter: 2,
  linkedin: 2,
};

const profileCategories = [
  'Tech',
  'Business',
  'Health',
  'Engineering',
  'Arts',
  'Education',
  'Other',
];

const profileLabelClass =
  'text-gray-400 font-black uppercase text-[9px] tracking-[0.2em]';
const profileInputClass =
  'w-full bg-gray-50 px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none border border-transparent focus:border-primary transition-all';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editRequested =
    new URLSearchParams(location.search).get('edit') === '1';
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activities, setActivities] = useState([]);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const isEditing = editing || editRequested;

  const fetchProfile = useCallback(async () => {
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
  }, [navigate]);

  const fetchActivities = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      await Promise.all([fetchProfile(), fetchActivities()]);
    };

    void loadProfile();
    window.scrollTo(0, 0);
  }, [fetchActivities, fetchProfile]);

  useEffect(() => {
    if (
      !profile?.id ||
      !editRequested
    ) {
      return undefined;
    }

    const scrollTimer = window.setTimeout(() => {
      setActiveStep(0);
      document.getElementById('profile-details')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

    return () => window.clearTimeout(scrollTimer);
  }, [editRequested, profile?.id]);

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

  const scrollToProfileForm = () => {
    window.setTimeout(() => {
      document.getElementById('profile-details')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      document.getElementById('profile-step-heading')?.focus({
        preventScroll: true,
      });
    }, 0);
  };

  const startEditing = () => {
    setActiveStep(0);
    setMessage({ type: '', text: '' });
    setEditing(true);
  };

  const handleNextStep = () => {
    const form = document.getElementById('profile-edit-form');
    if (form && !form.reportValidity()) return;

    setActiveStep((current) =>
      Math.min(current + 1, profileSteps.length - 1),
    );
    scrollToProfileForm();
  };

  const handlePreviousStep = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
    scrollToProfileForm();
  };

  const cancelEditing = () => {
    setEditing(false);
    setActiveStep(0);
    setFormData(profile);
    if (editRequested) {
      navigate('/profile', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing && activeStep < profileSteps.length - 1) {
      handleNextStep();
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const data = new FormData();
      editableProfileFields.forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      data.append('has_edit_request', 'true');
      data.append(
        'edit_request_notes',
        `Profile update requested on ${new Date().toLocaleDateString()}`,
      );

      const response = await authService.updateProfile(data);
      setProfile(response.data);
      setFormData(response.data);
      setEditing(false);
      setActiveStep(0);
      navigate('/profile', { replace: true });
      window.dispatchEvent(
        new CustomEvent('alumni-profile-updated', { detail: response.data }),
      );
      setMessage({ type: 'success', text: 'Profile details saved successfully.' });
      window.scrollTo(0, 0);
    } catch (error) {
      const responseData = error.response?.data;
      const firstErrorField = responseData && Object.keys(responseData)
        .find((field) => field in fieldStep);
      const firstError = responseData && Object.values(responseData)
        .flat()
        .find((value) => typeof value === 'string');
      setMessage({
        type: 'error',
        text: firstError || 'Failed to save profile details.',
      });
      if (firstErrorField) {
        setActiveStep(fieldStep[firstErrorField]);
        scrollToProfileForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Profile photos must be 5MB or smaller.' });
      return;
    }

    const previousProfile = profile;
    const previewUrl = URL.createObjectURL(file);
    setProfile((current) => ({ ...current, photo: previewUrl }));
    setPhotoSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('photo', file);
      const response = await authService.updateProfile(data);
      setProfile(response.data);
      setFormData((current) =>
        isEditing
          ? { ...current, photo: response.data.photo }
          : response.data,
      );
      window.dispatchEvent(
        new CustomEvent('alumni-profile-updated', { detail: response.data }),
      );
      setMessage({ type: 'success', text: 'Profile photo updated successfully.' });
    } catch (error) {
      setProfile(previousProfile);
      setMessage({
        type: 'error',
        text:
          error.response?.data?.photo?.[0] ||
          'Failed to update profile photo.',
      });
    } finally {
      URL.revokeObjectURL(previewUrl);
      setPhotoSubmitting(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Remove profile picture?')) {
      setPhotoSubmitting(true);
      setMessage({ type: '', text: '' });
      try {
        const response = await authService.updateProfile({ photo: null });
        setProfile(response.data);
        setFormData((current) =>
          isEditing
            ? { ...current, photo: response.data.photo }
            : response.data,
        );
        window.dispatchEvent(
          new CustomEvent('alumni-profile-updated', { detail: response.data }),
        );
        setMessage({ type: 'success', text: 'Photo removed successfully.' });
      } catch {
        setMessage({ type: 'error', text: 'Failed to remove photo.' });
      } finally {
        setPhotoSubmitting(false);
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
            <div className='relative w-40 h-40 rounded-full border-4 border-white/20 overflow-hidden bg-secondary flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105 duration-500'>
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <User className='h-20 w-20 text-primary' />
              )}
              {photoSubmitting && (
                <div className='absolute inset-0 bg-primary/70 flex items-center justify-center'>
                  <div className='h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin' />
                </div>
              )}
            </div>
            <label
              aria-label='Upload profile photo'
              className={`absolute bottom-2 right-2 bg-white text-primary p-3 rounded-full shadow-xl transition-all border-4 border-primary ${photoSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110'}`}>
              <Camera className='h-6 w-6' />
              <input
                type='file'
                accept='image/png,image/jpeg,image/gif,image/webp'
                className='hidden'
                disabled={photoSubmitting}
                onChange={handlePhotoChange}
              />
            </label>
            {profile.photo && (
              <button
                type='button'
                aria-label='Remove profile photo'
                disabled={photoSubmitting}
                onClick={handleRemovePhoto}
                className='absolute -top-2 -left-2 bg-red-500 text-white p-2 rounded-full shadow-xl hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50'>
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

      <div className='max-w-6xl mx-auto px-4 -mt-12 relative z-20'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Main Info Column */}
          <div className='lg:col-span-8 space-y-8'>
            <div
              id='profile-details'
              className='bg-white rounded-2xl shadow-xl p-5 sm:p-7 md:p-8 border border-gray-100 scroll-mt-32'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5 border-b border-gray-50'>
                <div>
                  {isEditing && (
                    <p className='text-secondary font-black uppercase tracking-[0.25em] text-[10px] mb-2'>
                      Step {activeStep + 1} of {profileSteps.length}
                    </p>
                  )}
                  <h2
                    id='profile-step-heading'
                    tabIndex={-1}
                    className='text-2xl font-black text-primary uppercase tracking-tighter outline-none'>
                    {isEditing
                      ? profileSteps[activeStep].title
                      : 'Profile Details'}
                  </h2>
                  {isEditing && (
                    <p className='text-sm text-gray-500 font-medium mt-2'>
                      {profileSteps[activeStep].description}
                    </p>
                  )}
                </div>
                {!isEditing && (
                  <button
                    type='button'
                    onClick={startEditing}
                    className='flex items-center gap-2 bg-primary/5 text-primary px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary transition-colors'>
                    <Edit3 className='h-4 w-4' /> Edit Profile
                  </button>
                )}
              </div>

              {isEditing && (
                <div className='mb-8'>
                  <div
                    role='progressbar'
                    aria-label='Profile form progress'
                    aria-valuemin='1'
                    aria-valuemax={profileSteps.length}
                    aria-valuenow={activeStep + 1}
                    className='h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4'>
                    <div
                      className='h-full bg-secondary rounded-full transition-all duration-300'
                      style={{
                        width: `${((activeStep + 1) / profileSteps.length) * 100}%`,
                      }}
                    />
                  </div>
                  <ol
                    aria-label='Profile form steps'
                    className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                    {profileSteps.map((step, index) => {
                      const isCurrent = index === activeStep;
                      const isComplete = index < activeStep;
                      return (
                        <li
                          key={step.title}
                          aria-current={isCurrent ? 'step' : undefined}
                          className={`rounded-xl border px-2.5 py-2 transition-colors ${
                            isCurrent
                              ? 'bg-primary text-white border-primary shadow-lg'
                              : isComplete
                                ? 'bg-yellow-50 text-primary border-secondary'
                                : 'bg-gray-50 text-gray-400 border-gray-100'
                          }`}>
                          <div className='flex items-center gap-2'>
                            <span
                              className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black ${
                                isCurrent
                                  ? 'bg-secondary text-primary'
                                  : isComplete
                                    ? 'bg-secondary text-primary'
                                    : 'bg-white text-gray-400'
                              }`}>
                              {isComplete ? '✓' : index + 1}
                            </span>
                            <span className='font-black uppercase tracking-wide text-[9px] sm:text-[10px]'>
                              {step.shortTitle}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {message.text && (
                <div
                  role={message.type === 'error' ? 'alert' : 'status'}
                  className={`p-4 rounded-xl mb-8 flex items-center gap-3 font-black uppercase tracking-widest text-[10px] ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {message.type === 'success' ? (
                    <CheckCircle className='h-6 w-6' />
                  ) : (
                    <Clock className='h-6 w-6' />
                  )}
                  {message.text}
                </div>
              )}

              <form
                id='profile-edit-form'
                onSubmit={handleSubmit}
                className='space-y-8'>
                {(!isEditing || activeStep === 0) && (
                  <section className='space-y-6'>
                    {!isEditing && (
                      <h3 className='text-2xl font-black text-primary uppercase tracking-tighter border-b-4 border-secondary inline-block pb-2'>
                        Identity & Professional
                      </h3>
                    )}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
                  <div className='space-y-3'>
                    <label
                      htmlFor='profile-name'
                      className={profileLabelClass}>
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        id='profile-name'
                        type='text'
                        required
                        value={formData.name ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={profileInputClass}
                      />
                    ) : (
                      <div className='text-xl font-black text-primary uppercase tracking-tight'>
                        {profile.name}
                      </div>
                    )}
                  </div>
                  <div className='space-y-3'>
                    <label
                      htmlFor='profile-email'
                      className={profileLabelClass}>
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        id='profile-email'
                        type='email'
                        required
                        value={formData.email ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={profileInputClass}
                      />
                    ) : (
                      <div className='flex items-center gap-3 text-lg font-bold text-primary'>
                        <Mail className='h-5 w-5 text-secondary' />{' '}
                        {profile.email}
                      </div>
                    )}
                  </div>
                  <div className='space-y-3'>
                    <label
                      htmlFor='profile-profession'
                      className={profileLabelClass}>
                      Profession
                    </label>
                    {isEditing ? (
                      <input
                        id='profile-profession'
                        type='text'
                        required
                        value={formData.profession ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profession: e.target.value,
                          })
                        }
                        className={profileInputClass}
                      />
                    ) : (
                      <div className='flex items-center gap-3 text-lg font-bold text-primary'>
                        <Briefcase className='h-5 w-5 text-secondary' />{' '}
                        {profile.profession || 'Member'}
                      </div>
                    )}
                  </div>
                  <div className='space-y-3'>
                    <label
                      htmlFor='profile-location'
                      className={profileLabelClass}>
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        id='profile-location'
                        type='text'
                        required
                        value={formData.location ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className={profileInputClass}
                      />
                    ) : (
                      <div className='flex items-center gap-3 text-lg font-bold text-primary'>
                        <MapPin className='h-5 w-5 text-secondary' />{' '}
                        {profile.location || 'Accra, Ghana'}
                      </div>
                    )}
                  </div>
                  <div className='space-y-3'>
                    <label
                      htmlFor='profile-company'
                      className={profileLabelClass}>
                      Company / Organisation
                    </label>
                    {isEditing ? (
                      <input
                        id='profile-company'
                        type='text'
                        value={formData.company ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className={profileInputClass}
                        placeholder='Where do you work?'
                      />
                    ) : (
                      <div className='text-lg font-bold text-primary'>
                        {profile.company || 'Not added'}
                      </div>
                    )}
                  </div>
                  <div className='space-y-3'>
                    <label
                      htmlFor='profile-category'
                      className={profileLabelClass}>
                      Professional Category
                    </label>
                    {isEditing ? (
                      <select
                        id='profile-category'
                        value={formData.category ?? 'Other'}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className={profileInputClass}>
                        {profileCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className='text-lg font-bold text-primary'>
                        {profile.category || 'Other'}
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-3'>
                  <label
                    htmlFor='profile-bio'
                    className={profileLabelClass}>
                    Bio / About
                  </label>
                  {isEditing ? (
                    <textarea
                      id='profile-bio'
                      rows='3'
                      required
                      value={formData.bio ?? ''}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className={`${profileInputClass} resize-none`}
                    />
                  ) : (
                    <p className='text-lg text-gray-600 leading-relaxed font-medium'>
                      {profile.bio || 'Sharing the Old Tom spirit.'}
                    </p>
                  )}
                </div>

                <div className='space-y-3'>
                  <label
                    htmlFor='profile-skills'
                    className={profileLabelClass}>
                    Skills
                  </label>
                  {isEditing ? (
                    <input
                      id='profile-skills'
                      type='text'
                      value={formData.skills ?? ''}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value })
                      }
                      className={profileInputClass}
                      placeholder='Leadership, finance, software, mentoring'
                    />
                  ) : (
                    <p className='text-lg text-gray-600 leading-relaxed font-medium'>
                      {profile.skills || 'No skills added yet.'}
                    </p>
                  )}
                </div>
                  </section>
                )}

                {/* Art & Portfolio Section */}
                {(!isEditing || activeStep === 1) && (
                  <section className={isEditing ? '' : 'pt-12 border-t border-gray-100'}>
                    {!isEditing && (
                      <div className='flex items-center gap-4 mb-8'>
                        <div className='h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center shadow-lg'>
                          <Palette className='h-6 w-6 text-primary' />
                        </div>
                        <h3 className='text-2xl font-black text-primary uppercase tracking-tighter'>
                          Art & Creative Portfolio
                        </h3>
                      </div>
                    )}

                    <div className='space-y-6'>
                      <div className='space-y-3'>
                        <label
                          htmlFor='profile-portfolio-url'
                          className={profileLabelClass}>
                          Portfolio/Website URL
                        </label>
                        {isEditing ? (
                          <input
                            id='profile-portfolio-url'
                            type='url'
                            value={formData.portfolio_url ?? ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                portfolio_url: e.target.value,
                              })
                            }
                            className={profileInputClass}
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
                        <label
                          htmlFor='profile-work-description'
                          className={profileLabelClass}>
                          Work Description
                        </label>
                        {isEditing ? (
                          <textarea
                            id='profile-work-description'
                            rows='3'
                            value={formData.art_work_description ?? ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                art_work_description: e.target.value,
                              })
                            }
                            className={`${profileInputClass} resize-none`}
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
                  </section>
                )}

                {/* Social Networks Grid */}
                {(!isEditing || activeStep === 2) && (
                  <section className={isEditing ? '' : 'pt-12 border-t border-gray-100'}>
                    {!isEditing && (
                      <h3 className='text-xl font-black text-primary uppercase tracking-tighter mb-8'>
                        Social Networks
                      </h3>
                    )}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {['facebook', 'instagram', 'twitter', 'linkedin'].map(
                      (social) => (
                        <div key={social} className='space-y-3'>
                          <label
                            htmlFor={`profile-${social}`}
                            className={profileLabelClass}>
                            {social}
                          </label>
                          {isEditing ? (
                            <input
                              id={`profile-${social}`}
                              type='url'
                              value={formData[social] ?? ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [social]: e.target.value,
                                })
                              }
                              className={profileInputClass}
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
                  </section>
                )}

                {isEditing && activeStep === 3 && (
                  <section className='space-y-4'>
                    <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-primary font-semibold'>
                      Review your details below. Use an Edit button to return to
                      a step, or save when everything looks right.
                    </div>

                    <div className='rounded-xl border border-gray-100 bg-gray-50 p-4 md:p-5'>
                      <div className='flex items-center justify-between gap-4 mb-4'>
                        <h3 className='text-lg font-black text-primary uppercase tracking-tight'>
                          Identity & Professional
                        </h3>
                        <button
                          type='button'
                          onClick={() => {
                            setActiveStep(0);
                            scrollToProfileForm();
                          }}
                          className='text-xs font-black text-primary uppercase tracking-widest hover:text-secondary'>
                          Edit
                        </button>
                      </div>
                      <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm'>
                        {[
                          ['Full name', formData.name],
                          ['Email', formData.email],
                          ['Profession', formData.profession],
                          ['Company', formData.company],
                          ['Location', formData.location],
                          ['Category', formData.category],
                          ['Skills', formData.skills],
                          ['Bio', formData.bio],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1'>
                              {label}
                            </dt>
                            <dd className='font-bold text-primary break-words'>
                              {value || 'Not added'}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='rounded-xl border border-gray-100 bg-gray-50 p-4'>
                        <div className='flex items-center justify-between gap-4 mb-3'>
                          <h3 className='font-black text-primary uppercase tracking-tight'>
                            Art & Portfolio
                          </h3>
                          <button
                            type='button'
                            onClick={() => {
                              setActiveStep(1);
                              scrollToProfileForm();
                            }}
                            className='text-xs font-black text-primary uppercase tracking-widest hover:text-secondary'>
                            Edit
                          </button>
                        </div>
                        <p className='text-sm font-bold text-primary break-words mb-3'>
                          {formData.portfolio_url || 'No portfolio URL'}
                        </p>
                        <p className='text-sm text-gray-600 break-words'>
                          {formData.art_work_description ||
                            'No work description added.'}
                        </p>
                      </div>

                      <div className='rounded-xl border border-gray-100 bg-gray-50 p-4'>
                        <div className='flex items-center justify-between gap-4 mb-3'>
                          <h3 className='font-black text-primary uppercase tracking-tight'>
                            Social Networks
                          </h3>
                          <button
                            type='button'
                            onClick={() => {
                              setActiveStep(2);
                              scrollToProfileForm();
                            }}
                            className='text-xs font-black text-primary uppercase tracking-widest hover:text-secondary'>
                            Edit
                          </button>
                        </div>
                        <dl className='space-y-3 text-sm'>
                          {['facebook', 'instagram', 'twitter', 'linkedin'].map(
                            (social) => (
                              <div key={social} className='flex justify-between gap-4'>
                                <dt className='font-black capitalize text-gray-400'>
                                  {social}
                                </dt>
                                <dd className='font-bold text-primary truncate'>
                                  {formData[social] || 'Not linked'}
                                </dd>
                              </div>
                            ),
                          )}
                        </dl>
                      </div>
                    </div>
                  </section>
                )}

                {isEditing && (
                  <div className='flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-gray-100'>
                    <button
                      type='button'
                      onClick={cancelEditing}
                      className='w-full sm:w-auto px-5 bg-gray-100 text-gray-500 py-3 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-gray-200 transition-all'>
                      Cancel
                    </button>

                    <div className='flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto'>
                      {activeStep > 0 && (
                        <button
                          type='button'
                          onClick={handlePreviousStep}
                          className='w-full sm:w-auto px-5 bg-white text-primary border border-primary/10 py-3 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:border-primary transition-all flex items-center justify-center gap-2'>
                          <ChevronLeft className='h-4 w-4' /> Back
                        </button>
                      )}

                      {activeStep < profileSteps.length - 1 ? (
                        <button
                          type='submit'
                          className='w-full sm:min-w-32 bg-primary text-white px-5 py-3 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center gap-2'>
                          Next <ChevronRight className='h-4 w-4' />
                        </button>
                      ) : (
                        <button
                          type='submit'
                          disabled={submitting}
                          className='w-full sm:min-w-40 bg-primary text-white px-5 py-3 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60'>
                          {submitting ? (
                            <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                          ) : (
                            <>
                              <Save className='h-5 w-5' /> Save Profile
                            </>
                          )}
                        </button>
                      )}
                    </div>
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
