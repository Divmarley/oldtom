import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Lock, User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.username?.[0] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
          <div className="text-center mb-10">
            <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-primary uppercase tracking-tight">Create Account</h1>
            <p className="text-gray-500 mt-2">Join the Old Toms network</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-widest">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-widest">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-widest">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center space-x-3 disabled:opacity-70 disabled:transform-none mt-4"
            >
              {loading ? (
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-6 w-6" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
