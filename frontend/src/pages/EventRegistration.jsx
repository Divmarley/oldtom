/** @format */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import {
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

const EventRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    alumni_id: '',
    notes: '',
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventService.getById(eventId);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Ensure event ID is a number
      const registrationData = {
        ...formData,
        event: parseInt(eventId),
      };

      await eventService.register(registrationData);
      setSubmitted(true);
    } catch (error) {
      console.error(
        'Error registering for event:',
        error.response?.data || error.message,
      );
      const errorMsg = error.response?.data
        ? Object.values(error.response.data).flat().join(' ')
        : 'Something went wrong. Please try again.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
        <h2 className='text-2xl font-bold text-gray-800 mb-4'>
          Event Not Found
        </h2>
        <button
          onClick={() => navigate('/events')}
          className='text-primary font-bold flex items-center hover:underline'>
          <ArrowLeft className='mr-2 h-5 w-5' /> Back to Events
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-3xl p-10 max-w-lg w-full shadow-xl text-center'>
          <div className='bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <CheckCircle className='h-10 w-10 text-green-600' />
          </div>
          <h2 className='text-3xl font-bold text-primary mb-4'>
            Registration Successful!
          </h2>
          <p className='text-gray-600 mb-8'>
            Thank you for registering for <strong>{event.title}</strong>. We've
            received your details and look forward to seeing you there!
          </p>
          <button
            onClick={() => navigate('/events')}
            className='bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all w-full'>
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#f9fafb] min-h-screen pb-20'>
      {/* Header */}
      <div className='bg-primary text-white py-12 px-4'>
        <div className='max-w-4xl mx-auto'>
          <button
            onClick={() => navigate('/events')}
            className='flex items-center text-secondary mb-6 hover:underline font-medium'>
            <ArrowLeft className='mr-2 h-4 w-4' /> Back to Events
          </button>
          <h1 className='text-4xl font-black mb-2 uppercase tracking-tight'>
            Event Registration
          </h1>
          <p className='text-gray-300 text-lg'>
            Secure your spot for {event.title}
          </p>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 -mt-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Form Section */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-3xl p-8 shadow-xl border border-gray-100'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-gray-700 font-bold mb-2 flex items-center'>
                      <User className='h-4 w-4 mr-2 text-primary' /> Full Name
                    </label>
                    <input
                      type='text'
                      name='name'
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className='w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all'
                      placeholder='Enter your name'
                    />
                  </div>
                  <div>
                    <label className='block text-gray-700 font-bold mb-2 flex items-center'>
                      <Mail className='h-4 w-4 mr-2 text-primary' /> Email
                      Address
                    </label>
                    <input
                      type='email'
                      name='email'
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className='w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all'
                      placeholder='your@email.com'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-gray-700 font-bold mb-2 flex items-center'>
                      <Phone className='h-4 w-4 mr-2 text-primary' /> Phone
                      Number
                    </label>
                    <input
                      type='tel'
                      name='phone'
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className='w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all'
                      placeholder='+233...'
                    />
                  </div>
                  <div>
                    <label className='block text-gray-700 font-bold mb-2 flex items-center'>
                      <ShieldCheck className='h-4 w-4 mr-2 text-primary' />{' '}
                      Alumni ID (Optional)
                    </label>
                    <input
                      type='text'
                      name='alumni_id'
                      value={formData.alumni_id}
                      onChange={handleChange}
                      className='w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all'
                      placeholder='Class of 2016 ID'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-gray-700 font-bold mb-2 flex items-center'>
                    <FileText className='h-4 w-4 mr-2 text-primary' />{' '}
                    Additional Notes
                  </label>
                  <textarea
                    name='notes'
                    rows='4'
                    value={formData.notes}
                    onChange={handleChange}
                    className='w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none'
                    placeholder='Dietary requirements or special requests...'></textarea>
                </div>

                <button
                  type='submit'
                  disabled={submitting}
                  className='w-full bg-primary text-white py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center disabled:opacity-70 disabled:transform-none'>
                  {submitting ? (
                    <div className='h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  ) : (
                    'Confirm Registration'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-secondary/10 border border-secondary/20 rounded-3xl p-6 sticky top-24'>
              {event.image && (
                <div className='mb-6 rounded-2xl overflow-hidden h-40 shadow-sm'>
                  <img
                    src={event.image}
                    alt={event.title}
                    className='w-full h-full object-cover'
                  />
                </div>
              )}
              <h3 className='text-primary font-black text-xl mb-6 uppercase tracking-tight'>
                Event Details
              </h3>

              <div className='space-y-6'>
                <div className='flex items-start'>
                  <div className='bg-white p-3 rounded-xl shadow-sm mr-4'>
                    <Calendar className='h-6 w-6 text-primary' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 uppercase font-bold tracking-wider'>
                      Date & Time
                    </p>
                    <p className='text-primary font-bold'>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <div className='bg-white p-3 rounded-xl shadow-sm mr-4'>
                    <MapPin className='h-6 w-6 text-primary' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 uppercase font-bold tracking-wider'>
                      Location
                    </p>
                    <p className='text-primary font-bold'>{event.location}</p>
                  </div>
                </div>
              </div>

              <div className='mt-10 p-4 bg-primary rounded-2xl text-white'>
                <p className='text-sm font-medium opacity-80 mb-2 italic'>
                  Note:
                </p>
                <p className='text-sm leading-relaxed'>
                  Please arrive 15 minutes before the start time for check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;
