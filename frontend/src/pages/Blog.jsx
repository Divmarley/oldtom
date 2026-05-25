/** @format */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../services/api';
import {
  Calendar,
  User,
  Plus,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await blogService.getAll();
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    fetchPosts();
  }, []);

  return (
    <div className='bg-gray-50 min-h-screen'>
      {/* Hero Section */}
      <section className='bg-primary text-white py-20 px-4'>
        <div className='max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10'>
          <div>
            <p className='uppercase tracking-[0.3em] text-secondary text-sm mb-4'>
              Alumni Stories
            </p>

            <h1 className='text-5xl md:text-6xl font-black leading-tight mb-6'>
              Old Toms Blog
            </h1>

            <p className='text-lg text-blue-100 max-w-2xl leading-relaxed'>
              Stories, memories, achievements, and updates from the
              Class of 2016 community.
            </p>
          </div>

          {isLoggedIn && (
            <Link
              to='/blog/create'
              className='bg-secondary text-primary px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-yellow-300 transition-all duration-300 shadow-xl hover:scale-105'
            >
              <Plus className='h-5 w-5' />
              Create Post
            </Link>
          )}
        </div>
      </section>

      {/* Content */}
      <section className='py-16 px-4'>
        <div className='max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-10'>
          
          {/* Blog Posts */}
          <div className='xl:col-span-3'>
            {loading ? (
              <div className='bg-white rounded-3xl p-20 text-center shadow-sm'>
                <p className='text-lg text-gray-500'>Loading posts...</p>
              </div>
            ) : posts.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className='group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300'
                  >
                    {/* Image */}
                    <div className='relative overflow-hidden h-64'>
                      <img
                        src={
                          post.image ||
                          'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop'
                        }
                        alt={post.title}
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                      />

                      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent'></div>

                      <div className='absolute bottom-5 left-5 flex items-center gap-4 text-white text-sm'>
                        <span className='flex items-center gap-1'>
                          <Calendar className='h-4 w-4' />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>

                        <span className='flex items-center gap-1'>
                          <User className='h-4 w-4' />
                          {post.author_details?.username || 'Admin'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className='p-7 flex flex-col '>
                      <h2 className='text-2xl font-bold text-primary mb-4 line-clamp-2 group-hover:text-secondary transition-colors'>
                        <Link to={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>

                      <p className='text-gray-600 leading-relaxed line-clamp-4 mb-6'>
                        {post.content}
                      </p>

                      <div className='mt-auto'>
                        <Link
                          to={`/blog/${post.slug}`}
                          className='inline-flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors'
                        >
                          Read More
                          <ArrowRight className='h-4 w-4' />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className='bg-white rounded-3xl p-20 text-center border border-dashed border-gray-300'>
                <MessageSquare className='h-16 w-16 text-gray-300 mx-auto mb-4' />

                <h3 className='text-3xl font-bold text-gray-400 mb-3'>
                  No Posts Yet
                </h3>

                <p className='text-gray-500'>
                  Stories and updates from the community will appear here.
                </p>

                {isLoggedIn && (
                  <Link
                    to='/blog/create'
                    className='inline-block mt-8 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors'
                  >
                    Write First Post
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className='xl:col-span-1 space-y-8'>
            
            {/* Community Card */}
            <div className='bg-primary text-white rounded-3xl p-8 relative overflow-hidden shadow-xl'>
              <div className='absolute top-0 right-0 w-40 h-40 bg-secondary/10 rounded-full -mr-20 -mt-20'></div>

              <div className='relative z-10'>
                <h3 className='text-2xl font-bold mb-4'>
                  Join the Community
                </h3>

                <p className='text-blue-100 leading-relaxed mb-6'>
                  Connect with classmates, share memories, and stay updated
                  with alumni activities around the world.
                </p>

                <Link
                  to='/join'
                  className='block w-full text-center bg-secondary text-primary py-3 rounded-2xl font-bold hover:bg-yellow-300 transition-colors'
                >
                  Register Now
                </Link>
              </div>
            </div>

            {/* Facebook Feed */}
            <div className='bg-white rounded-3xl p-6 border border-gray-100 shadow-sm'>
              <h3 className='text-2xl font-bold text-primary mb-6'>
                Facebook Feed
              </h3>

              <div className='overflow-hidden rounded-2xl border border-gray-100'>
                <iframe
                  src='https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId'
                  width='100%'
                  height='500'
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling='no'
                  frameBorder='0'
                  allowFullScreen={true}
                  allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'
                  title='Facebook Feed'
                ></iframe>
              </div>

              <p className='text-sm text-gray-400 text-center mt-4'>
                Stay connected through Facebook updates.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Blog;