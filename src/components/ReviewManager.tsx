import React, { useState } from 'react';
import { 
  Star, 
  Search, 
  MessageSquare, 
  Flag, 
  ThumbsUp, 
  EyeOff, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  User,
  CornerDownRight,
  ShieldCheck,
  Send,
  MoreVertical,
  X,
  Filter
} from 'lucide-react';

export interface ProductReview {
  id: string;
  productName: string;
  buyerName: string;
  buyerAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  helpfulVotes: number;
  abuseReported: boolean;
  abuseReason?: string;
  isHidden: boolean;
  replyText?: string;
}

export default function ReviewManager() {
  const [reviews, setReviews] = useState<ProductReview[]>([
    {
      id: 'REV-001',
      productName: 'Nexus Premium Tailwind UI System',
      buyerName: 'Sarah Jenkins',
      buyerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80',
      rating: 5,
      comment: 'Absolutely superb code construction! The auto layout structures inside this component collection saved our engineering department over 40 hours of tedious CSS boilerplate writing.',
      date: '2026-06-27T15:20:00Z',
      helpfulVotes: 18,
      abuseReported: false,
      isHidden: false,
      replyText: 'Thank you Sarah! Very glad it optimized your team\'s pipeline.'
    },
    {
      id: 'REV-002',
      productName: 'OmniAudio Cinematic Synth FX',
      buyerName: 'Alexei Volkov',
      buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80',
      rating: 5,
      comment: 'The analog warmth of these synthesizer audio loops is unmatched. Incredible resolution quality! Zero clipping issues even when heavily amplified.',
      date: '2026-06-26T19:30:00Z',
      helpfulVotes: 12,
      abuseReported: false,
      isHidden: false
    },
    {
      id: 'REV-003',
      productName: 'Sovereign 3D Vector Pack',
      buyerName: 'Li Wei',
      rating: 2,
      comment: 'Hard to use in older versions of Blender. The meshes contain too many triangles and cause rendering latency on my lightweight notebook.',
      date: '2026-06-25T11:42:00Z',
      helpfulVotes: 4,
      abuseReported: false,
      isHidden: false
    },
    {
      id: 'REV-004',
      productName: 'Nexus Premium Tailwind UI System',
      buyerName: 'Spam Bot Crawler',
      rating: 1,
      comment: 'CLICK HERE TO WIN FREE CRYPTO IMMEDIATELY!!! NO VERIFICATION NEEDED REAL COINS !!!',
      date: '2026-06-24T08:12:00Z',
      helpfulVotes: 0,
      abuseReported: true,
      abuseReason: 'Spam / Promo Links',
      isHidden: true
    },
    {
      id: 'REV-005',
      productName: 'Minimalist Neumorphic Dashboard UI',
      buyerName: 'Jean-Pierre',
      buyerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80',
      rating: 4,
      comment: 'Excellent aesthetics and theme alignment. A bit complex to strip the state managers if you want to use it as static HTML, but otherwise incredible work.',
      date: '2026-06-20T10:05:00Z',
      helpfulVotes: 9,
      abuseReported: false,
      isHidden: false,
      replyText: 'Hi JP! We are compiling static standalone versions as we speak. Stay tuned for v1.2!'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'live' | 'hidden' | 'reported'>('all');
  const [replyInput, setReplyInput] = useState('');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  // Toggle review visibility (Hide/Show)
  const handleToggleHide = (id: string) => {
    setReviews(reviews.map(r => {
      if (r.id === id) {
        return { ...r, isHidden: !r.isHidden };
      }
      return r;
    }));
  };

  // Upvote helpful review count
  const handleUpvoteHelpful = (id: string) => {
    setReviews(reviews.map(r => {
      if (r.id === id) {
        return { ...r, helpfulVotes: r.helpfulVotes + 1 };
      }
      return r;
    }));
  };

  // Report Abuse trigger
  const handleReportAbuse = (id: string) => {
    const reason = prompt('Specify reasons for flagged abuse reporting:');
    if (reason === null) return; // user cancelled
    setReviews(reviews.map(r => {
      if (r.id === id) {
        return { 
          ...r, 
          abuseReported: true, 
          abuseReason: reason || 'Merchant manually flagged review for administrative audit.',
          isHidden: true // auto hide when reported
        };
      }
      return r;
    }));
  };

  // Clear Abuse report flag
  const handleClearAbuse = (id: string) => {
    setReviews(reviews.map(r => {
      if (r.id === id) {
        return { 
          ...r, 
          abuseReported: false, 
          abuseReason: undefined 
        };
      }
      return r;
    }));
  };

  // Submit merchant reply
  const handleSendReply = (id: string) => {
    if (!replyInput.trim()) return;
    setReviews(reviews.map(r => {
      if (r.id === id) {
        return { ...r, replyText: replyInput };
      }
      return r;
    }));
    setReplyInput('');
    setActiveReviewId(null);
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      r.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = filterRating === 'all' || r.rating.toString() === filterRating;

    let matchesVis = true;
    if (filterVisibility === 'hidden') matchesVis = r.isHidden;
    else if (filterVisibility === 'live') matchesVis = !r.isHidden;
    else if (filterVisibility === 'reported') matchesVis = r.abuseReported;

    return matchesSearch && matchesRating && matchesVis;
  });

  return (
    <div id="reputation-reviews-manager" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-2">
            <Star className="h-4 w-4 fill-[#D4FF5E] text-[#D4FF5E]" />
            <span>Reputation & Customer Reviews Escrow</span>
          </h2>
          <p className="text-[10px] text-[#8E9299] font-medium mt-1">
            Moderate community reviews, append official merchant responses, resolve flagged abuse reports, and regulate rating metrics.
          </p>
        </div>
      </div>

      {/* Filter and Moderation Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#161618] border border-white/10 p-5 rounded-2xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8E9299]" />
          <input
            type="text"
            placeholder="Filter product, buyer, comment text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/5 bg-[#0A0A0B] pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4FF5E]"
          />
        </div>

        {/* Rating filter */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase text-[#8E9299] tracking-widest shrink-0">Rating:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value as any)}
            className="w-full rounded-xl border border-white/5 bg-[#0A0A0B] px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">All Star Counts</option>
            <option value="5">⭐⭐⭐⭐⭐ Only (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ Only (4 Stars)</option>
            <option value="3">⭐⭐⭐ Only (3 Stars)</option>
            <option value="2">⭐⭐ Only (2 Stars)</option>
            <option value="1">⭐ Only (1 Star)</option>
          </select>
        </div>

        {/* Status visibility filter */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase text-[#8E9299] tracking-widest shrink-0">Visibility:</span>
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value as any)}
            className="w-full rounded-xl border border-white/5 bg-[#0A0A0B] px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">All Reviews Status</option>
            <option value="live">Visible / Live Content</option>
            <option value="hidden">Hidden Reviews</option>
            <option value="reported">Abuse Reports / Flagged</option>
          </select>
        </div>
      </div>

      {/* Reviews feed column list */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-[#161618] rounded-3xl p-16 text-center text-xs text-[#8E9299] uppercase tracking-widest font-black">
            No customer reviews fit the selected query parameters.
          </div>
        ) : (
          filteredReviews.map(r => (
            <div 
              key={r.id} 
              className={`bg-[#161618] border rounded-3xl p-5 md:p-6 transition-all space-y-4 ${
                r.isHidden 
                  ? 'border-rose-500/20 bg-rose-500/[0.01]' 
                  : r.abuseReported 
                  ? 'border-amber-500/20 bg-amber-500/[0.01]' 
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              
              {/* Product and Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  {r.buyerAvatar ? (
                    <img src={r.buyerAvatar} alt="" className="h-8 w-8 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white uppercase border border-white/15">
                      {r.buyerName[0]}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-[11px] uppercase tracking-wide">{r.buyerName}</span>
                      <span className="text-[8.5px] font-mono bg-white/5 text-[#8E9299] px-1 rounded">{r.id}</span>
                    </div>
                    <span className="text-[9px] text-[#8E9299] font-mono">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] font-black uppercase text-[#8E9299] tracking-widest bg-[#0A0A0B] border border-white/5 px-2 py-0.5 rounded font-mono">
                    {r.productName}
                  </span>
                  
                  {/* Rating display */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-3 w-3 ${
                          star <= r.rating 
                            ? 'fill-[#D4FF5E] text-[#D4FF5E]' 
                            : 'text-white/10'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Warnings and Flag Indicators */}
              {(r.isHidden || r.abuseReported) && (
                <div className="flex flex-wrap gap-2">
                  {r.isHidden && (
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
                      <EyeOff className="h-3 w-3" />
                      <span>Hidden From General Storefront</span>
                    </span>
                  )}
                  {r.abuseReported && (
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Abuse Flagged: {r.abuseReason}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Customer Comment Text */}
              <p className="text-xs text-[#E4E4E6] leading-relaxed italic bg-black/10 p-4 rounded-2xl border border-white/5">
                "{r.comment}"
              </p>

              {/* Creator Response Node */}
              {r.replyText && (
                <div className="ml-4 sm:ml-8 border-l-2 border-[#D4FF5E]/30 pl-4 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CornerDownRight className="h-3.5 w-3.5 text-[#D4FF5E]" />
                    <span className="text-[9px] font-black uppercase text-[#D4FF5E] tracking-widest">Merchant Official Reply</span>
                  </div>
                  <p className="text-xs text-[#8E9299] leading-relaxed bg-black/20 p-3.5 rounded-2xl border border-white/5">
                    {r.replyText}
                  </p>
                </div>
              )}

              {/* Reply Input Form */}
              {activeReviewId === r.id && (
                <div className="ml-4 sm:ml-8 space-y-3">
                  <label className="block text-[8.5px] font-black uppercase text-[#8E9299] tracking-widest">Draft Community Response</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type official seller explanation..."
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(r.id); }}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4FF5E]"
                    />
                    <button
                      onClick={() => handleSendReply(r.id)}
                      className="rounded-xl bg-[#D4FF5E] text-black px-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#c3ec4e]"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => setActiveReviewId(null)}
                      className="rounded-xl bg-white/5 border border-white/10 px-3 hover:bg-white/10 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Moderation Controls footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-white/5 text-xs text-[#8E9299]">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleUpvoteHelpful(r.id)}
                    className="flex items-center gap-1.5 hover:text-white font-bold text-[10.5px] tracking-wide"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>Helpful ({r.helpfulVotes})</span>
                  </button>

                  {!r.replyText && activeReviewId !== r.id && (
                    <button 
                      onClick={() => { setActiveReviewId(r.id); setReplyInput(''); }}
                      className="flex items-center gap-1.5 hover:text-white font-bold text-[10.5px] tracking-wide"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {r.abuseReported ? (
                    <button 
                      onClick={() => handleClearAbuse(r.id)}
                      className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      Clear Abuse
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleReportAbuse(r.id)}
                      className="text-[9px] font-black uppercase tracking-widest text-[#8E9299] hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/5 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      Flag Abuse
                    </button>
                  )}

                  <button 
                    onClick={() => handleToggleHide(r.id)}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                      r.isHidden 
                        ? 'border-[#D4FF5E]/20 text-[#D4FF5E] bg-[#D4FF5E]/5 hover:bg-[#D4FF5E]/15' 
                        : 'border-white/5 text-[#8E9299] hover:text-white bg-white/5'
                    }`}
                  >
                    {r.isHidden ? 'Make Visible' : 'Hide Review'}
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
