import React, { useState } from 'react';
import { alumniService } from '../services/api';
import { Send, Upload, CheckCircle } from 'lucide-react';

const Join = () => {
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    company: '',
    location: '',
    bio: '',
    skills: '',
    linkedin: '',
    email: '',
    category: 'Tech',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (photo) data.append('photo', photo);

    try {
      await alumniService.create(data);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Submission error:", err);
      setError("Something went wrong. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-primary mb-4">Welcome to the Network!</h2>
          <p className="text-gray-600 mb-8">
            Your profile has been submitted successfully and is now part of the Old Toms directory.
          </p>
          <div className="flex flex-col gap-4">
            <a href="/alumni" className="bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition-colors">
              View Directory
            </a>
            <button onClick={() => setSubmitted(false)} className="text-gray-500 hover:text-primary transition-colors">
              Submit another profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-primary text-white py-16 px-4 mb-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Join the Old Toms Network</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Fill in your details and become part of our growing alumni directory.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Kofi Kumi"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input
                  required
                  name="email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="kofi@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Profession *</label>
                <input
                  required
                  name="profession"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Software Engineer"
                  value={formData.profession}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Tech">Tech</option>
                  <option value="Business">Business</option>
                  <option value="Health">Health</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Arts">Arts</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Company / Organization</label>
                <input
                  name="company"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Google"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
                <input
                  required
                  name="location"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Accra, Ghana"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Profile Photo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  {photo && <p className="text-sm font-bold text-green-600 mt-2">{photo.name} selected</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Skills (Comma separated) *</label>
              <input
                required
                name="skills"
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="React Native, Django, APIs"
                value={formData.skills}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Short Bio *</label>
              <textarea
                required
                name="bio"
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Briefly describe your journey and what you do..."
                value={formData.bio}
                onChange={handleChange}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn Profile URL</label>
              <input
                name="linkedin"
                type="url"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="https://linkedin.com/in/kofikumi"
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-lg ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-900'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Profile</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Join;
