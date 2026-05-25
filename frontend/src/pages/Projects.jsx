/** @format */

import React, { useEffect, useState } from 'react';
import { projectService } from '../services/api';
import {
  Briefcase,
  Heart,
  BookOpen,
  Users,
  ArrowRight,
  Plus,
  Target,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  Upload,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Active',
    goal_amount: '',
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchProjects();
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropose = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (image) data.append('image', image);

    try {
      await projectService.create(data);
      setShowOpenModal(false);
      fetchProjects();
      setFormData({
        title: '',
        description: '',
        status: 'Active',
        goal_amount: '',
      });
      setImage(null);
    } catch (err) {
      alert('Failed to propose project.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-600';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-600';
      case 'Ongoing':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className='bg-white min-h-screen pb-20'>
      <div className='bg-primary text-white py-20 px-4 mb-12 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-1/3 h-full bg-secondary opacity-10 skew-x-12 translate-x-20'></div>
        <div className='max-w-7xl mx-auto text-center relative z-10'>
          <h1 className='text-5xl font-black uppercase tracking-tighter mb-4'>
            Projects & Initiatives
          </h1>
          <p className='text-xl text-blue-100 max-w-2xl mx-auto font-medium'>
            Collective actions by Old Toms to drive development and give back to
            our community.
          </p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex justify-between items-center mb-12'>
          <h2 className='text-3xl font-black text-primary uppercase tracking-tight'>
            Active Initiatives
          </h2>
          {isLoggedIn && (
            <button
              onClick={() => setShowOpenModal(true)}
              className='bg-secondary text-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-xl'>
              <Plus className='h-5 w-5' /> Propose Project
            </button>
          )}
        </div>

        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='animate-spin h-12 w-12 border-t-4 border-b-4 border-primary rounded-full'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20'>
            {projects.map((project) => (
              <div
                key={project.id}
                className='bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group'>
                <div className='h-56 bg-gray-100 relative'>
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Target className='h-16 w-16 text-gray-200' />
                    </div>
                  )}
                  <div
                    className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusColor(project.status)}`}>
                    {project.status}
                  </div>
                </div>
                <div className='p-10'>
                  <h3 className='text-2xl font-black text-primary mb-4 group-hover:text-secondary transition-colors uppercase tracking-tight'>
                    {project.title}
                  </h3>
                  <p className='text-gray-600 leading-relaxed mb-8 line-clamp-3 font-medium'>
                    {project.description}
                  </p>

                  {project.goal_amount > 0 && (
                    <div className='mb-8 space-y-3'>
                      <div className='flex justify-between text-xs font-black uppercase tracking-widest'>
                        <span className='text-gray-400'>Progress</span>
                        <span className='text-primary'>
                          ${project.raised_amount} / ${project.goal_amount}
                        </span>
                      </div>
                      <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-secondary transition-all duration-1000'
                          style={{
                            width: `${Math.min((project.raised_amount / project.goal_amount) * 100, 100)}%`,
                          }}></div>
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/projects/${project.id}`}
                    className='flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all'>
                    View Details{' '}
                    <ArrowRight className='h-4 w-4 text-secondary' />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Proposing Project */}
        {showModal && (
          <div className='fixed inset-0 z-[110] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in'>
            <div className='bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative'>
              <button
                onClick={() => setShowOpenModal(false)}
                className='absolute top-8 right-8 text-gray-400 hover:text-primary transition-colors'>
                <X className='h-6 w-6' />
              </button>

              <div className='bg-primary p-10 text-white'>
                <h2 className='text-3xl font-black uppercase tracking-tighter mb-2'>
                  Propose Initiative
                </h2>
                <p className='text-blue-100 font-medium opacity-80'>
                  Tell us how you want to impact the Old Toms community.
                </p>
              </div>

              <form onSubmit={handlePropose} className='p-10 space-y-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>
                      Project Title
                    </label>
                    <input
                      required
                      type='text'
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className='w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-secondary outline-none transition-all'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>
                      Fundraising Goal ($)
                    </label>
                    <input
                      type='number'
                      value={formData.goal_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          goal_amount: e.target.value,
                        })
                      }
                      className='w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-secondary outline-none transition-all'
                      placeholder='Optional'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>
                    Project Description
                  </label>
                  <textarea
                    required
                    rows='4'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className='w-full bg-gray-50 border-none rounded-3xl px-6 py-4 font-bold focus:ring-2 focus:ring-secondary outline-none transition-all resize-none'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>
                    Feature Image
                  </label>
                  <label className='flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl py-10 cursor-pointer hover:bg-gray-50 transition-colors'>
                    <Upload className='h-8 w-8 text-gray-300 mb-2' />
                    <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                      Click to upload
                    </span>
                    <input
                      type='file'
                      className='hidden'
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                    {image && (
                      <span className='mt-2 text-primary font-black text-[10px] uppercase'>
                        {image.name}
                      </span>
                    )}
                  </label>
                </div>

                <button
                  type='submit'
                  disabled={submitting}
                  className='w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50'>
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Plus className='h-5 w-5' /> Submit Proposal
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Featured Impact Section */}
        <div className='bg-primary rounded-[3rem] overflow-hidden shadow-2xl relative'>
          <div className='absolute top-0 right-0 w-1/2 h-full bg-secondary opacity-5 -skew-x-12 translate-x-40'></div>
          <div className='grid grid-cols-1 lg:grid-cols-2 relative z-10'>
            <div className='p-12 md:p-20 flex flex-col justify-center'>
              <h2 className='text-4xl font-black text-white uppercase tracking-tighter mb-6'>
                Create Impact with Us
              </h2>
              <p className='text-blue-100 text-lg mb-10 leading-relaxed font-medium'>
                Do you have a project idea that could benefit our alma mater or
                the wider community? We provide the platform and network to
                bring meaningful initiatives to life.
              </p>
              <button
                onClick={() =>
                  isLoggedIn
                    ? setShowOpenModal(true)
                    : alert('Please login to propose a project.')
                }
                className='bg-secondary text-primary px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all w-fit shadow-2xl'>
                Start an Initiative
              </button>
            </div>
            <div className='bg-blue-900/50 backdrop-blur-md flex items-center justify-center p-12 md:p-20 border-l border-white/5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-12 text-center w-full'>
                <div>
                  <TrendingUp className='h-10 w-10 text-secondary mx-auto mb-4' />
                  <div className='text-5xl font-black text-white mb-2'>
                    $5,000+
                  </div>
                  <p className='text-blue-200 uppercase tracking-[0.2em] text-[10px] font-black'>
                    Raised for Impact
                  </p>
                </div>
                <div>
                  <CheckCircle2 className='h-10 w-10 text-secondary mx-auto mb-4' />
                  <div className='text-5xl font-black text-white mb-2'>12+</div>
                  <p className='text-blue-200 uppercase tracking-[0.2em] text-[10px] font-black'>
                    Completed Projects
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
