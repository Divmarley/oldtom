/** @format */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogService } from '../services/api';
import {
  Calendar,
  User,
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Heart,
  MessageCircle,
  Send,
  CornerDownRight,
} from 'lucide-react';

const CommentItem = ({ comment, onReply, isLoggedIn }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    onReply(comment.id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
  };

  return (
    <div className='mb-6'>
      <div className='flex gap-4'>
        <div className='h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0'>
          <User className='h-5 w-5 text-gray-400' />
        </div>
        <div className='flex-1'>
          <div className='bg-gray-50 p-4 rounded-2xl'>
            <div className='flex justify-between items-center mb-1'>
              <span className='font-black text-primary text-sm uppercase tracking-tight'>
                {comment.author_details?.username || 'Anonymous'}
              </span>
              <span className='text-[10px] text-gray-400 font-bold'>
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className='text-gray-700 text-sm leading-relaxed'>{comment.content}</p>
          </div>
          <div className='flex gap-4 mt-2 ml-2'>
            {isLoggedIn && (
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)}
                className='text-[10px] font-black text-secondary uppercase tracking-widest hover:underline'
              >
                Reply
              </button>
            )}
          </div>

          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className='mt-4 flex gap-2'>
              <input 
                type='text' 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder='Write a reply...'
                className='flex-1 bg-white border border-gray-100 rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-secondary outline-none'
                autoFocus
              />
              <button type='submit' className='bg-secondary text-primary p-2 rounded-full hover:bg-yellow-400 transition-colors'>
                <Send className='h-3 w-3' />
              </button>
            </form>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className='mt-4 ml-6 space-y-4 border-l-2 border-gray-50 pl-6'>
              {comment.replies.map((reply) => (
                <div key={reply.id} className='flex gap-3'>
                   <CornerDownRight className='h-4 w-4 text-gray-200 mt-1' />
                   <div className='flex-1'>
                      <div className='bg-gray-50/50 p-3 rounded-xl'>
                        <div className='flex justify-between items-center mb-1'>
                          <span className='font-black text-primary text-[10px] uppercase tracking-tight'>
                            {reply.author_details?.username}
                          </span>
                        </div>
                        <p className='text-gray-600 text-xs'>{reply.content}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    fetchPostAndComments();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchPostAndComments = async () => {
    try {
      const [postRes, commentRes] = await Promise.all([
        blogService.getBySlug(slug),
        blogService.getComments(slug)
      ]);
      setPost(postRes.data);
      setComments(commentRes.data);

      const userId = localStorage.getItem('user_id');
      if (userId && postRes.data.author === parseInt(userId)) {
        setIsAuthor(true);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Post not found or an error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsLiking(true);
    try {
      const response = await blogService.likePost(slug);
      setPost({
        ...post,
        is_liked: response.data.status === 'liked',
        likes_count: response.data.likes_count
      });
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await blogService.addComment({
        post: post.id,
        content: newComment
      });
      setNewComment('');
      // Refresh comments
      const commentRes = await blogService.getComments(slug);
      setComments(commentRes.data);
      setPost({...post, comments_count: post.comments_count + 1});
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      await blogService.addComment({
        post: post.id,
        content: content,
        parent: parentId
      });
      // Refresh comments
      const commentRes = await blogService.getComments(slug);
      setComments(commentRes.data);
      setPost({...post, comments_count: post.comments_count + 1});
    } catch (err) {
      console.error('Error adding reply:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await blogService.delete(slug);
        navigate('/blog');
      } catch (err) {
        alert('Failed to delete the post.');
      }
    }
  };

  if (loading)
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary'></div>
      </div>
    );

  if (error)
    return (
      <div className='text-center py-40'>
        <h2 className='text-2xl font-black text-primary mb-4'>{error}</h2>
        <Link to='/blog' className='text-secondary font-bold hover:underline'>
          Return to Blog
        </Link>
      </div>
    );

  if (!post) return null;

  return (
    <div className='bg-white min-h-screen'>
      {/* Article Hero */}
      <header className='relative h-[60vh] min-h-[400px] w-full overflow-hidden'>
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full bg-primary flex items-center justify-center'>
            <span className='text-white/20 text-9xl font-black uppercase tracking-tighter select-none'>
              Old Toms
            </span>
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'></div>

        <div className='absolute bottom-0 left-0 w-full p-4 md:p-12'>
          <div className='max-w-4xl mx-auto'>
            <Link
              to='/blog'
              className='inline-flex items-center text-white/80 hover:text-secondary mb-6 transition-colors font-bold uppercase tracking-widest text-xs'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Magazine
            </Link>
            <h1 className='text-4xl md:text-6xl font-black text-white leading-tight mb-6 uppercase tracking-tighter'>
              {post.title}
            </h1>
            <div className='flex flex-wrap items-center gap-6 text-white/90'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-10 bg-secondary rounded-full flex items-center justify-center'>
                  <User className='h-5 w-5 text-primary' />
                </div>
                <span className='font-black uppercase tracking-widest text-xs'>
                  {post.author_details?.username || 'Old Tom Admin'}
                </span>
              </div>
              <div className='flex items-center gap-2 font-bold text-xs uppercase tracking-widest opacity-80'>
                <Calendar className='h-4 w-4 text-secondary' />
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className='max-w-4xl mx-auto px-4 py-20'>
        <div className='flex flex-col lg:flex-row gap-12 relative'>
          {/* Social Sidebar (Desktop) */}
          <aside className='hidden lg:flex flex-col items-center w-16 sticky top-32 h-fit space-y-6'>
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center transition-all shadow-sm ${post.is_liked ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-200'}`}
            >
              <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
              <span className='text-[8px] font-black mt-0.5'>{post.likes_count}</span>
            </button>
            <button className='w-12 h-12 rounded-full border border-gray-100 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm'>
              <MessageCircle className='h-5 w-5' />
              <span className='text-[8px] font-black mt-0.5'>{post.comments_count}</span>
            </button>
            <button className='w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm'>
              <Share2 className='h-5 w-5' />
            </button>
            
            {isAuthor && (
              <div className='pt-6 border-t border-gray-50 flex flex-col gap-4'>
                <Link
                  to={`/blog/edit/${post.slug}`}
                  className='w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm'>
                  <Edit className='h-5 w-5' />
                </Link>
                <button
                  onClick={handleDelete}
                  className='w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm'>
                  <Trash2 className='h-5 w-5' />
                </button>
              </div>
            )}
          </aside>

          <div className='flex-1'>
            {/* Lead Text (First paragraph) */}
            <div className='text-xl md:text-2xl text-gray-600 font-medium leading-relaxed mb-12 border-l-4 border-secondary pl-8 py-2 italic'>
              {post.content.split('\n')[0]}
            </div>

            {/* Rest of Content */}
            <div className='prose prose-xl prose-primary max-w-none text-gray-800 leading-loose space-y-8'>
              {post.content
                .split('\n')
                .slice(1)
                .map(
                  (paragraph, index) =>
                    paragraph.trim() && <p key={index}>{paragraph}</p>,
                )}
            </div>

            {/* Comments Section */}
            <section className='mt-20 pt-12 border-t border-gray-100'>
               <h3 className='text-2xl font-black text-primary uppercase tracking-tighter mb-10 flex items-center gap-3'>
                 Discussion <span className='bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full'>{post.comments_count}</span>
               </h3>

               {isLoggedIn ? (
                 <form onSubmit={handleCommentSubmit} className='mb-12'>
                   <div className='flex gap-4'>
                     <div className='h-12 w-12 bg-secondary rounded-full flex items-center justify-center shrink-0'>
                        <User className='h-6 w-6 text-primary' />
                     </div>
                     <div className='flex-1 relative'>
                        <textarea 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder='Share your thoughts...'
                          className='w-full bg-gray-50 border-none rounded-3xl px-6 py-4 focus:ring-2 focus:ring-secondary outline-none transition-all resize-none min-h-[100px]'
                        />
                        <button type='submit' className='absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full hover:bg-blue-900 transition-colors shadow-lg'>
                          <Send className='h-5 w-5' />
                        </button>
                     </div>
                   </div>
                 </form>
               ) : (
                 <div className='bg-gray-50 rounded-3xl p-8 text-center mb-12'>
                   <p className='text-gray-500 font-bold mb-4'>Want to join the conversation?</p>
                   <Link to='/login' className='bg-primary text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs inline-block'>Login to Comment</Link>
                 </div>
               )}

               <div className='space-y-8'>
                 {comments.length > 0 ? (
                   comments.map((comment) => (
                     <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                      onReply={handleReply}
                      isLoggedIn={isLoggedIn}
                     />
                   ))
                 ) : (
                   <p className='text-center text-gray-400 font-bold py-10 italic'>No comments yet. Start the discussion!</p>
                 )}
               </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <section className='bg-gray-50 py-20 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-black text-primary uppercase tracking-tighter mb-4'>
            Enjoyed this story?
          </h2>
          <p className='text-gray-600 text-lg mb-8'>
            Share it with your fellow Old Toms and stay tuned for more.
          </p>
          <div className='flex justify-center gap-4'>
            <Link
              to='/blog'
              className='bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-secondary transition-all'>
              More Stories
            </Link>
            <Link
              to='/join'
              className='border-2 border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-all'>
              Join Network
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;
