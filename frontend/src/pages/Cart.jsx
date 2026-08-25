/** @format */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const currency = (value) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateQty = (idx, qty) => {
    const next = [...cart];
    next[idx].quantity = Math.max(1, qty);
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const removeItem = (idx) => {
    const next = [...cart];
    next.splice(idx, 1);
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );
  const shipping = subtotal > 0 ? 25 : 0;
  const total = subtotal + shipping;

  return (
    <div className='mx-auto max-w-6xl px-4 py-12 md:px-6'>
      <div className='mb-8'>
        <p className='text-xs font-black uppercase tracking-[0.2em] text-gray-400'>Bag</p>
        <h1 className='mt-2 text-4xl font-black text-primary'>Your cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className='rounded-[28px] border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm'>
          <p className='text-lg font-semibold text-gray-700'>Your cart is empty.</p>
          <Link to='/store' className='mt-4 inline-block rounded-full bg-primary px-6 py-3 font-bold text-white'>
            Browse store
          </Link>
        </div>
      ) : (
        <div className='grid gap-8 lg:grid-cols-[1.5fr_0.9fr]'>
          <div className='space-y-5'>
            {cart.map((item, idx) => (
              <div
                key={idx}
                className='flex flex-col gap-4 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#0c4d8d] text-lg font-black text-white'>
                    {item.title?.slice(0, 1).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div className='text-lg font-bold text-primary'>{item.title}</div>
                    <div className='text-sm text-gray-500'>Unit price: {currency(item.price)}</div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <label className='text-sm font-semibold text-gray-500'>Qty</label>
                  <input
                    type='number'
                    min='1'
                    value={item.quantity}
                    onChange={(e) => updateQty(idx, parseInt(e.target.value || 1))}
                    className='w-20 rounded-xl border border-gray-200 px-3 py-2 text-center font-bold text-primary focus:border-primary'
                  />
                  <button
                    onClick={() => removeItem(idx)}
                    className='rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600'>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className='rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='text-xl font-black text-primary'>Order summary</h2>

            <div className='mt-6 space-y-4 text-sm text-gray-600'>
              <div className='flex items-center justify-between'>
                <span>Subtotal</span>
                <span className='font-bold text-primary'>{currency(subtotal)}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Shipping</span>
                <span className='font-bold text-primary'>{currency(shipping)}</span>
              </div>
              <div className='border-t border-gray-200 pt-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-base font-black text-primary'>Total</span>
                  <span className='text-2xl font-black text-primary'>{currency(total)}</span>
                </div>
              </div>
            </div>

            <Link
              to='/checkout'
              className='mt-6 block rounded-full bg-secondary px-6 py-4 text-center text-base font-black text-primary transition hover:bg-yellow-400'>
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
