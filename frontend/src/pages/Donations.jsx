import React, { useState } from 'react';
import { CreditCard, DollarSign, Award, ShieldCheck, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import { donationService } from '../services/api';

const Donations = () => {
  const [paymentMethod, setPaymentMethod] = useState('momo'); // 'momo' or 'card'
  const [amount, setAmount] = useState('50');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const causes = [
    {
      title: "Educational Support",
      description: "Direct funding for textbooks, lab equipment, and tuition for students in need.",
      amount: "Goal: $2,500"
    },
    {
      title: "Alumni Welfare Fund",
      description: "Emergency support system for members of the Class of 2016 facing hardships.",
      amount: "Ongoing"
    },
    {
      title: "Reunion Fund",
      description: "Support the planning and execution of our 10-year anniversary celebrations.",
      amount: "Goal: $5,000"
    }
  ];

  const handleAmountClick = (amt) => {
    if (amt === 'Custom') {
      setIsCustom(true);
      setAmount('');
    } else {
      setIsCustom(false);
      setAmount(amt.replace('$', ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const donationData = {
        ...formData,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        status: 'pending' // In a real app, this would be updated by a webhook
      };
      
      await donationService.create(donationData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error processing donation:", error);
      alert("There was an error processing your donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-xl text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-8">
            Your donation of <strong>${amount}</strong> via <strong>{paymentMethod === 'momo' ? 'Mobile Money' : 'Card'}</strong> has been initiated. 
            {paymentMethod === 'momo' ? " Please check your phone for the payment prompt." : " You will be redirected to complete the payment."}
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all w-full"
          >
            Back to Donations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-black mb-6 uppercase tracking-tight">Give Back to Old Toms</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto font-medium">
            Your contributions directly support the next generation of students and our alumni community projects.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Main Donation Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-black text-primary mb-8 uppercase tracking-tight">Make a Donation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Amount Selection */}
              <div>
                <label className="block text-gray-700 font-bold mb-4 uppercase text-sm tracking-wider">Select Amount</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['$10', '$50', '$100', 'Custom'].map((amt) => (
                    <button 
                      type="button"
                      key={amt} 
                      onClick={() => handleAmountClick(amt)}
                      className={`py-4 rounded-2xl font-black text-lg transition-all border-2 ${
                        (amt === 'Custom' && isCustom) || (amt.replace('$', '') === amount && !isCustom)
                        ? 'border-primary bg-primary text-white shadow-lg' 
                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                {isCustom && (
                  <div className="mt-4 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input 
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-gray-50 border-0 rounded-2xl px-10 py-4 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-lg"
                    />
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2 uppercase text-sm tracking-wider">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2 uppercase text-sm tracking-wider">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-gray-700 font-bold mb-4 uppercase text-sm tracking-wider">Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('momo')}
                    className={`flex items-center p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'momo' 
                      ? 'border-primary bg-blue-50/50' 
                      : 'border-gray-100 hover:border-primary'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 ${paymentMethod === 'momo' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-primary">Mobile Money</p>
                      <p className="text-xs text-gray-500">MTN, Vodafone, AirtelTigo</p>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'card' 
                      ? 'border-primary bg-blue-50/50' 
                      : 'border-gray-100 hover:border-primary'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 ${paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-primary">Card Payment</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Phone Field for MoMo */}
              {paymentMethod === 'momo' && (
                <div>
                  <label className="block text-gray-700 font-bold mb-2 uppercase text-sm tracking-wider">Mobile Money Number</label>
                  <input 
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="024 000 0000"
                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center space-x-3 disabled:opacity-70 disabled:transform-none"
              >
                {loading ? (
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Donate ${amount || '0'}</span>
                    <ArrowRight className="h-6 w-6" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-6 pt-4 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-secondary p-8 rounded-3xl border border-secondary/20">
              <Award className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-2xl font-black text-primary mb-4 uppercase tracking-tight">Active Causes</h3>
              <div className="space-y-6">
                {causes.map((cause) => (
                  <div key={cause.title} className="bg-white/50 p-5 rounded-2xl border border-white/50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-primary">{cause.title}</h4>
                      <span className="text-[10px] font-black text-white bg-primary px-2 py-1 rounded-full uppercase tracking-widest">
                        {cause.amount}
                      </span>
                    </div>
                    <p className="text-primary/70 text-sm leading-relaxed">{cause.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary p-8 rounded-3xl text-white shadow-xl">
              <ShieldCheck className="h-10 w-10 text-secondary mb-4" />
              <h4 className="text-xl font-black mb-2 uppercase tracking-tight">100% Secure</h4>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                Your security is our priority. We use industry-standard encryption to protect your data.
              </p>
              <div className="flex items-center text-secondary font-bold text-sm">
                <span>Verified by SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
