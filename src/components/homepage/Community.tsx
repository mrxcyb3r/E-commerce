import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, Bookmark, ChevronRight, Sparkles, User, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';

interface CommunityPost {
  id: string;
  imageUrl: string;
  userName: string;
  userAvatar: string;
  location?: string;
  likes: number;
  comments: number;
  caption: string;
  productId?: string;
  taggedProducts?: string[];
  createdAt: string;
}

const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    userName: 'alex.style',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    location: 'Tashkent, Uzbekistan',
    likes: 1247,
    comments: 89,
    caption: 'Living in the new minimal collection. The quality is unmatched 🤍 #minimalstyle #newseason',
    productId: '1',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    userName: 'streetwear_daily',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: 'Samarkand',
    likes: 2156,
    comments: 156,
    caption: 'Street fit for the weekend. Oversized hoodie + cargo pants = perfect combo 🔥',
    productId: '2',
    createdAt: '2025-01-14T14:22:00Z',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5c6c6bd72c6?auto=format&fit=crop&w=800&q=80',
    userName: 'sport_lifestyle',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    location: 'Bukhara',
    likes: 892,
    comments: 45,
    caption: 'Morning run in the new sport collection. Breathable, lightweight, stylish 🏃‍♂️',
    productId: '3',
    createdAt: '2025-01-13T08:15:00Z',
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    userName: 'classic_gent',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    location: 'Khiva',
    likes: 1567,
    comments: 78,
    caption: 'Timeless pieces that never go out of style. Investing in quality over quantity.',
    productId: '4',
    createdAt: '2025-01-12T16:45:00Z',
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
    userName: 'premium_living',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    location: 'Tashkent, Uzbekistan',
    likes: 3421,
    comments: 234,
    caption: 'Luxury is in the details. Premium collection delivering on every promise ✨',
    productId: '5',
    createdAt: '2025-01-11T11:20:00Z',
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
    userName: 'style_curator',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    location: 'Andijan',
    likes: 978,
    comments: 67,
    caption: 'Mixing minimal with street. The versatility of these pieces is incredible.',
    productId: '1',
    createdAt: '2025-01-10T09:00:00Z',
  },
];

export const Community: React.FC = () => {
  const { publishedProducts } = useStore();

  return (
    <section
      id="community"
      className="section-padding bg-background relative overflow-hidden"
      aria-labelledby="community-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_100%,_amber-500/5_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_60%_60%_at_20%_100%,_amber-500/3_0%,_transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Community</span>
            </div>
            <h2
              id="community-heading"
              className="font-display font-black tracking-tightest text-zinc-950 dark:text-white"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                lineHeight: '1.02',
                letterSpacing: '-0.03em',
              }}
            >
              Real Style,
              <br />
              <span className="text-amber-500">Real People</span>
            </h2>
          </div>

          <Link
            to="/feed"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-strong font-semibold text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all group self-end"
          >
            View All Posts
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {mockCommunityPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group relative bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800"
            >
              <Link
                to={`/feed/post/${post.id}`}
                className="block relative aspect-square overflow-hidden"
                aria-label={`View post by ${post.userName}`}
              >
                <img
                  src={post.imageUrl}
                  alt={`Post by ${post.userName}`}
                  className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />

                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20 transition-all" aria-label="Like">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20 transition-all" aria-label="Comment">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20 transition-all" aria-label="Save">
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20 transition-all" aria-label="Share">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {post.productId && (
                      <Link
                        to={`/products/${post.productId}`}
                        className="px-3 py-1.5 rounded-full bg-amber-500 text-zinc-950 font-semibold text-xs tracking-wider hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Shop This Look
                      </Link>
                    )}
                  </div>
                </div>
              </Link>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${post.userName}`}
                      className="font-semibold text-zinc-950 dark:text-white hover:text-amber-500 transition-colors truncate block"
                    >
                      @{post.userName}
                    </Link>
                    {post.location && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{post.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-2 text-sm">
                  {post.caption}
                </p>

                <div className="flex items-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {post.comments.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 ml-auto text-zinc-400 dark:text-zinc-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            to="/feed"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass-strong font-semibold text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all group"
          >
            Join the Community
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex -space-x-2">
              {['1', '2', '3', '4'].map((i) => (
                <img
                  key={i}
                  src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border-2 border-background dark:border-zinc-950"
                />
              ))}
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center border-2 border-background dark:border-zinc-950">
                <span className="text-zinc-950 font-black text-xs">+12K</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">12.4K members</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Community;