/** @format */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/api';

const currency = (value) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    productService
      .getById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null));
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((c) => c.product === product.id);
    if (existing) existing.quantity += qty;
    else
      cart.push({
        product: product.id,
        title: product.title,
        price: product.price,
        quantity: qty,
      });
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/cart');
  };

  if (!product) return <div className='p-8 text-center text-gray-500'>Loading product...</div>;

  return (
    <div className='mx-auto max-w-6xl px-4 py-12 md:px-6'>
      <div className='mb-6 flex items-center gap-3 text-sm text-gray-500'>
        <Link to='/store' className='font-semibold text-primary'>Store</Link>
        <span>/</span>
        <span className='text-gray-700'>{product.title}</span>
      </div>

      <div className='grid grid-cols-1 gap-10 overflow-hidden rounded-[32px] border border-gray-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:grid-cols-2 md:p-8'>
        <div className='overflow-hidden rounded-[28px] bg-gray-100'>
          <img
            src={product.image || '/placeholder.png'}
            alt={product.title}
            className='h-full min-h-[420px] w-full object-cover'
          />
        </div>

        <div className='flex flex-col justify-center'>
          <div className='mb-4 inline-flex w-fit rounded-full bg-secondary/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary'>
            Limited edition
          </div>

          <h1 className='text-4xl font-black tracking-tight text-primary'>{product.title}</h1>

          <div className='mt-5 flex items-center gap-4'>
            <div className='text-3xl font-black text-primary'>{currency(product.price)}</div>
            <div className='rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700'>
              Ready to ship
            </div>
          </div>

          <p className='mt-5 text-base leading-7 text-gray-600'>{product.description}</p>

          <div className='mt-6 rounded-2xl bg-gray-50 p-4'>
            <label className='mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500'>Quantity</label>
            <input
              type='number'
              min='1'
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || 1)))}
              className='w-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-lg font-semibold text-primary outline-none ring-0 focus:border-primary'
            />
          </div>

          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <button
              onClick={addToCart}
              className='flex-1 rounded-full bg-secondary px-6 py-4 text-base font-black text-primary shadow-sm transition hover:bg-yellow-400'>
              Add to cart
            </button>
            <Link
              to='/store'
              className='flex-1 rounded-full border border-gray-200 px-6 py-4 text-center text-base font-bold text-gray-700 transition hover:border-primary hover:text-primary'>
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
