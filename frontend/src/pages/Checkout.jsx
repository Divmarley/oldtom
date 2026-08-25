/** @format */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shippingService, orderService } from '../services/api';

const currency = (value) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('mono');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    shipping_option: '',
    mono_number: '',
    bank_name: '',
    account_name: '',
    account_number: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
    shippingService
      .getAll()
      .then((res) => setShippingOptions(res.data))
      .catch(() => setShippingOptions([]));
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );
  const shippingFee = shippingOptions.find((option) => String(option.id) === String(form.shipping_option))?.price || 0;
  const total = subtotal + Number(shippingFee || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    const payload = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      shipping_option: form.shipping_option || null,
      payment_method: paymentMethod,
      mono_number: paymentMethod === 'mono' ? form.mono_number : '',
      bank_name: paymentMethod === 'bank' ? form.bank_name : '',
      account_name: paymentMethod === 'bank' ? form.account_name : '',
      account_number: paymentMethod === 'bank' ? form.account_number : '',
      total: total,
      items: cart.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    try {
      const res = await orderService.create(payload);
      localStorage.removeItem('cart');
      navigate(`/order-success/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto max-w-6xl px-4 py-12 md:px-6'>
      <div className='mb-8'>
        <p className='text-xs font-black uppercase tracking-[0.2em] text-gray-400'>Payment</p>
        <h1 className='mt-2 text-4xl font-black text-primary'>Checkout</h1>
      </div>

      <div className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr]'>
        <form onSubmit={handleSubmit} className='rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='grid gap-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <input
                required
                placeholder='Full name'
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className='w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary'
              />
              <input
                required
                type='email'
                placeholder='Email address'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className='w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary'
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <input
                required
                placeholder='Phone number'
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className='w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary'
              />
              <select
                value={form.shipping_option}
                onChange={(e) => setForm({ ...form, shipping_option: e.target.value })}
                className='w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary'>
                <option value=''>Select shipping / pickup</option>
                {shippingOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {currency(s.price)} {s.is_pickup ? '(Pickup)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              required
              placeholder='Delivery address or pickup notes'
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className='min-h-[120px] w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary'
            />

            <div className='rounded-2xl bg-gray-50 p-4'>
              <p className='mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500'>Payment method</p>
              <div className='grid gap-3 md:grid-cols-2'>
                <button
                  type='button'
                  onClick={() => setPaymentMethod('mono')}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${paymentMethod === 'mono' ? 'border-primary bg-primary text-white shadow-sm' : 'border-gray-200 bg-white text-primary'}`}>
                  <div className='text-sm font-black uppercase tracking-[0.2em]'>Mono</div>
                  <div className='mt-2 text-xs opacity-80'>Pay with your mobile wallet</div>
                </button>

                <button
                  type='button'
                  onClick={() => setPaymentMethod('bank')}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${paymentMethod === 'bank' ? 'border-primary bg-primary text-white shadow-sm' : 'border-gray-200 bg-white text-primary'}`}>
                  <div className='text-sm font-black uppercase tracking-[0.2em]'>Bank transfer</div>
                  <div className='mt-2 text-xs opacity-80'>Use direct bank payment</div>
                </button>
              </div>
            </div>

            {paymentMethod === 'mono' && (
              <div className='rounded-2xl border border-gray-200 bg-white p-4'>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>Mono number</label>
                <input
                  required
                  placeholder='e.g. 024 123 4567'
                  value={form.mono_number}
                  onChange={(e) => setForm({ ...form, mono_number: e.target.value })}
                  className='w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary'
                />
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className='grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-2'>
                <div className='md:col-span-2'>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Bank name</label>
                  <input
                    required
                    placeholder='e.g. Access Bank'
                    value={form.bank_name}
                    onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                    className='w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Account name</label>
                  <input
                    required
                    placeholder='Your full name'
                    value={form.account_name}
                    onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                    className='w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Account number</label>
                  <input
                    required
                    placeholder='Account number'
                    value={form.account_number}
                    onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                    className='w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-primary'
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type='submit'
            disabled={loading || cart.length === 0}
            className='mt-6 w-full rounded-full bg-secondary px-6 py-4 text-base font-black text-primary transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60'>
            {loading ? 'Processing order...' : `Pay ${currency(total)}`}
          </button>
        </form>

        <aside className='rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm'>
          <h2 className='text-xl font-black text-primary'>Order summary</h2>

          <div className='mt-5 space-y-3'>
            {cart.map((item, idx) => (
              <div key={idx} className='flex items-center justify-between gap-3 rounded-2xl bg-gray-50 p-3'>
                <div>
                  <div className='font-bold text-primary'>{item.title}</div>
                  <div className='text-xs text-gray-500'>Qty: {item.quantity}</div>
                </div>
                <div className='font-bold text-primary'>
                  {currency(Number(item.price || 0) * Number(item.quantity || 1))}
                </div>
              </div>
            ))}
          </div>

          <div className='mt-6 space-y-3 text-sm text-gray-600'>
            <div className='flex items-center justify-between'>
              <span>Subtotal</span>
              <span className='font-bold text-primary'>{currency(subtotal)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span>Shipping</span>
              <span className='font-bold text-primary'>{currency(Number(shippingFee || 0))}</span>
            </div>
            <div className='border-t border-gray-200 pt-3'>
              <div className='flex items-center justify-between'>
                <span className='text-base font-black text-primary'>Total</span>
                <span className='text-2xl font-black text-primary'>{currency(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
