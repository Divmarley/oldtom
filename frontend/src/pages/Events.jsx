/** @format */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    description: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventService.update(editingEvent.id, formData);
      } else {
        await eventService.create(formData);
      }
      setShowModal(false);
      setEditingEvent(null);
      setFormData({ title: '', location: '', date: '', description: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    // Format date for datetime-local input
    const date = new Date(event.date);
    const formattedDate = date.toISOString().slice(0, 16);
    setFormData({
      title: event.title,
      location: event.location,
      date: formattedDate,
      description: event.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.delete(id);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen pb-20'>
      <div className='bg-primary text-white py-16 px-4 mb-12 relative overflow-hidden'>
        <div className='max-w-7xl mx-auto text-center relative z-10'>
          <h1 className='text-4xl font-bold mb-4'>Upcoming Events</h1>
          <p className='text-xl text-gray-300 max-w-2xl mx-auto mb-8'>
            Stay updated with reunions, meetings, and special events designed
            for our alumni.
          </p>
          <button
            onClick={() => {
              setEditingEvent(null);
              setFormData({
                title: '',
                location: '',
                date: '',
                description: '',
              });
              setShowModal(true);
            }}
            className='bg-secondary text-primary px-6 py-3 rounded-full font-bold flex items-center mx-auto hover:bg-yellow-400 transition-all shadow-lg'>
            <Plus className='mr-2 h-5 w-5' /> Create New Event
          </button>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-4'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
          </div>
        ) : (
          <div className='space-y-8'>
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow relative group'>
                  <div className='md:w-1/4 bg-blue-600 text-white p-8 flex flex-col items-center justify-center text-center'>
                    <span className='text-4xl font-bold'>
                      {new Date(event.date).getDate()}
                    </span>
                    <span className='text-xl uppercase tracking-widest'>
                      {new Date(event.date).toLocaleString('default', {
                        month: 'short',
                      })}
                    </span>
                    <span className='mt-2 text-blue-200'>
                      {new Date(event.date).getFullYear()}
                    </span>
                  </div>
                  <div className='p-8 md:w-3/4 flex flex-col justify-center relative'>
                    {/* Admin Actions */}
                    <div className='absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        onClick={() => handleEdit(event)}
                        className='p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-primary hover:text-white transition-all'>
                        <Edit2 className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className='p-2 bg-gray-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all'>
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>

                    <h2 className='text-2xl font-bold text-primary mb-4'>
                      {event.title}
                    </h2>
                    <div className='flex flex-wrap gap-6 mb-6 text-gray-600'>
                      <div className='flex items-center'>
                        <MapPin className='h-5 w-5 text-secondary mr-2' />
                        <span>{event.location}</span>
                      </div>
                      <div className='flex items-center'>
                        <Clock className='h-5 w-5 text-secondary mr-2' />
                        <span>
                          {new Date(event.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <p className='text-gray-600 mb-8 leading-relaxed'>
                      {event.description}
                    </p>
                    <button
                      onClick={() => navigate(`/events/register/${event.id}`)}
                      className='bg-primary text-white px-8 py-3 rounded-lg font-bold w-fit hover:bg-blue-900 transition-colors flex items-center group'>
                      Register for Event{' '}
                      <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200'>
                <Calendar className='h-16 w-16 text-gray-200 mx-auto mb-4' />
                <h3 className='text-xl font-bold text-gray-400'>
                  No events found
                </h3>
                <p className='text-gray-400 mt-2'>
                  Be the first to create an event!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm'>
          <div className='bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200'>
            <div className='bg-primary p-6 text-white flex justify-between items-center'>
              <h2 className='text-2xl font-bold'>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='p-2 hover:bg-white/10 rounded-full transition-colors'>
                <X className='h-6 w-6' />
              </button>
            </div>
            <form onSubmit={handleSubmit} className='p-8 space-y-6'>
              <div>
                <label className='block text-gray-700 font-bold mb-2'>
                  Event Title
                </label>
                <input
                  type='text'
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className='w-full border-gray-200 border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none'
                  placeholder='e.g. Annual Reunion 2026'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-gray-700 font-bold mb-2'>
                    Location
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className='w-full border-gray-200 border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none'
                    placeholder='e.g. Accra, Ghana'
                  />
                </div>
                <div>
                  <label className='block text-gray-700 font-bold mb-2'>
                    Date & Time
                  </label>
                  <input
                    type='datetime-local'
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className='w-full border-gray-200 border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none'
                  />
                </div>
              </div>
              <div>
                <label className='block text-gray-700 font-bold mb-2'>
                  Description
                </label>
                <textarea
                  required
                  rows='4'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='w-full border-gray-200 border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none resize-none'
                  placeholder='Tell us more about the event...'></textarea>
              </div>
              <div className='flex space-x-4 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='flex-1 border-2 border-gray-200 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all'>
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-all'>
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
