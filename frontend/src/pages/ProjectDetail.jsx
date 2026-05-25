/** @format */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService, donationService } from '../services/api';
import { 
  ArrowLeft, Target, TrendingUp, CheckCircle2, 
  Heart, Share2, Calendar, User, ShieldCheck,
  CreditCard, Smartphone, CheckCircle, X
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Donation Modal State
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationStep, setDonationStep] = useState(1); // 1: Amount, 2: Payment Info, 3: Success
  const [donationData, setDonationData] = useState({
    amount: '',
    name: '',
    email: '',
    payment_method: 'momo',
    phone: ''
  });
  const [submittingDonation, setSubmittingDonation] = useState(false);

  useEffect(() => {
    fetchProject();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getById(id);
      setProject(response.data);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Project not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (donationStep === 1) {
      setDonationStep(2);
      return;
    }
    
    setSubmittingDonation(true);
    try {
      await donationService.create({
        ...donationData,
        project: project.id,
        status: 'completed', // Simulated completion
        transaction_id: `TXN-${Date.now()}`
      });
      setDonationStep(3);
      fetchProject(); // Refresh raised amount
    } catch (err) {
      alert('Donation failed. Please try again.');
    } finally {
      setSubmittingDonation(false);
    }
  };

  if (loading) return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary'></div>
    </div>
  );

  if (error || !project) return (
    <div className='text-center py-40'>
      <h2 className='text-2xl font-black text-primary mb-4'>{error}</h2>
      <Link to='/projects' className='text-secondary font-bold hover:underline'>Back to Projects</Link>
    </div>
  );

  const progress = project.goal_amount > 0 ? Math.min((project.raised_amount / project.goal_amount) * 100, 100) : 0;

  return (
    <div className='bg-white min-h-screen'>
      {/* Hero Section */}
      <div className='bg-primary text-white py-20 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-1/3 h-full bg-secondary opacity-10 skew-x-12 translate-x-20'></div>
        <div className='max-w-6xl mx-auto px-4 relative z-10'>
          <Link to='/projects' className='inline-flex items-center text-white/70 hover:text-secondary mb-8 transition-colors font-bold uppercase tracking-widest text-xs'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Initiatives
          </Link>
          
          <div className='flex flex-col lg:flex-row gap-12 items-center'>
            <div className='flex-1 text-center lg:text-left'>
              <div className='flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6'>
                <span className='bg-secondary text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg'>
                  Initiative
                </span>
                <span className='text-blue-200 font-black uppercase tracking-widest text-[10px]'>
                  Est. {new Date(project.created_at).getFullYear()}
                </span>
              </div>
              <h1 className='text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-6'>
                {project.title}
              </h1>
              <div className='flex flex-wrap justify-center lg:justify-start gap-6 text-blue-100 font-bold text-sm'>
                <div className='flex items-center gap-2'>
                  <User className='h-5 w-5 text-secondary' />
                  <span>By {project.proposer_details?.username || 'Old Tom Admin'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-secondary' />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className='w-full lg:w-96'>
              <div className='bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl'>
                <div className='mb-6 space-y-3'>
                  <div className='flex justify-between items-end'>
                    <div className='text-3xl font-black text-secondary'>${project.raised_amount}</div>
                    <div className='text-xs font-black uppercase tracking-widest text-blue-200'>Raised of ${project.goal_amount}</div>
                  </div>
                  <div className='h-3 bg-white/10 rounded-full overflow-hidden'>
                    <div className='h-full bg-secondary transition-all duration-1000' style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className='text-[10px] font-black uppercase tracking-widest text-blue-200 text-center'>{progress.toFixed(0)}% Completed</div>
                </div>
                <button 
                  onClick={() => setShowDonateModal(true)}
                  className='w-full bg-secondary text-primary py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-xl mb-4'
                >
                  Donate Now
                </button>
                <div className='flex justify-center gap-4'>
                  <button className='flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest'>
                    <Heart className='h-4 w-4' /> Favorite
                  </button>
                  <button className='flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest'>
                    <Share2 className='h-4 w-4' /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-6xl mx-auto px-4 py-20'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-16'>
          
          <div className='lg:col-span-8 space-y-16'>
            {/* About Section */}
            <section>
              <h2 className='text-3xl font-black text-primary uppercase tracking-tighter mb-8 pb-4 border-b-4 border-secondary inline-block'>
                About the Project
              </h2>
              {project.image && (
                <img src={project.image} alt={project.title} className='w-full h-[400px] object-cover rounded-[3rem] shadow-2xl mb-10' />
              )}
              <div className='prose prose-xl prose-primary max-w-none text-gray-700 leading-loose space-y-6'>
                {project.description.split('\n').map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </section>

            {/* Impact Section */}
            <section className='bg-gray-50 p-10 md:p-14 rounded-[3rem] border border-gray-100'>
              <div className='flex items-center gap-4 mb-10'>
                <div className='h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg'>
                  <TrendingUp className='h-6 w-6 text-secondary' />
                </div>
                <h3 className='text-2xl font-black text-primary uppercase tracking-tighter'>Why This Matters</h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <div className='flex gap-4'>
                  <div className='h-8 w-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0'>
                    <CheckCircle2 className='h-5 w-5' />
                  </div>
                  <div>
                    <h4 className='font-black text-primary uppercase tracking-tight mb-2'>Direct Impact</h4>
                    <p className='text-sm text-gray-600 font-medium'>Every dollar raised goes directly towards the materials and logistics required for this initiative.</p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='h-8 w-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0'>
                    <CheckCircle2 className='h-5 w-5' />
                  </div>
                  <div>
                    <h4 className='font-black text-primary uppercase tracking-tight mb-2'>Sustainability</h4>
                    <p className='text-sm text-gray-600 font-medium'>We ensure that every project has a long-term plan to continue benefiting the community after completion.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className='lg:col-span-4 space-y-8'>
            <div className='bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100'>
              <h3 className='text-xl font-black text-primary uppercase tracking-tighter mb-8 flex items-center gap-2'>
                <ShieldCheck className='h-6 w-6 text-secondary' /> Secure Donation
              </h3>
              <p className='text-gray-500 font-medium mb-8 leading-relaxed text-sm'>
                Your contributions are protected and managed with full transparency. 100% of your donation supports the project goals.
              </p>
              <div className='space-y-4'>
                <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-2xl'>
                  <CreditCard className='h-5 w-5 text-primary opacity-30' />
                  <span className='text-xs font-black uppercase tracking-widest text-primary'>Card Payments</span>
                </div>
                <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-2xl'>
                  <Smartphone className='h-5 w-5 text-primary opacity-30' />
                  <span className='text-xs font-black uppercase tracking-widest text-primary'>Mobile Money</span>
                </div>
              </div>
            </div>

            <div className='bg-primary p-12 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden'>
              <div className='absolute -bottom-10 -right-10 w-40 h-40 bg-secondary opacity-10 rounded-full'></div>
              <h3 className='text-2xl font-black uppercase tracking-tighter mb-6 relative z-10'>Be a Hero</h3>
              <p className='font-bold text-blue-100 leading-relaxed mb-8 relative z-10 opacity-80'>
                Every contribution, no matter the size, brings us closer to making this project a reality for the community.
              </p>
              <button 
                onClick={() => setShowDonateModal(true)}
                className='block w-full bg-secondary text-primary text-center py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all relative z-10 shadow-xl'
              >
                Donate Now
              </button>
            </div>
          </aside>

        </div>
      </div>

      {/* Donation Modal */}
      {showDonateModal && (
        <div className='fixed inset-0 z-[120] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in'>
          <div className='bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative'>
            <button 
              onClick={() => { setShowDonateModal(false); setDonationStep(1); }}
              className='absolute top-8 right-8 text-gray-400 hover:text-primary transition-colors'
            >
              <X className='h-6 w-6' />
            </button>
            
            <div className='bg-primary p-10 text-white'>
              <h2 className='text-3xl font-black uppercase tracking-tighter mb-2'>Complete Donation</h2>
              <p className='text-blue-100 font-medium opacity-80'>Support: {project.title}</p>
            </div>

            <div className='p-10'>
              {donationStep === 1 && (
                <div className='space-y-8 animate-in slide-in-from-right-10'>
                  <div className='space-y-4'>
                    <label className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Select Amount ($)</label>
                    <div className='grid grid-cols-3 gap-4'>
                      {[10, 50, 100].map(amt => (
                        <button 
                          key={amt}
                          onClick={() => setDonationData({...donationData, amount: amt})}
                          className={`py-4 rounded-2xl font-black text-lg transition-all border-2 ${donationData.amount === amt ? 'bg-secondary text-primary border-secondary' : 'bg-gray-50 text-primary border-transparent hover:border-gray-200'}`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="number" 
                      value={donationData.amount}
                      onChange={e => setDonationData({...donationData, amount: e.target.value})}
                      placeholder="Custom Amount"
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 font-black text-xl text-center focus:ring-2 focus:ring-secondary outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => donationData.amount > 0 && setDonationStep(2)}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-all shadow-xl"
                  >
                    Next Step
                  </button>
                </div>
              )}

              {donationStep === 2 && (
                <form onSubmit={handleDonateSubmit} className='space-y-6 animate-in slide-in-from-right-10'>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={donationData.name}
                      onChange={e => setDonationData({...donationData, name: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-secondary outline-none transition-all"
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={donationData.email}
                      onChange={e => setDonationData({...donationData, email: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-secondary outline-none transition-all"
                    />
                  </div>
                  <div className='space-y-4'>
                    <label className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Payment Method</label>
                    <div className='flex gap-4'>
                      <button 
                        type="button"
                        onClick={() => setDonationData({...donationData, payment_method: 'momo'})}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 flex flex-col items-center gap-2 transition-all ${donationData.payment_method === 'momo' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-primary border-transparent'}`}
                      >
                        <Smartphone className="h-5 w-5" /> MoMo
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDonationData({...donationData, payment_method: 'card'})}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 flex flex-col items-center gap-2 transition-all ${donationData.payment_method === 'card' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-primary border-transparent'}`}
                      >
                        <CreditCard className="h-5 w-5" /> Card
                      </button>
                    </div>
                  </div>
                  {donationData.payment_method === 'momo' && (
                    <div className='space-y-2 animate-in fade-in'>
                      <label className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        value={donationData.phone}
                        onChange={e => setDonationData({...donationData, phone: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-secondary outline-none transition-all"
                        placeholder="024 XXX XXXX"
                      />
                    </div>
                  )}
                  <div className='flex gap-4 pt-4'>
                    <button 
                      type="button"
                      onClick={() => setDonationStep(1)}
                      className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-2xl font-black uppercase tracking-widest text-xs"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={submittingDonation}
                      className="flex-[2] bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 shadow-xl"
                    >
                      {submittingDonation ? 'Processing...' : `Confirm $${donationData.amount}`}
                    </button>
                  </div>
                </form>
              )}

              {donationStep === 3 && (
                <div className='text-center py-10 animate-in zoom-in-95'>
                  <div className='h-24 w-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner'>
                    <CheckCircle className='h-12 w-12' />
                  </div>
                  <h3 className='text-3xl font-black text-primary uppercase tracking-tighter mb-4'>Contribution Received!</h3>
                  <p className='text-gray-500 font-medium mb-10 leading-relaxed'>
                    Thank you, {donationData.name.split(' ')[0]}! Your donation of ${donationData.amount} has been successfully processed for "{project.title}".
                  </p>
                  <button 
                    onClick={() => { setShowDonateModal(false); setDonationStep(1); }}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-all shadow-xl"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
