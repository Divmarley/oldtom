import React, { useState, useEffect } from 'react';
import { yearbookService } from '../services/api';
import { Camera, Edit3, Heart, Image as ImageIcon, Users } from 'lucide-react';

const Yearbook = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', message: '' });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await yearbookService.getAll();
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching yearbook entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await yearbookService.create(newEntry);
      setNewEntry({ name: '', message: '' });
      setShowModal(false);
      fetchEntries();
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  // Filter out the main badge if it exists
  const badgeEntry = entries.find(e => e.is_badge);
  const regularEntries = entries.filter(e => !e.is_badge);

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20 font-serif">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">The Legacy Wall</h1>
        <p className="text-xl text-secondary opacity-90 max-w-2xl mx-auto italic">
          "Class of 2016: A tapestry of stories, signatures, and shared dreams."
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* The Centerpiece - Class Badge/Photo */}
        <div className="flex justify-center mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-primary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white p-8 rounded-full border-4 border-secondary shadow-2xl w-64 h-64 flex items-center justify-center overflow-hidden">
              {badgeEntry?.image ? (
                <img src={badgeEntry.image} alt="Class Badge" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Users className="h-16 w-16 text-primary mx-auto mb-2" />
                  <span className="text-primary font-bold text-xl">CLASS OF 2016</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mb-12">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center mx-auto"
          >
            <Edit3 className="mr-2 h-5 w-5" /> Sign the Wall
          </button>
        </div>

        {/* The Collage/Wall */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Scrutinized/Scattered entries look */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularEntries.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`bg-white p-6 rounded-lg shadow-md border-t-4 border-secondary transform transition-all hover:scale-105 hover:rotate-1`}
                  style={{
                    transform: `rotate(${(index % 3 - 1) * 2}deg)`,
                  }}
                >
                  {entry.image && (
                    <div className="mb-4 rounded overflow-hidden h-40">
                      <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-gray-700 italic mb-4 leading-relaxed">"{entry.message}"</p>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-bold text-primary">{entry.name}</span>
                    <Heart className="h-4 w-4 text-red-400 fill-current" />
                  </div>
                </div>
              ))}
            </div>
            
            {regularEntries.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No signatures yet. Be the first to leave your mark!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signature Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-primary mb-6">Leave Your Legacy</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Your Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Your Message / Signature</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="Share a memory or a wish..."
                  value={newEntry.message}
                  onChange={(e) => setNewEntry({...newEntry, message: e.target.value})}
                ></textarea>
              </div>
              <div className="flex space-x-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Post Signature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Yearbook;
