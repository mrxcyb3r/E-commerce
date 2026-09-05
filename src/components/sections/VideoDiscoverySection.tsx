import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, ArrowRight, Video as VideoIcon } from 'lucide-react';
import { useVideoFeed } from '../../context/VideoContext';
import { motion } from 'motion/react';

export const VideoDiscoverySection: React.FC = () => {
  const { publishedVideos, getProductForVideo } = useVideoFeed();

  // If no published videos, hide gracefully
  if (publishedVideos.length === 0) {
    return null;
  }

  // Display top 4 videos
  const displayVideos = publishedVideos.slice(0, 4);

  return (
    <section id="video-discovery" className="py-16 md:py-24 bg-zinc-950 text-white transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-zinc-950">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mahsulot videolari</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight">
              Mahsulotni videoda ham ko'ring
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
              Mahsulotning ko'rinishi, materiali va qanday turishini qisqa videolarda ko'rib chiqing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-black border border-white/15 transition-all active:scale-95 group shadow-sm"
            >
              <VideoIcon className="w-4 h-4 text-amber-400" />
              <span>Barcha videolar ({publishedVideos.length})</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Video Cards Grid (4-column vertical card display) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayVideos.map((video, index) => {
            const product = getProductForVideo(video.productId);

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/feed?v=${video.id}`}
                  className="group relative flex flex-col rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-xl hover:border-zinc-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block"
                >
                  {/* Vertical 9:14 Poster Image Container */}
                  <div className="relative w-full aspect-[9/14] bg-zinc-950 overflow-hidden">
                    <img
                      src={video.posterUrl}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      {video.badge ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${
                          video.badge.type === 'new'
                            ? 'bg-amber-500 text-zinc-950'
                            : video.badge.type === 'sale'
                            ? 'bg-rose-500 text-white'
                            : video.badge.type === 'store'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-zinc-950'
                        }`}>
                          {video.badge.text}
                        </span>
                      ) : <div />}

                      {video.duration && (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white/90">
                          {video.duration}
                        </span>
                      )}
                    </div>

                    {/* Center Play Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-zinc-950 group-hover:border-transparent shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom Info Overlay inside card */}
                    <div className="absolute bottom-3 left-3 right-3 space-y-2">
                      <h3 className="text-sm font-black text-white font-['Outfit',sans-serif] line-clamp-2 drop-shadow-md">
                        {video.title}
                      </h3>

                      {product && (
                        <div className="p-2.5 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-white/10 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-zinc-200 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs font-black text-amber-400">
                              {new Intl.NumberFormat('uz-UZ').format(product.price)} so'm
                            </p>
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-wider bg-white/10 px-2 py-1 rounded-lg shrink-0 group-hover:bg-white group-hover:text-zinc-950 transition-colors">
                            Ko'rish
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Full Discovery CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/feed"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white text-zinc-950 text-xs font-black uppercase tracking-wider shadow-lg"
          >
            <span>Barcha videolarni ko'rish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
