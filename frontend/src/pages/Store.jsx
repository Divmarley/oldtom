/** @format */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import useCurrentUser from '../hooks/useCurrentUser';
import { Plus, X, Upload, ShoppingBag, Sparkles } from 'lucide-react';

const initialForm = {
  title: '',
  description: '',
  price: '',
  stock: 0,
};

const currency = (value) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
}).format(Number(value || 0));

const Store = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isAdmin } = useCurrentUser();
  const [formData, setFormData] = useState(initialForm);
  const [image, setImage] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productService.getAll();
      setProducts(res.data);
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };

    void loadProducts();
  }, [fetchProducts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setShowModal(false);
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    if (image) data.append('image', image);

    try {
      await productService.create(data);
      setShowModal(false);
      setFormData(initialForm);
      setImage(null);
      await fetchProducts();
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-16'>
      <div className='rounded-[32px] bg-gradient-to-r from-primary via-[#0f4a7e] to-[#042d52] p-8 md:p-10 text-white shadow-2xl mb-10'>
        <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
          <div>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300'>
              <Sparkles className='h-3.5 w-3.5' /> Alumni Store
            </div>
            <h1 className='mt-4 text-4xl font-black tracking-tight md:text-5xl'>Shop the Oldtom Collection</h1>
            <p className='mt-3 max-w-2xl text-sm text-blue-100 md:text-base'>
              Discover premium alumni essentials, keepsakes, and branded items made for the community.
            </p>
          </div>

          <div className='flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm'>
            <ShoppingBag className='h-5 w-5 text-secondary' />
            <span className='text-sm font-semibold'>Fast checkout • Secure payment</span>
          </div>
        </div>
      </div>

      <div className='mb-8 flex items-center justify-between gap-4'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.2em] text-gray-400'>Featured Items</p>
          <h2 className='mt-2 text-2xl font-black text-primary'>Our latest drops</h2>
        </div>

        {isAdmin && (
          <button
            type='button'
            onClick={() => setShowModal(true)}
            className='inline-flex items-center gap-2 bg-secondary text-primary font-bold px-5 py-3 rounded-xl shadow-sm hover:bg-yellow-400 transition'>
            <Plus className='h-4 w-4' /> Add Product
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
        {products.map((p) => (
          <div
            key={p.id}
            className='group overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_15px_40px_rgba(3,7,18,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(3,7,18,0.12)]'>
            <div className='relative overflow-hidden bg-gray-100'>
              <img
                src={p.image || '/placeholder.png'}
                alt={p.title}
                className='h-64 w-full object-cover transition duration-500 group-hover:scale-105'
              />
              <div className='absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm'>
                Best Seller
              </div>
            </div>

            <div className='p-5'>
              <div className='mb-3 flex items-center justify-between gap-3'>
                <h3 className='text-xl font-black text-primary'>{p.title}</h3>
                <span className='rounded-full bg-secondary/20 px-2.5 py-1 text-xs font-bold text-primary'>
                  In stock
                </span>
              </div>

              <p className='mb-5 text-sm leading-6 text-gray-600'>
                {p.description?.slice(0, 110) || 'Handcrafted for alumni pride and everyday style.'}
              </p>

              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Price</p>
                  <div className='mt-1 text-2xl font-black text-primary'>{currency(p.price)}</div>
                </div>

                <Link
                  to={`/store/${p.id}`}
                  className='rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-[#002f5c]'>
                  View item
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdmin && showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4'>
          <div className='bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between bg-primary text-white px-6 py-4'>
              <h2 className='text-xl font-bold'>Add Store Product</h2>
              <button
                type='button'
                onClick={() => setShowModal(false)}
                className='p-2 rounded-full hover:bg-white/10'>
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Title
                </label>
                <input
                  required
                  type='text'
                  name='title'
                  value={formData.title}
                  onChange={handleChange}
                  className='w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  required
                  name='description'
                  rows='4'
                  value={formData.description}
                  onChange={handleChange}
                  className='w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Price
                  </label>
                  <input
                    required
                    type='number'
                    name='price'
                    min='0'
                    step='0.01'
                    value={formData.price}
                    onChange={handleChange}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Stock
                  </label>
                  <input
                    type='number'
                    name='stock'
                    min='0'
                    value={formData.stock}
                    onChange={handleChange}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Product image
                </label>
                <label className='flex cursor-pointer items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl py-5 text-gray-600 hover:bg-gray-50'>
                  <Upload className='h-5 w-5' />
                  <span>{image ? image.name : 'Upload image'}</span>
                  <input
                    type='file'
                    onChange={handleImageChange}
                    className='hidden'
                  />
                </label>
              </div>

              <div className='flex justify-end gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-5 py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold'>
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-5 py-3 rounded-lg bg-primary text-white font-semibold disabled:opacity-60'>
                  {submitting ? 'Saving...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
