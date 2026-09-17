/** @format */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { blogService } from '../services/api';
import useCurrentUser from '../hooks/useCurrentUser';
import { Save, Upload } from 'lucide-react';

const BlogForm = ({ isEdit = false }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { authLoading, isAuthenticated, isAdmin } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: true,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (isEdit && slug) {
      const fetchPost = async () => {
        try {
          const response = await blogService.getBySlug(slug);
          const { title, content, is_published, image } = response.data;
          setFormData({ title, content, is_published });
          if (image) setPreview(image);
        } catch (err) {
          console.error('Error fetching post for edit:', err);
        } finally {
          setFetching(false);
        }
      };
      fetchPost();
    }
  }, [isEdit, slug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('is_published', isAdmin ? formData.is_published : false);
    if (image) data.append('image', image);

    try {
      if (isEdit) {
        await blogService.update(slug, data);
      } else {
        await blogService.create(data);
      }
      navigate('/blog');
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetching) {
    return <div className='text-center py-20'>Loading...</div>;
  }

  if (!isAuthenticated) {
    const requestedPath = isEdit && slug ? `/blog/edit/${slug}` : '/blog/create';

    return (
      <div className='min-h-[60vh] px-4 py-20 text-center'>
        <h1 className='text-3xl font-black text-primary'>Sign in required</h1>
        <p className='mx-auto mt-3 max-w-lg text-gray-600'>
          You need an authenticated account with permission to write a blog post.
        </p>
        <Link
          to={`/login?next=${encodeURIComponent(requestedPath)}`}
          className='mt-8 inline-flex rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-blue-900'>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 min-h-screen py-16 px-4'>
      <div className='max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100'>
        <div className='bg-primary text-white py-8 px-10'>
          <h1 className='text-3xl font-bold'>{isEdit ? 'Edit Blog Post' : 'Create New Post'}</h1>
          <p className='text-blue-100 mt-2'>Share your story with the Old Toms community.</p>
        </div>

        <form onSubmit={handleSubmit} className='p-10 space-y-8'>
          <div>
            <label className='block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider'>Title</label>
            <input
              required
              type='text'
              name='title'
              value={formData.title}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-lg'
              placeholder='Enter a catchy title...'
            />
          </div>

          <div>
            <label className='block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider'>Feature Image</label>
            <div className='flex items-center gap-6'>
              {preview && (
                <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow-md" />
              )}
              <label className='flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 px-4 cursor-pointer hover:bg-gray-50 transition-colors'>
                <Upload className='h-8 w-8 text-gray-400 mb-2' />
                <span className='text-gray-600 font-medium'>Click to upload image</span>
                <input type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
              </label>
            </div>
          </div>

          <div>
            <label className='block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider'>Content</label>
            <textarea
              required
              name='content'
              rows='12'
              value={formData.content}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all leading-relaxed'
              placeholder='Write your post content here...'
            ></textarea>
          </div>

          {isAdmin ? (
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='is_published'
                name='is_published'
                checked={formData.is_published}
                onChange={handleChange}
                className='h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary'
              />
              <label htmlFor='is_published' className='ml-3 text-gray-700 font-medium'>
                Publish immediately
              </label>
            </div>
          ) : (
            <p className='rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-primary'>
              Your post will be submitted to an administrator for review.
            </p>
          )}

          <div className='flex gap-4 pt-4'>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50'
            >
              <Save className='h-5 w-5' />
              {loading
                ? 'Saving...'
                : isEdit
                  ? 'Update Post'
                  : isAdmin
                    ? 'Create Post'
                    : 'Submit for Review'}
            </button>
            <button
              type='button'
              onClick={() => navigate('/blog')}
              className='px-8 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
