import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Check, ShoppingBag, DollarSign, Layers, PlusCircle, AlertCircle, 
  Trash2, Settings, Globe, Palette, CheckCircle2, ChevronRight, Eye, Tag, FileText, X,
  Clock, ShieldAlert, ArrowUpRight, HelpCircle, ShieldCheck, Mail, RefreshCw, Send,
  FileCheck, ShieldAlert as WarningIcon
} from 'lucide-react';
import { Product } from '../types';
import CreatorSetupWizard from './CreatorSetupWizard';

export interface CreatorDashboardProps {
  products: Product[];
  onPublishProduct: (newProdData: Omit<Product, 'id' | 'createdAt' | 'downloads' | 'reviews' | 'rating' | 'reviewCount'>) => void;
  onUpdateProducts: (updatedProducts: Product[]) => void;
  onCancel: () => void;
}

export default function CreatorDashboard({
  products,
  onPublishProduct,
  onUpdateProducts,
  onCancel
}: CreatorDashboardProps) {

  // Onboarding status: 'none' | 'pending' | 'approved' | 'rejected'
  const [onboardingStatus, setOnboardingStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>(() => {
    return (localStorage.getItem('omyra_creator_onboarding_status') as any) || 'none';
  });

  const [rejectionReason, setRejectionReason] = useState(() => {
    return localStorage.getItem('omyra_creator_rejection_reason') || 'KYC Identity proof document was dark and the text could not be verified.';
  });

  const [draftDetails, setDraftDetails] = useState(() => {
    const d = localStorage.getItem('omyra_creator_application_draft');
    return d ? JSON.parse(d) : { firstName: 'Value', lastName: 'Creator', email: 'matrixgyan88094@gmail.com', shopName: 'Nexus Core', shopUsername: 'nexus' };
  });

  const [loadingSim, setLoadingSim] = useState(false);
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [showSimPanel, setShowSimPanel] = useState(true);

  // Keep draftDetails synced
  useEffect(() => {
    const d = localStorage.getItem('omyra_creator_application_draft');
    if (d) {
      setDraftDetails(JSON.parse(d));
    }
  }, [onboardingStatus]);

  // Custom persistent store settings
  const [storeName, setStoreName] = useState(() => {
    const submittedName = draftDetails?.shopName;
    return submittedName || localStorage.getItem('omyra_custom_store_name') || 'DesignAura Labs';
  });
  
  const [storeTagline, setStoreTagline] = useState(() => localStorage.getItem('omyra_custom_store_tagline') || 'Elite UI Systems & Developer Blueprints');
  const [storeBio, setStoreBio] = useState(() => localStorage.getItem('omyra_custom_store_bio') || 'High-fidelity technical starter kits and SaaS boilerplate builds optimized for ultra-fast deployment.');
  const [storeColor, setStoreColor] = useState(() => localStorage.getItem('omyra_custom_store_color') || '#D4FF5E');
  const [payoutEmail, setPayoutEmail] = useState(() => draftDetails?.email || localStorage.getItem('omyra_custom_payout_email') || 'payment@designaura.io');
  const [payoutMethod, setPayoutMethod] = useState(() => localStorage.getItem('omyra_custom_payout_method') || 'paypal');

  const [activeTab, setActiveTab] = useState<'listings' | 'branding'>('listings');
  const [showPublishForm, setShowPublishForm] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'templates' | 'ebooks' | 'design' | 'code' | 'audio'>('code');
  const [price, setPrice] = useState('19.00');
  const [tags, setTags] = useState('');
  const [features, setFeatures] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Persist branding configurations when modified
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('omyra_custom_store_name', storeName);
    localStorage.setItem('omyra_custom_store_tagline', storeTagline);
    localStorage.setItem('omyra_custom_store_bio', storeBio);
    localStorage.setItem('omyra_custom_store_color', storeColor);
    localStorage.setItem('omyra_custom_payout_email', payoutEmail);
    localStorage.setItem('omyra_custom_payout_method', payoutMethod);

    setSuccessMsg('Branding and payout preferences saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Publish dynamic new listing
  const handlePublishNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tagline.trim() || !description.trim() || !price.trim()) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }

    onPublishProduct({
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price) || 0,
      creator: {
        name: storeName,
        avatar: draftDetails?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80',
        badge: 'Verified Creator',
        salesCount: 1,
        rating: 5.0
      },
      coverImage: 'linear-gradient(135deg, #161618 0%, #2a2a2e 100%)',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      features: features.split(',').map(f => f.trim()).filter(Boolean),
      filesIncluded: ['Source-Archive-v1.zip', 'Integration-Documentation.pdf'],
      fileSize: '15.4 MB'
    });

    setSuccessMsg('New digital product successfully listed in the catalog!');
    setErrorMsg('');
    setTitle('');
    setTagline('');
    setDescription('');
    setPrice('19.00');
    setTags('');
    setFeatures('');
    setShowPublishForm(false);

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // Delete product listing
  const handleDeleteListing = (productId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this listing from Omyra Mall? This action is permanent.');
    if (!isConfirmed) return;

    const updated = products.filter(p => p.id !== productId);
    onUpdateProducts(updated);
    setSuccessMsg('Listing successfully deleted from the catalog.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Onboarding action listeners
  const handleOnboardingSuccess = (shopData: any) => {
    setDraftDetails(shopData);
    setOnboardingStatus('pending');
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem('omyra_creator_onboarding_status');
    localStorage.removeItem('omyra_creator_rejection_reason');
    setOnboardingStatus('none');
  };

  // Dev Simulators with actual Resend outbound trigger logs
  const handleSimulateApprove = async () => {
    setLoadingSim(true);
    try {
      localStorage.setItem('omyra_creator_onboarding_status', 'approved');
      setOnboardingStatus('approved');
      if (draftDetails?.shopName) {
        localStorage.setItem('omyra_custom_store_name', draftDetails.shopName);
        setStoreName(draftDetails.shopName);
      }

      const response = await fetch('/api/email/send-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer local-dev-token'
        },
        body: JSON.stringify({
          recipient: draftDetails?.email || 'matrixgyan88094@gmail.com',
          type: 'approved',
          variables: {
            userName: `${draftDetails?.firstName || 'Valued'} ${draftDetails?.lastName || 'Creator'}`,
            shopName: draftDetails?.shopName || 'OMYRA Store',
            shopUsername: draftDetails?.shopUsername || 'creator'
          }
        })
      });
      const data = await response.json();
      console.log('Approve Notification Dispatch:', data);
    } catch (err) {
      console.error('Failed to send approve notification:', err);
    } finally {
      setLoadingSim(false);
    }
  };

  const handleSimulateReject = async (reason: string) => {
    setLoadingSim(true);
    try {
      const finalReason = reason || 'KYC photo details did not match the registered legal metadata.';
      localStorage.setItem('omyra_creator_onboarding_status', 'rejected');
      localStorage.setItem('omyra_creator_rejection_reason', finalReason);
      setRejectionReason(finalReason);
      setOnboardingStatus('rejected');

      const response = await fetch('/api/email/send-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer local-dev-token'
        },
        body: JSON.stringify({
          recipient: draftDetails?.email || 'matrixgyan88094@gmail.com',
          type: 'rejected',
          variables: {
            userName: `${draftDetails?.firstName || 'Valued'} ${draftDetails?.lastName || 'Creator'}`,
            reason: finalReason
          }
        })
      });
      const data = await response.json();
      console.log('Reject Notification Dispatch:', data);
    } catch (err) {
      console.error('Failed to send reject notification:', err);
    } finally {
      setLoadingSim(false);
    }
  };

  // Filter products by this creator name
  const sellerProducts = products.filter(
    p => p.creator?.name?.toLowerCase() === storeName.toLowerCase()
  );

  // Metrics calculations
  const totalDownloads = sellerProducts.reduce((sum, p) => sum + (p.downloads || 0), 0);
  const totalRevenue = sellerProducts.reduce((sum, p) => sum + ((p.downloads || 0) * p.price), 0);
  const averageRating = sellerProducts.length > 0 
    ? parseFloat((sellerProducts.reduce((sum, p) => sum + p.rating, 0) / sellerProducts.length).toFixed(2)) 
    : 5.0;

  // RENDER CORRESPONDING ONBOARDING LAYOUTS BASED ON STATE
  if (onboardingStatus === 'none') {
    return (
      <div className="space-y-6 animate-fadeIn py-4">
        <CreatorSetupWizard 
          onSuccess={handleOnboardingSuccess} 
          onCancel={onCancel} 
        />
      </div>
    );
  }

  // RENDER "PENDING" REVIEW COMPONENT
  if (onboardingStatus === 'pending') {
    return (
      <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto py-8 text-center px-4 relative">
        
        {/* Admin Dev Simulator Box */}
        {showSimPanel && (
          <div className="rounded-3xl border border-[#D4FF5E]/30 bg-black/40 p-5 space-y-4 mb-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#D4FF5E] text-black text-[8px] font-black uppercase px-2.5 py-1 rounded-bl-xl font-mono">
              PREVIEW SYSTEM
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#D4FF5E] animate-spin" />
              <span className="text-xs font-mono font-black text-white uppercase tracking-wider">OMYRA COMPLIANCE CONTROLLER</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium font-sans">
              Simulate manual admin reviews. Approving or rejecting instantly triggers a real email via your registered <strong>Resend API</strong> config to <span className="text-[#D4FF5E] font-bold">{draftDetails?.email}</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleSimulateApprove}
                disabled={loadingSim}
                className="flex-1 rounded-xl bg-[#D4FF5E] hover:bg-white text-black font-black uppercase text-[10px] py-3 tracking-widest cursor-pointer transition-colors"
              >
                {loadingSim ? 'Sending Outbound...' : 'Approve Application ✅'}
              </button>
              
              <button
                onClick={() => handleSimulateReject(customRejectReason || 'Blurry and illegible documents uploaded.')}
                disabled={loadingSim}
                className="flex-1 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 font-black uppercase text-[10px] py-3 tracking-widest cursor-pointer transition-colors"
              >
                Reject Application ❌
              </button>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">Decline Reason (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Mismatch on ID name vs profile..."
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
                className="w-full text-xs bg-black/40 border border-white/5 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#D4FF5E]"
              />
            </div>
          </div>
        )}

        {/* Pending Screen Content */}
        <div className="rounded-[36px] bg-[#161618] border border-white/10 p-8 md:p-12 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4FF5E]/5 blur-3xl pointer-events-none" />
          
          <div className="mx-auto h-20 w-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 relative">
            <Clock className="h-10 w-10 animate-pulse" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">Compliance Status: Pending</span>
            <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tight">
              Onboarding Application Under Review
            </h2>
            <div className="w-12 h-0.5 bg-amber-500/50 mx-auto rounded-full" />
          </div>

          <div className="max-w-lg mx-auto space-y-4">
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Your OMYRA creator onboarding application is under review. It will take <strong>24 to 72 hours</strong>. Our Compliance division is verifying your legal name, residency coordinates, and validating the uploaded KYC assets.
            </p>

            <div className="rounded-2xl border border-white/5 bg-[#0a0a0b] p-4 text-left space-y-2">
              <span className="text-[9px] font-mono font-black uppercase text-slate-500 tracking-widest block">Audit Parameters</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium font-sans">
                <span className="text-slate-400">Shop Handle:</span>
                <span className="text-[#D4FF5E] text-right">https://mall.omyra.org/{draftDetails?.shopUsername || 'handle'}</span>
                
                <span className="text-slate-400">Owner Email:</span>
                <span className="text-white text-right">{draftDetails?.email || 'email@domain.com'}</span>

                <span className="text-slate-400">Secure Storefront:</span>
                <span className="text-white text-right font-semibold">Isolated Cloud Storage</span>

                <span className="text-slate-400">Secured Documents:</span>
                <span className="text-white text-right font-semibold">Encrypted Document Vault</span>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-2.5 mx-auto">
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>Onboarding application submission confirmation greeting sent!</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t border-white/5">
            <button
              onClick={onCancel}
              className="rounded-xl border border-white/10 hover:border-white/20 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Mall
            </button>
            <button
              onClick={() => setShowSimPanel(!showSimPanel)}
              className="rounded-xl border border-white/10 hover:border-white/20 px-6 py-3 text-xs font-black uppercase tracking-widest text-[#D4FF5E] hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Settings className="h-4 w-4" />
              <span>Toggle Auditor Simulator</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // RENDER "REJECTED" COMPONENT
  if (onboardingStatus === 'rejected') {
    return (
      <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto py-8 text-center px-4">
        
        {/* Admin Dev Simulator Box */}
        {showSimPanel && (
          <div className="rounded-3xl border border-[#D4FF5E]/30 bg-black/40 p-5 space-y-4 mb-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#D4FF5E] text-black text-[8px] font-black uppercase px-2.5 py-1 rounded-bl-xl font-mono">
              PREVIEW SYSTEM
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#D4FF5E]" />
              <span className="text-xs font-mono font-black text-white uppercase tracking-wider">OMYRA COMPLIANCE CONTROLLER</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium font-sans">
              Override rejection and approve the creator instantly.
            </p>

            <button
              onClick={handleSimulateApprove}
              disabled={loadingSim}
              className="w-full rounded-xl bg-[#D4FF5E] hover:bg-white text-black font-black uppercase text-[10px] py-3 tracking-widest cursor-pointer transition-colors"
            >
              {loadingSim ? 'Enqueuing Email...' : 'Approve Application Now ✅'}
            </button>
          </div>
        )}

        <div className="rounded-[36px] bg-[#161618] border border-white/10 p-8 md:p-12 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl pointer-events-none" />
          
          <div className="mx-auto h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <WarningIcon className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest">Compliance Status: Declined</span>
            <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tight">
              Onboarding Application Rejected
            </h2>
            <div className="w-12 h-0.5 bg-rose-500/50 mx-auto rounded-full" />
          </div>

          <div className="max-w-lg mx-auto space-y-5">
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Unfortunately, your OMYRA creator onboarding application could not be approved at this time. Our Compliance team identified discrepancy parameters matching your legal coordinates or ID asset.
            </p>

            {/* Decline Reason Display */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-left space-y-2.5">
              <span className="text-[9px] font-mono font-black uppercase text-rose-400 tracking-widest block">Audit Discrepancy Log</span>
              <p className="text-xs text-rose-200 font-semibold leading-relaxed font-sans">
                {rejectionReason}
              </p>
            </div>

            <p className="text-[10px] text-slate-500 font-medium">
              You can correct these coordinate mismatches or upload higher fidelity files by resetting your application state below. Your draft data is cached so you won't have to start from scratch.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-white/5">
            <button
              onClick={onCancel}
              className="rounded-xl border border-white/10 hover:border-white/20 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleResetOnboarding}
              className="rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest text-black bg-[#D4FF5E] hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(212,255,94,0.2)]"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Re-Apply & Update Details</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // CONTINUING approved RENDER FOR ORIGINAL CORE CREATOR WORKSPACE BELOW
  return (
    <div id="creator-fresh-portal" className="space-y-8 animate-fadeIn relative">

      {/* Persistent floating Dev Simulator reset trigger inside Approved Creator center to let users test everything over and over */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleResetOnboarding}
          className="rounded-xl bg-black/80 hover:bg-[#D4FF5E] text-[#D4FF5E] hover:text-black border border-[#D4FF5E]/30 px-3.5 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-2xl transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          <span>Reset Creator Settings (Dev Testing)</span>
        </button>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 pt-2">
        <div className="space-y-2">
          <span 
            className="inline-flex items-center text-[10px] font-mono font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest border"
            style={{ color: storeColor, backgroundColor: `${storeColor}15`, borderColor: `${storeColor}30` }}
          >
            <Sparkles className="h-3 w-3 mr-1.5 animate-pulse" />
            Omyra Creator Center
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white uppercase italic mt-1 leading-none">
            {storeName} <span className="text-slate-400 font-normal not-italic">Workspace</span>
          </h1>
          <p className="text-xs text-[#8E9299] font-medium max-w-xl">
            {storeTagline}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === 'listings' ? 'branding' : 'listings')}
            className="rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs font-black uppercase tracking-widest px-4 py-3 text-white transition-all cursor-pointer flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span>{activeTab === 'listings' ? 'Branding Settings' : 'Back to Store'}</span>
          </button>

          <button
            onClick={() => setShowPublishForm(!showPublishForm)}
            className="rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center gap-2 text-black"
            style={{ backgroundColor: storeColor }}
          >
            <PlusCircle className="h-4 w-4" />
            <span>{showPublishForm ? 'Close Editor' : 'Publish New Asset'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-center text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4.5 w-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/5 bg-[#161618] p-5 space-y-2">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Total Revenue</span>
          <p className="text-white text-xl md:text-2xl font-black">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#161618] p-5 space-y-2">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Asset Downloads</span>
          <p className="text-white text-xl md:text-2xl font-black">{totalDownloads.toLocaleString('en-US')}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#161618] p-5 space-y-2">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Active Listings</span>
          <p className="text-white text-xl md:text-2xl font-black">{sellerProducts.length}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#161618] p-5 space-y-2">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Average Rating</span>
          <p className="text-white text-xl md:text-2xl font-black">⭐ {averageRating} / 5.0</p>
        </div>
      </div>

      {/* Publish Form Drawer / Overlay */}
      {showPublishForm && (
        <div className="rounded-[28px] border border-white/10 bg-[#161618] p-6 space-y-6 animate-slideIn">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#D4FF5E] flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Publish New Digital Product
            </h3>
            <button onClick={() => setShowPublishForm(false)} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePublishNewProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-white uppercase tracking-widest">Asset Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Nexus SaaS Premium UI Dashboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-white uppercase tracking-widest">Short Tagline *</label>
                <input
                  type="text"
                  placeholder="e.g. Over 250+ responsive components beautifully styled"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-3 text-xs text-white focus:border-[#D4FF5E] focus:outline-none cursor-pointer"
                  >
                    <option value="code">Code & Dev</option>
                    <option value="templates">Templates</option>
                    <option value="ebooks">Books & Guides</option>
                    <option value="design">3D & Design</option>
                    <option value="audio">Audio & Beats</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="29.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-white uppercase tracking-widest">Description *</label>
                <textarea
                  rows={4}
                  placeholder="Detailed layout parameters, compatibility requirements, and features listed in the download archive..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Tags (comma split)</label>
                  <input
                    type="text"
                    placeholder="figma, ui, react"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Key Features (comma split)</label>
                  <input
                    type="text"
                    placeholder="Responsive grid, auto-layout"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full text-center text-xs font-black uppercase tracking-widest text-black bg-[#D4FF5E] hover:bg-white py-3.5 rounded-xl transition-colors cursor-pointer"
                style={{ backgroundColor: storeColor }}
              >
                Publish Digital Asset Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'listings' ? (
        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Storefront Catalog ({sellerProducts.length})</span>
          </h2>

          {sellerProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#161618]/20 p-12 text-center space-y-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No active digital products listed under "{storeName}".</p>
              <button
                onClick={() => setShowPublishForm(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                Publish Your First Asset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sellerProducts.map((prod) => (
                <div key={prod.id} className="p-6 rounded-2xl border border-white/10 bg-[#161618] flex flex-col justify-between gap-4 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-black tracking-wider uppercase shadow-inner"
                      style={{ background: prod.coverImage || 'linear-gradient(135deg, #1e1e24 0%, #3a3a46 100%)' }}
                    >
                      {prod.category.substring(0, 3).toUpperCase()}
                    </div>
                    
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono font-bold text-[#8E9299] bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          {prod.category}
                        </span>
                        <span className="text-xs font-black text-white" style={{ color: storeColor }}>
                          ${prod.price.toFixed(2)}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wide truncate">{prod.title}</h4>
                      <p className="text-[10px] text-[#8E9299] font-medium leading-relaxed line-clamp-2">{prod.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px]">
                    <div className="flex items-center gap-3 font-semibold text-slate-400">
                      <span>📥 {prod.downloads || 0} Downloads</span>
                      <span>⭐ {prod.rating} ({prod.reviewCount} reviews)</span>
                    </div>

                    <button 
                      onClick={() => handleDeleteListing(prod.id)}
                      className="text-rose-400 hover:text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-bold uppercase tracking-widest text-[9px]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Brand Customizer form */
        <div className="rounded-3xl border border-white/10 bg-[#161618] p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Palette className="h-4.5 w-4.5" />
              Custom Brand Settings
            </h3>
            <p className="text-xs text-[#8E9299] mt-1 font-medium">
              Configure store visuals, names, bio statements, and billing credentials instantly.
            </p>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Creator Brand Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Brand Headline / Tagline</label>
                  <input
                    type="text"
                    value={storeTagline}
                    onChange={(e) => setStoreTagline(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Studio Primary Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={storeColor}
                      onChange={(e) => setStoreColor(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={storeColor}
                      onChange={(e) => setStoreColor(e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-[#0A0A0B] py-2.5 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-white uppercase tracking-widest">Brand Description / Bio</label>
                  <textarea
                    rows={3}
                    value={storeBio}
                    onChange={(e) => setStoreBio(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none transition-all resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-white uppercase tracking-widest">Payout Provider</label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-3 text-xs text-white focus:border-[#D4FF5E] focus:outline-none cursor-pointer"
                    >
                      <option value="paypal">PayPal Escrow</option>
                      <option value="stripe">Stripe Connect</option>
                      <option value="upi">Direct UPI Payout</option>
                      <option value="crypto">Web3 Crypto Wallet</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-white uppercase tracking-widest">Payout Account Email / ID</label>
                    <input
                      type="text"
                      value={payoutEmail}
                      onChange={(e) => setPayoutEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-black bg-[#D4FF5E] hover:bg-white rounded-xl transition-colors cursor-pointer"
                style={{ backgroundColor: storeColor }}
              >
                Save Identity Preferences
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
