import React, { useState } from 'react';
import { 
  Megaphone, 
  Tag, 
  Percent, 
  Layers, 
  Zap, 
  Link2, 
  Sparkles, 
  Mail, 
  Plus, 
  X, 
  Check, 
  TrendingUp, 
  ChevronRight, 
  DollarSign, 
  Users, 
  Send
} from 'lucide-react';

export interface Coupon {
  code: string;
  discountPercentage: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}

export interface DiscountCampaign {
  id: string;
  name: string;
  productAffected: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired';
}

export interface Bundle {
  id: string;
  title: string;
  productsIncluded: string[];
  compositePrice: number;
  normalPrice: number;
  salesCount: number;
}

export interface FlashSale {
  id: string;
  productName: string;
  extremeDiscount: number; // e.g. 50%
  timeLeftSeconds: number; // Simulate live timer ticking down
  isActive: boolean;
}

export interface ReferralLink {
  id: string;
  code: string;
  targetProduct: string;
  affiliateCommissionPercentage: number;
  clicks: number;
  conversions: number;
}

export interface FeaturedRequest {
  id: string;
  productName: string;
  showcaseZone: 'carousel' | 'bento_hero' | 'category_leader';
  durationDays: number;
  flatCost: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function MarketingCenter() {
  const [activeTab, setActiveTab] = useState<'coupons' | 'campaigns' | 'bundles' | 'flash' | 'referrals' | 'featured' | 'emails'>('coupons');

  // Couples state
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'NEXUSFIRST20', discountPercentage: 20, maxUses: 100, usedCount: 42, expiryDate: '2026-07-30', isActive: true },
    { code: 'AURAFAST50', discountPercentage: 50, maxUses: 50, usedCount: 50, expiryDate: '2026-06-20', isActive: false },
    { code: 'SYNTHLOVE15', discountPercentage: 15, maxUses: 200, usedCount: 18, expiryDate: '2026-08-15', isActive: true }
  ]);

  const [newCode, setNewCode] = useState('');
  const [newPercentage, setNewPercentage] = useState<number>(10);
  const [newMaxUses, setNewMaxUses] = useState<number>(100);
  const [newExpiry, setNewExpiry] = useState('');

  // Campaigns state
  const [campaigns, setCampaigns] = useState<DiscountCampaign[]>([
    { id: 'CAMP-01', name: 'Summer Solstice Developer Rush', productAffected: 'Nexus Premium Tailwind UI System', discountPercentage: 30, startDate: '2026-06-20', endDate: '2026-07-05', status: 'active' },
    { id: 'CAMP-02', name: 'Autumn Creative Launch', productAffected: 'Sovereign 3D Vector Pack', discountPercentage: 15, startDate: '2026-09-01', endDate: '2026-09-10', status: 'scheduled' }
  ]);

  // Bundles state
  const [bundles, setBundles] = useState<Bundle[]>([
    { id: 'BNDL-01', title: 'Complete Aura Creators Toolkit', productsIncluded: ['Nexus Premium Tailwind UI System', 'Sovereign 3D Vector Pack', 'OmniAudio Cinematic Synth FX'], compositePrice: 79.00, normalPrice: 97.00, salesCount: 14 }
  ]);

  // Flash Sale simulation
  const [flashSale, setFlashSale] = useState<FlashSale>({
    id: 'FLASH-99',
    productName: 'Nexus Premium Tailwind UI System',
    extremeDiscount: 40,
    timeLeftSeconds: 3240, // 54 mins left
    isActive: true
  });

  // Referral links state
  const [referrals, setReferrals] = useState<ReferralLink[]>([
    { id: 'REF-001', code: 'DEV_GURU_SPLIT', targetProduct: 'Nexus Premium Tailwind UI System', affiliateCommissionPercentage: 20, clicks: 840, conversions: 12 },
    { id: 'REF-002', code: 'CYBER_AUD_MIX', targetProduct: 'OmniAudio Cinematic Synth FX', affiliateCommissionPercentage: 15, clicks: 420, conversions: 8 }
  ]);

  // Featured zone requests state
  const [featured, setFeatured] = useState<FeaturedRequest[]>([
    { id: 'FEAT-01', productName: 'Nexus Premium Tailwind UI System', showcaseZone: 'bento_hero', durationDays: 7, flatCost: 49.00, status: 'approved' },
    { id: 'FEAT-02', productName: 'OmniAudio Cinematic Synth FX', showcaseZone: 'carousel', durationDays: 3, flatCost: 19.00, status: 'pending' }
  ]);

  // Email Campaigns state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTarget, setEmailTarget] = useState<'followers' | 'buyers' | 'all'>('all');
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);

  // Add Coupon Action
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    const newC: Coupon = {
      code: newCode.toUpperCase().replace(/\s+/g, ''),
      discountPercentage: newPercentage,
      maxUses: newMaxUses,
      usedCount: 0,
      expiryDate: newExpiry || '2026-12-31',
      isActive: true
    };
    setCoupons([...coupons, newC]);
    setNewCode('');
    setNewPercentage(10);
    setNewMaxUses(100);
    setNewExpiry('');
  };

  const handleToggleCoupon = (code: string) => {
    setCoupons(coupons.map(c => {
      if (c.code === code) {
        return { ...c, isActive: !c.isActive };
      }
      return c;
    }));
  };

  const handleCreateBundle = () => {
    alert('Configuring dynamic multi-asset bundle. Products will automatically link with unified composite download packages!');
  };

  const handleCreateFlashSale = () => {
    alert('Dynamic time-locked flash sale initiated on the global storefront marketplace index!');
  };

  const handleRequestFeatured = () => {
    alert('Featured placement request sent to OMYRA curators. Charges of $49.00 will be deducted from your cleared balance upon escrow approval.');
  };

  const handleDispatchEmailCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailBody) return;
    setEmailFeedback(`Dispatched campaign email queue to ${emailTarget === 'all' ? '1,540 total subscribers' : emailTarget === 'followers' ? '820 active followers' : '720 previous buyers'} successfully!`);
    setEmailSubject('');
    setEmailBody('');
  };

  return (
    <div id="marketing-engagement-portal" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[#D4FF5E]" />
            <span>Marketing Suite & Sales Accelerator</span>
          </h2>
          <p className="text-[10px] text-[#8E9299] font-medium mt-1">
            Publish coupons, bundle multiple assets, schedule temporary flash discounts, manage affiliate referral links, and dispatch mass email updates.
          </p>
        </div>
      </div>

      {/* Mini Hub Navigation tabs */}
      <div className="flex flex-wrap gap-1 bg-[#161618] border border-white/10 p-1.5 rounded-2xl overflow-x-auto scrollbar-none">
        {(['coupons', 'campaigns', 'bundles', 'flash', 'referrals', 'featured', 'emails'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === tab 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-[#F4F4F4]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* RENDER TAB 1: COUPONS CONFIGURATION */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create Coupon form (Col 5) */}
          <div className="lg:col-span-5 bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest block font-mono">Create discount voucher</span>
              <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Publish New Coupon</h3>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-4 pt-1">
              <div>
                <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Unique Voucher Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPECIAL30"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-[#D4FF5E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Discount Percentage *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={newPercentage}
                    onChange={(e) => setNewPercentage(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Max Uses Limit *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Expiration Date</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#D4FF5E] text-black py-2.5 text-xs font-black uppercase tracking-widest hover:bg-[#c3ec4e]"
              >
                Link Active Voucher
              </button>
            </form>
          </div>

          {/* Active coupons list (Col 7) */}
          <div className="lg:col-span-7 bg-[#161618] border border-white/10 rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Active Promotional Codes</h3>
              <span className="text-[9px] font-black text-[#8E9299] uppercase font-mono">SECURE DISCOUNTS</span>
            </div>

            <div className="divide-y divide-white/5">
              {coupons.map((c, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#D4FF5E] tracking-wider select-all">{c.code}</span>
                      <span className="text-[8.5px] font-mono font-bold bg-white/5 border border-white/10 text-white px-2 py-0.5 rounded">
                        {c.discountPercentage}% OFF
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8E9299] block font-mono">
                      Limits: {c.usedCount} / {c.maxUses} used • Expires {c.expiryDate}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleCoupon(c.code)}
                    className={`text-[9.5px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all ${
                      c.isActive 
                        ? 'border-[#D4FF5E]/20 text-[#D4FF5E] bg-[#D4FF5E]/5' 
                        : 'border-white/5 text-[#8E9299] bg-white/5'
                    }`}
                  >
                    {c.isActive ? 'Active / Disable' : 'Inactive / Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* RENDER TAB 2: DISCOUNT CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="bg-[#161618] border border-white/10 rounded-3xl overflow-hidden space-y-4 p-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest block font-mono">Seasonal Promotions</span>
              <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Discount Campaigns Schedule</h3>
            </div>
            <button
              onClick={() => alert('Add Seasonal Campaign feature...')}
              className="rounded-xl bg-[#D4FF5E] text-black px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#c3ec4e]"
            >
              Add Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(camp => (
              <div key={camp.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-mono text-[#D4FF5E]">{camp.id}</span>
                    <h4 className="font-bold text-white uppercase text-xs mt-0.5">{camp.name}</h4>
                  </div>
                  <span className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                    camp.status === 'active' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {camp.status}
                  </span>
                </div>

                <div className="text-xs text-[#8E9299] space-y-1">
                  <div className="flex justify-between">
                    <span>Target Item:</span>
                    <span className="text-white font-bold">{camp.productAffected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flat Discount Ratio:</span>
                    <span className="text-[#D4FF5E] font-bold">{camp.discountPercentage}% OFF</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Duration:</span>
                    <span className="text-white">{camp.startDate} to {camp.endDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER TAB 3: ASSET BUNDLES */}
      {activeTab === 'bundles' && (
        <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest block font-mono">Multi-item value packaging</span>
              <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Product Bundles</h3>
            </div>
            <button
              onClick={handleCreateBundle}
              className="rounded-xl bg-[#D4FF5E] text-black px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#c3ec4e]"
            >
              Create Bundle
            </button>
          </div>

          <div className="space-y-4">
            {bundles.map(b => (
              <div key={b.id} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-xs uppercase">{b.title}</h4>
                    <span className="text-[8px] font-mono bg-white/5 text-[#8E9299] border border-white/10 px-1.5 rounded">{b.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {b.productsIncluded.map((p, idx) => (
                      <span key={idx} className="text-[9.5px] bg-white/5 text-[#8E9299] border border-white/5 px-2 py-0.5 rounded font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-right shrink-0">
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-[#8E9299]">Composite Bundle Price</span>
                    <span className="text-sm font-black text-[#D4FF5E] font-mono">${b.compositePrice.toFixed(2)}</span>
                    <span className="text-[10px] text-[#8E9299] font-mono line-through ml-1.5">${b.normalPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-[#8E9299]">Purchases Counter</span>
                    <span className="text-sm font-black text-white font-mono">{b.salesCount} bundles sold</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER TAB 4: FLASH SALES */}
      {activeTab === 'flash' && (
        <div className="bg-[#161618] border border-[#D4FF5E]/10 rounded-3xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block font-mono">Extreme time-locked discount campaigns</span>
              <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Flash Sales Dispatcher</h3>
            </div>
            <button
              onClick={handleCreateFlashSale}
              className="rounded-xl bg-[#D4FF5E] text-black px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#c3ec4e]"
            >
              Initiate Flash Sale
            </button>
          </div>

          <div className="bg-gradient-to-r from-red-500/[0.03] to-amber-500/[0.03] border border-red-500/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase">
                Urgent Countdown simulated
              </span>
              <h4 className="font-bold text-white uppercase text-sm mt-1">{flashSale.productName}</h4>
              <p className="text-[11px] text-[#8E9299]">
                Live promo configured! Customers receive extreme <span className="text-red-400 font-bold">{flashSale.extremeDiscount}% OFF</span> if completed within the ticking window.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="block text-[8px] font-bold uppercase text-[#8E9299] tracking-wider">Countdown Escalation Buffer</span>
              <span className="font-mono text-xl font-black text-[#D4FF5E]">00:54:00 left</span>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 5: REFERRALS AFFILIATES LINKING */}
      {activeTab === 'referrals' && (
        <div className="bg-[#161618] border border-white/10 rounded-3xl overflow-hidden space-y-4 p-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block font-mono">Affiliate sales split sharing</span>
              <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Referral Affiliate Links</h3>
            </div>
            <button
              onClick={() => alert('Configure referral code...')}
              className="rounded-xl bg-[#D4FF5E] text-black px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#c3ec4e]"
            >
              New Referral Link
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {referrals.map(ref => (
              <div key={ref.id} className="bg-black/20 p-4 border border-white/5 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-white text-[11px] tracking-wider select-all">/{ref.code}</span>
                  <span className="text-[9px] font-mono font-bold text-[#D4FF5E] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-2 rounded">
                    {ref.affiliateCommissionPercentage}% Commission
                  </span>
                </div>

                <div className="space-y-1 text-[#8E9299]">
                  <div className="flex justify-between">
                    <span>Target Item:</span>
                    <span className="text-white font-bold">{ref.targetProduct}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Performance:</span>
                    <span className="text-white font-bold">{ref.clicks} clicks • {ref.conversions} conversions ({((ref.conversions / ref.clicks) * 100).toFixed(1)}% cvr)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER TAB 6: PREMIUM SHOWCASE REQUESTS */}
      {activeTab === 'featured' && (
        <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block font-mono">Advertise products on OMYRA Mall storefront zones</span>
              <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Featured Product Showcase Requests</h3>
            </div>
            <button
              onClick={handleRequestFeatured}
              className="rounded-xl bg-[#D4FF5E] text-black px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#c3ec4e]"
            >
              Submit Showcase Request
            </button>
          </div>

          <div className="space-y-3">
            {featured.map(f => (
              <div key={f.id} className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center justify-between text-xs text-[#8E9299]">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white uppercase">{f.productName}</h4>
                    <span className="text-[8px] font-mono bg-white/5 text-white px-1.5 rounded">{f.id}</span>
                  </div>
                  <span className="text-[10px] block mt-0.5">Zone: {f.showcaseZone.toUpperCase().replace('_', ' ')} for {f.durationDays} days</span>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-[#8E9299]">Flat cost fee</span>
                    <span className="font-mono font-bold text-white">${f.flatCost.toFixed(2)}</span>
                  </div>
                  <span className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                    f.status === 'approved' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER TAB 7: FOLLOWER EMAIL CAMPAIGNS */}
      {activeTab === 'emails' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Dispatch Email Campaign form (Col 7) */}
          <div className="lg:col-span-7 bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest block font-mono">Mass CRM dispatch pipeline</span>
              <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Draft Follower Email Campaign</h3>
            </div>

            {emailFeedback && (
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                {emailFeedback}
              </div>
            )}

            <form onSubmit={handleDispatchEmailCampaign} className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Recipient Target Segment *</label>
                  <select
                    value={emailTarget}
                    onChange={(e) => setEmailTarget(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="all">All Registered Customers & Followers (1,540)</option>
                    <option value="followers">Active Followers Only (820)</option>
                    <option value="buyers">Previous Paid Buyers Only (720)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Email Subject line *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30% OFF Summer Solstice Dev Sale!"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8.5px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Email Body content (Markdown compatible) *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Draft your promotional or update message here..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#D4FF5E] text-black py-3 text-xs font-black uppercase tracking-widest hover:bg-[#c3ec4e] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Dispatch Email Campaign</span>
              </button>
            </form>
          </div>

          {/* Marketing split performance statistics (Col 5) */}
          <div className="lg:col-span-5 bg-[#161618] border border-[#D4FF5E]/10 rounded-3xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block font-mono">Marketing impact indicators</span>
                <h3 className="font-display font-black text-white text-sm uppercase mt-0.5">Campaign Conversion KPIs</h3>
              </div>

              <div className="space-y-3.5 pt-2 text-xs text-[#8E9299]">
                <div className="flex justify-between items-center bg-black/30 p-3.5 rounded-xl border border-white/5">
                  <span>Coupon Sales Generated:</span>
                  <span className="font-bold text-white font-mono">$1,840.50 (12.3% of total)</span>
                </div>
                <div className="flex justify-between items-center bg-black/30 p-3.5 rounded-xl border border-white/5">
                  <span>Email Campaign CTR:</span>
                  <span className="font-bold text-[#D4FF5E] font-mono">18.5% click-through rate</span>
                </div>
                <div className="flex justify-between items-center bg-black/30 p-3.5 rounded-xl border border-white/5">
                  <span>Affiliate Split Conversions:</span>
                  <span className="font-bold text-white font-mono">20 transactions closed</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/5 pt-4 text-[9.5px] text-[#8E9299] leading-relaxed">
              Ensure you specify accurate coupon and voucher keys inside email campaigns to track accurate customer conversion metrics automatically.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
