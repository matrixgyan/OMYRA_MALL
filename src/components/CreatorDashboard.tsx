import React, { useState } from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  Coins, 
  Users, 
  Layers, 
  Plus, 
  Check, 
  Sparkles, 
  AlertCircle, 
  ShoppingBag, 
  DollarSign, 
  Wallet, 
  Star, 
  MessageSquare, 
  ArrowUpRight, 
  Calendar, 
  Landmark, 
  Percent, 
  Eye, 
  Heart, 
  BellRing, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  Activity,
  ArrowDownRight,
  TrendingDown,
  Clock,
  ShieldAlert,
  ChevronRight,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  FileText,
  Image,
  Camera,
  Sliders,
  Share2,
  Lock,
  Unlock
} from 'lucide-react';
import { Product } from '../types';
import ProductManager from './ProductManager';
import UploadCenter from './UploadCenter';
import OrderManager from './OrderManager';
import CustomerManager from './CustomerManager';
import ReviewManager from './ReviewManager';
import AnalyticsManager from './AnalyticsManager';
import EarningsManager from './EarningsManager';
import PayoutCenter from './PayoutCenter';
import MarketingCenter from './MarketingCenter';

interface CreatorDashboardProps {
  products: Product[];
  onPublishProduct: (product: Omit<Product, 'id' | 'createdAt' | 'downloads' | 'reviews' | 'rating' | 'reviewCount'>) => void;
  onUpdateProducts?: (products: Product[]) => void;
}

export default function CreatorDashboard({
  products,
  onPublishProduct,
  onUpdateProducts
}: CreatorDashboardProps) {
  // Navigation State within the Creator Portal
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'listings' | 'publish' | 'upload' | 'store' | 'orders' | 'customers' | 'reviews' | 'analytics' | 'earnings' | 'payouts' | 'marketing'>('dashboard');
  
  // Store Management States
  const [storeName, setStoreName] = useState('DesignAura Labs');
  const [storeUrl, setStoreUrl] = useState('designaura');
  const [storeLogo, setStoreLogo] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop&q=80');
  const [storeBanner, setStoreBanner] = useState('linear-gradient(135deg, #6366f1 0%, #a855f7 100%)');
  const [storeDescription, setStoreDescription] = useState('High-end digital assets, premium SaaS UI templates, UI design systems, and customizable react web interfaces.');
  const [storeCategories, setStoreCategories] = useState<string[]>(['templates', 'design', 'code']);
  const [website, setWebsite] = useState('https://designaura.io');
  const [portfolio, setPortfolio] = useState('https://dribbble.com/designaura');
  
  // Social Links
  const [twitter, setTwitter] = useState('https://twitter.com/designaura');
  const [github, setGithub] = useState('https://github.com/designaura');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/company/designaura');
  const [instagram, setInstagram] = useState('https://instagram.com/designaura');

  // Business Information
  const [businessName, setBusinessName] = useState('DesignAura Solutions LLC');
  const [businessAddress, setBusinessAddress] = useState('100 Pine Street, Suite 1200, San Francisco, CA 94111');
  const [businessRegistration, setBusinessRegistration] = useState('US-942104-B');

  // Tax Information
  const [taxId, setTaxId] = useState('EIN-94-2109281');
  const [taxCountry, setTaxCountry] = useState('United States');
  const [vatNumber, setVatNumber] = useState('VAT948210385');

  // Verification & Settings
  const [storeVerification, setStoreVerification] = useState<'verified' | 'pending' | 'unverified'>('verified');
  const [isFeaturedStore, setIsFeaturedStore] = useState(true);
  const [featuredCategory, setFeaturedCategory] = useState<'templates' | 'ebooks' | 'design' | 'code' | 'audio'>('templates');

  // SEO Settings
  const [seoTitle, setSeoTitle] = useState('DesignAura Labs | Premium UI Templates & Digital Assets');
  const [seoMetaDescription, setSeoMetaDescription] = useState('Acquire industry-standard React templates, custom landing pages, Figma design systems, and responsive layouts crafted by expert frontend artists.');
  const [seoKeywords, setSeoKeywords] = useState('saas dashboard, figma templates, react landing page, tailwind web assets');

  // Open/Closed Status
  const [isOpen, setIsOpen] = useState(true);
  const [vacationMessage, setVacationMessage] = useState('Our store is temporarily on vacation. You can still access and download your past purchases immediately!');

  // Sub-Tab within Store Management Settings
  const [storeSettingsTab, setStoreSettingsTab] = useState<'general' | 'socials' | 'business' | 'seo'>('general');

  // Interactive File Upload Simulate State
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingTaxDoc, setIsUploadingTaxDoc] = useState(false);
  
  // Interactive Graph States
  const [activePeriod, setActivePeriod] = useState<'7d' | '30d' | '12m'>('12m');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Form states for listing products
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'templates' | 'ebooks' | 'design' | 'code' | 'audio'>('templates');
  const [price, setPrice] = useState('19.00');
  const [tags, setTags] = useState('');
  const [features, setFeatures] = useState('');
  const [filesIncluded, setFilesIncluded] = useState('');
  const [fileSize, setFileSize] = useState('15.4 MB');
  const [coverGradient, setCoverGradient] = useState('linear-gradient(135deg, #f59e0b 0%, #d97706 100%)');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Interactive reply to review state
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [submittedReplies, setSubmittedReplies] = useState<{ [key: string]: string }>({});

  const PRESET_GRADIENTS = [
    { name: 'Sunset Aura', value: 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)' },
    { name: 'Cosmic Violet', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
    { name: 'Cyberpunk Neon', value: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' },
    { name: 'Emerald Forest', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { name: 'Deep Ocean Blue', value: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' },
    { name: 'Gold Radiant', value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  ];

  // Creator specific products (simulating that the active user is 'DesignAura Labs' or 'You (Creator)')
  const creatorProducts = products.filter(p => p.creator.name === 'DesignAura Labs' || p.creator.name === 'You (Creator)');

  // Dynamic calculations based on products in catalog
  const totalListed = creatorProducts.length;
  const totalSalesCount = creatorProducts.reduce((acc, p) => acc + p.creator.salesCount, 0);
  const totalEarnings = creatorProducts.reduce((acc, p) => acc + (p.creator.salesCount * p.price), 0);
  const totalDownloads = creatorProducts.reduce((acc, p) => acc + (p.downloads || Math.floor(p.creator.salesCount * 0.95)), 0);

  // Primary Metrics with exact mappings requested by user
  const metrics = {
    totalRevenue: totalEarnings,
    availableBalance: totalEarnings * 0.75, // 75% settled
    pendingBalance: totalEarnings * 0.25, // 25% clear in progress
    lifetimeEarnings: totalEarnings, // Gross cumulative
    totalOrders: totalSalesCount,
    totalProducts: totalListed,
    totalDownloads: totalDownloads,
    activeCustomers: Math.floor(totalSalesCount * 0.92), // distinct accounts
    refundRequests: 3, // with 0 pending action
    conversionRate: 3.42, // %
    storeRating: totalListed > 0 ? (creatorProducts.reduce((acc, p) => acc + p.rating, 0) / totalListed).toFixed(2) : '4.90',
    productViews: 41240,
    wishlistCount: 1842,
    followers: 628,
    monthlyGrowth: 14.8 // %
  };

  // Interactive Graph Datasets
  const SALES_DATA = {
    '7d': [
      { label: 'Jun 21', value: totalEarnings * 0.08, orders: Math.floor(totalSalesCount * 0.08) },
      { label: 'Jun 22', value: totalEarnings * 0.12, orders: Math.floor(totalSalesCount * 0.11) },
      { label: 'Jun 23', value: totalEarnings * 0.09, orders: Math.floor(totalSalesCount * 0.09) },
      { label: 'Jun 24', value: totalEarnings * 0.18, orders: Math.floor(totalSalesCount * 0.17) },
      { label: 'Jun 25', value: totalEarnings * 0.15, orders: Math.floor(totalSalesCount * 0.14) },
      { label: 'Jun 26', value: totalEarnings * 0.22, orders: Math.floor(totalSalesCount * 0.21) },
      { label: 'Jun 27', value: totalEarnings * 0.16, orders: Math.floor(totalSalesCount * 0.16) },
    ],
    '30d': [
      { label: 'Week 1', value: totalEarnings * 0.18, orders: Math.floor(totalSalesCount * 0.18) },
      { label: 'Week 2', value: totalEarnings * 0.26, orders: Math.floor(totalSalesCount * 0.25) },
      { label: 'Week 3', value: totalEarnings * 0.22, orders: Math.floor(totalSalesCount * 0.22) },
      { label: 'Week 4', value: totalEarnings * 0.34, orders: Math.floor(totalSalesCount * 0.35) },
    ],
    '12m': [
      { label: 'Jul 25', value: totalEarnings * 0.05, orders: Math.floor(totalSalesCount * 0.05) },
      { label: 'Aug 25', value: totalEarnings * 0.07, orders: Math.floor(totalSalesCount * 0.07) },
      { label: 'Sep 25', value: totalEarnings * 0.06, orders: Math.floor(totalSalesCount * 0.06) },
      { label: 'Oct 25', value: totalEarnings * 0.09, orders: Math.floor(totalSalesCount * 0.08) },
      { label: 'Nov 25', value: totalEarnings * 0.11, orders: Math.floor(totalSalesCount * 0.11) },
      { label: 'Dec 25', value: totalEarnings * 0.14, orders: Math.floor(totalSalesCount * 0.13) },
      { label: 'Jan 26', value: totalEarnings * 0.12, orders: Math.floor(totalSalesCount * 0.12) },
      { label: 'Feb 26', value: totalEarnings * 0.15, orders: Math.floor(totalSalesCount * 0.15) },
      { label: 'Mar 26', value: totalEarnings * 0.13, orders: Math.floor(totalSalesCount * 0.13) },
      { label: 'Apr 26', value: totalEarnings * 0.19, orders: Math.floor(totalSalesCount * 0.18) },
      { label: 'May 26', value: totalEarnings * 0.24, orders: Math.floor(totalSalesCount * 0.23) },
      { label: 'Jun 26', value: totalEarnings * 0.31, orders: Math.floor(totalSalesCount * 0.30) },
    ]
  };

  const activeDataset = SALES_DATA[activePeriod];
  const maxChartValue = Math.max(...activeDataset.map(d => d.value)) || 100;

  // Custom SVG coordinates generator
  const getCoordinates = () => {
    const width = 600;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 25;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    return activeDataset.map((point, index) => {
      const x = paddingLeft + (index / (activeDataset.length - 1)) * graphWidth;
      const y = height - paddingBottom - (point.value / maxChartValue) * graphHeight;
      return { x, y, ...point };
    });
  };

  const coordinates = getCoordinates();
  const pathD = coordinates.length > 0
    ? `M ${coordinates[0].x} ${coordinates[0].y} ` + coordinates.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ')
    : '';

  const areaD = coordinates.length > 0
    ? `${pathD} L ${coordinates[coordinates.length - 1].x} 155 L ${coordinates[0].x} 155 Z`
    : '';

  // Filter products by revenue for Top Products (DesignAura products)
  const topProducts = [...creatorProducts]
    .sort((a, b) => (b.creator.salesCount * b.price) - (a.creator.salesCount * a.price))
    .slice(0, 3);

  // Structured Recent Orders
  const recentOrders = [
    { id: 'OMY-84210', date: '2026-06-27', customer: 'Sarah Jenkins', product: 'Nexus SaaS Premium UI Dashboard Kit', amount: 29.00, status: 'Completed' },
    { id: 'OMY-83945', date: '2026-06-26', customer: 'Devon Keil', product: 'Nexus SaaS Premium UI Dashboard Kit', amount: 29.00, status: 'Completed' },
    { id: 'OMY-83412', date: '2026-06-25', customer: 'Aoki Yamamoto', product: 'Cyberpunk Neon HUD Graphic Vector Pack', amount: 15.00, status: 'Completed' },
    { id: 'OMY-82109', date: '2026-06-23', customer: 'Elena Rostova', product: 'Nexus SaaS Premium UI Dashboard Kit', amount: 29.00, status: 'Completed' },
    { id: 'OMY-81541', date: '2026-06-22', customer: 'Nils Sjöberg', product: 'Nexus SaaS Premium UI Dashboard Kit', amount: 29.00, status: 'Refunded' },
  ];

  // Dynamic Recent Reviews (compiled from current products + fallbacks)
  const allReviews = creatorProducts
    .flatMap(p => p.reviews.map(r => ({ ...r, productTitle: p.title })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Security Alerts list (highly visual)
  const securityAlerts = [
    { id: 'sec-1', level: 'safe', message: 'All listing cryptographic hashes match origin files', time: '2 mins ago' },
    { id: 'sec-2', level: 'warning', message: 'Payout wallet address locked for 24h following update', time: '5 hours ago' },
    { id: 'sec-3', level: 'critical', message: 'Simulated trial of premium escrow service completed', time: '1 day ago' },
  ];

  // Platform Announcements feed
  const platformAnnouncements = [
    { id: 'ann-1', badge: 'PROMOTION', title: '0% Platform Fee Campaign!', description: 'All listings published before July 1st qualify for 0% commission on the first $5,000 in sales.' },
    { id: 'ann-2', badge: 'SYSTEM', title: 'Server Node Migration to Portland East', description: 'Undergoing routine background migration. No downtime is expected on standard deliveries.' },
    { id: 'ann-3', badge: 'POLICIES', title: 'Enhanced PDF Standard Licenses', description: 'Updated template distribution agreements. Read the terms for details.' },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !tagline.trim() || !description.trim()) {
      setErrorMsg('Please fill in required fields (Title, Tagline, Description).');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMsg('Please enter a valid price (>= 0).');
      return;
    }

    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);
    const filesArray = filesIncluded.split(',').map(f => f.trim()).filter(Boolean);

    onPublishProduct({
      title,
      tagline,
      description,
      category,
      price: priceNum,
      tags: tagsArray.length > 0 ? tagsArray : ['Creator', category],
      features: featuresArray.length > 0 ? featuresArray : ['Premium quality source files', 'Instant package ZIP distribution', 'Lifetime free customer updates'],
      filesIncluded: filesArray.length > 0 ? filesArray : [`${title.replace(/\s+/g, '-').toLowerCase()}-source.zip`],
      fileSize: fileSize.trim() || '14.2 MB',
      coverImage: coverGradient,
      creator: {
        name: 'You (Creator)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80',
        badge: 'New Creator',
        salesCount: 0,
        rating: 5.0
      }
    });

    setSuccessMsg('Your new digital asset has been successfully published to OMYRA MALL catalogs!');
    setTitle('');
    setTagline('');
    setDescription('');
    setTags('');
    setFeatures('');
    setFilesIncluded('');
    setPrice('19.00');
    setFileSize('15.4 MB');

    // Smooth scroll back or transition
    setTimeout(() => {
      setSuccessMsg('');
      setActiveSubTab('dashboard');
    }, 3000);
  };

  const handleReplySubmit = (reviewId: string) => {
    if (!replyText[reviewId]?.trim()) return;
    setSubmittedReplies(prev => ({
      ...prev,
      [reviewId]: replyText[reviewId]
    }));
    setReplyText(prev => ({
      ...prev,
      [reviewId]: ''
    }));
  };

  return (
    <div id="creator-dashboard-view" className="space-y-6">
      
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-black text-[#D4FF5E] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
            Seller & Creator Portal
          </span>
          <h1 className="mt-3 font-display text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
            OMYRA <span className="text-[#D4FF5E]">CREATOR STUDIO</span>
          </h1>
          <p className="text-xs text-[#8E9299] font-medium mt-1">
            Real-time balance settlement, responsive performance analysis, and automated digital licensing.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-[#161618] border border-white/10 p-1.5 rounded-2xl w-fit self-start">
          <button
            id="tab-btn-dashboard"
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'dashboard' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Dashboard Hub
          </button>
          <button
            id="tab-btn-listings"
            onClick={() => setActiveSubTab('listings')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'listings' || activeSubTab === 'publish'
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Product Manager ({totalListed})
          </button>
          <button
            id="tab-btn-upload"
            onClick={() => setActiveSubTab('upload')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'upload' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            <Plus className="h-3 w-3" />
            <span>Upload Center (R2)</span>
          </button>
          <button
            id="tab-btn-store"
            onClick={() => setActiveSubTab('store')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'store' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Store Management
          </button>
          <button
            id="tab-btn-orders"
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'orders' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Orders
          </button>
          <button
            id="tab-btn-customers"
            onClick={() => setActiveSubTab('customers')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'customers' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Customers
          </button>
          <button
            id="tab-btn-reviews"
            onClick={() => setActiveSubTab('reviews')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'reviews' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Reviews
          </button>
          <button
            id="tab-btn-analytics"
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'analytics' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            id="tab-btn-earnings"
            onClick={() => setActiveSubTab('earnings')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'earnings' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Earnings
          </button>
          <button
            id="tab-btn-payouts"
            onClick={() => setActiveSubTab('payouts')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'payouts' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Payout Center
          </button>
          <button
            id="tab-btn-marketing"
            onClick={() => setActiveSubTab('marketing')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'marketing' 
                ? 'bg-[#D4FF5E] text-black' 
                : 'text-[#8E9299] hover:text-white'
            }`}
          >
            Marketing Center
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-center text-xs font-bold uppercase tracking-wider text-emerald-400">
          {successMsg}
        </div>
      )}

      {/* RENDER THE CENTRAL DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div id="creator-hub-content" className="space-y-6">
          
          {/* Section 1: Financial & Growth Large Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Revenue / Lifetime Earnings */}
            <div className="rounded-[28px] border border-white/10 bg-[#161618] p-6 relative overflow-hidden flex flex-col justify-between hover:border-[#D4FF5E]/30 transition-all group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-[#D4FF5E]/5 rounded-bl-full flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                <Coins className="h-5 w-5 text-[#D4FF5E]" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-[#8E9299] font-black uppercase tracking-widest block">Total Revenue</span>
                <h3 className="font-display text-2xl font-black text-white">
                  ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-[#8E9299] font-bold">Lifetime Earnings</span>
                <span className="font-mono text-[11px] font-black text-[#D4FF5E]">
                  ${metrics.lifetimeEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Card 2: Available Balance */}
            <div className="rounded-[28px] border border-white/10 bg-[#161618] p-6 relative overflow-hidden flex flex-col justify-between hover:border-[#D4FF5E]/30 transition-all group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-[#D4FF5E]/5 rounded-bl-full flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                <Wallet className="h-5 w-5 text-[#D4FF5E]" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-[#8E9299] font-black uppercase tracking-widest block">Available Balance</span>
                <h3 className="font-display text-2xl font-black text-[#D4FF5E]">
                  ${metrics.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <button 
                  onClick={() => alert(`Sovereign cashout triggered for $${metrics.availableBalance.toFixed(2)} to your connected payout escrow. Settling...`)}
                  className="text-[10px] font-black text-black bg-[#D4FF5E] px-3.5 py-1.5 rounded-lg uppercase tracking-widest hover:bg-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Landmark className="h-3 w-3" />
                  <span>Withdraw Balance</span>
                </button>
                <span className="text-[9px] text-[#8E9299] uppercase tracking-wider font-mono">100% Cleared</span>
              </div>
            </div>

            {/* Card 3: Pending Balance */}
            <div className="rounded-[28px] border border-white/10 bg-[#161618] p-6 relative overflow-hidden flex flex-col justify-between hover:border-[#D4FF5E]/30 transition-all group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-[#D4FF5E]/5 rounded-bl-full flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-[#8E9299] font-black uppercase tracking-widest block">Pending Balance</span>
                <h3 className="font-display text-2xl font-black text-white">
                  ${metrics.pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-[#8E9299] font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#D4FF5E]" />
                  <span>Clears in 3 Days</span>
                </span>
                <span className="text-[9px] text-[#8E9299] uppercase tracking-wider font-mono">Escrow Stage</span>
              </div>
            </div>

            {/* Card 4: Monthly Growth */}
            <div className="rounded-[28px] border border-white/10 bg-[#161618] p-6 relative overflow-hidden flex flex-col justify-between hover:border-[#D4FF5E]/30 transition-all group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-[#D4FF5E]/5 rounded-bl-full flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-[#8E9299] font-black uppercase tracking-widest block">Monthly Growth</span>
                <h3 className="font-display text-2xl font-black text-emerald-400">
                  +{metrics.monthlyGrowth}%
                </h3>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-[#8E9299] font-bold">vs Previous Period</span>
                <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>OUTPERFORMING</span>
                </span>
              </div>
            </div>

          </div>

          {/* Section 2: Secondary Performance Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-11 gap-3">
            
            {/* Metric 1: Total Orders */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-2">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Total Orders</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-lg font-black text-white">{metrics.totalOrders}</span>
                <span className="text-[9px] font-mono text-emerald-400">+8%</span>
              </div>
            </div>

            {/* Metric 2: Total Products */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-2">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Total Products</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-lg font-black text-white">{metrics.totalProducts}</span>
                <span className="text-[9px] font-mono text-[#D4FF5E]">Active</span>
              </div>
            </div>

            {/* Metric 3: Total Downloads */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-2">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Total Downloads</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-lg font-black text-white">{metrics.totalDownloads}</span>
                <span className="text-[8px] text-[#8E9299] font-mono">ZIP Delivery</span>
              </div>
            </div>

            {/* Metric 4: Active Customers */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-2">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Active Customers</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-lg font-black text-white">{metrics.activeCustomers}</span>
                <span className="text-[9px] text-[#D4FF5E] font-black">92%</span>
              </div>
            </div>

            {/* Metric 5: Refund Requests */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-2">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Refund Requests</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-display text-lg font-black text-rose-400">{metrics.refundRequests}</span>
                <span className="text-[8px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                  0 Pending
                </span>
              </div>
            </div>

            {/* Metric 6: Conversion Rate */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-2">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Conversion Rate</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-lg font-black text-white">{metrics.conversionRate}%</span>
                <span className="text-[8px] text-[#8E9299] font-mono">vs avg 2.4%</span>
              </div>
            </div>

            {/* Metric 7: Store Rating */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-3">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Store Rating</span>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="font-display text-lg font-black text-white">{metrics.storeRating}</span>
                <div className="flex gap-0.5 text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400" />
                </div>
              </div>
            </div>

            {/* Metric 8: Product Views */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-2">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Product Views</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-lg font-black text-white">{metrics.productViews.toLocaleString()}</span>
                <span className="text-[8px] text-[#8E9299] font-mono">Hits</span>
              </div>
            </div>

            {/* Metric 9: Wishlist Count */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-2">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Wishlist Count</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-lg font-black text-white">{metrics.wishlistCount}</span>
                <span className="text-[8px] text-rose-400 font-mono">❤</span>
              </div>
            </div>

            {/* Metric 10: Followers */}
            <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-3 flex flex-col justify-between xl:col-span-2">
              <span className="text-[8px] text-[#8E9299] font-black uppercase tracking-widest block">Followers</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-lg font-black text-white">{metrics.followers}</span>
                <span className="text-[8px] text-[#8E9299] font-mono">Sellers Hub</span>
              </div>
            </div>

          </div>

          {/* Section 3: Interactive Sales Graph */}
          <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#D4FF5E]" />
                  <span>OMYRA Live Sales Analytics Graph</span>
                </h3>
                <p className="text-[10px] text-[#8E9299] font-medium">Interactive revenue checkpoints tracked over the selected interval.</p>
              </div>

              {/* Range Selector */}
              <div className="flex items-center gap-1.5 bg-[#0A0A0B] border border-white/10 p-1 rounded-xl w-fit self-start font-mono text-[9px] font-black">
                {(['7d', '30d', '12m'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => { setActivePeriod(period); setHoveredPointIndex(null); }}
                    className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      activePeriod === period 
                        ? 'bg-[#D4FF5E] text-black' 
                        : 'text-[#8E9299] hover:text-white'
                    }`}
                  >
                    {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '12 Months'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Graph Rendering */}
            <div className="relative border border-white/5 bg-[#0A0A0B]/40 rounded-2xl p-4 overflow-hidden">
              
              {/* Overlay Interactive Tooltip */}
              {hoveredPointIndex !== null && coordinates[hoveredPointIndex] && (
                <div 
                  className="absolute bg-[#161618] border border-white/10 rounded-xl p-3 shadow-xl pointer-events-none z-10 space-y-1 min-w-[130px]"
                  style={{
                    left: `${Math.min(coordinates[hoveredPointIndex].x - 50, 450)}px`,
                    top: `10px`
                  }}
                >
                  <p className="text-[9px] text-[#8E9299] font-black uppercase tracking-wider">
                    {coordinates[hoveredPointIndex].label}
                  </p>
                  <p className="text-xs font-bold text-white flex justify-between">
                    <span>Revenue:</span>
                    <span className="text-[#D4FF5E] font-mono">${coordinates[hoveredPointIndex].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </p>
                  <p className="text-xs font-bold text-[#8E9299] flex justify-between">
                    <span>Orders:</span>
                    <span className="text-white font-mono">{coordinates[hoveredPointIndex].orders}</span>
                  </p>
                </div>
              )}

              {/* The SVG Plot */}
              <div className="w-full">
                <svg viewBox="0 0 600 180" className="w-full h-auto text-[#D4FF5E]" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4FF5E" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#D4FF5E" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline grids */}
                  <line x1="45" y1="20" x2="585" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                  <line x1="45" y1="65" x2="585" y2="65" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                  <line x1="45" y1="110" x2="585" y2="110" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                  <line x1="45" y1="155" x2="585" y2="155" stroke="rgba(255,255,255,0.06)" />

                  {/* Shaded Area */}
                  {areaD && <path d={areaD} fill="url(#area-gradient)" className="transition-all duration-500" />}

                  {/* Plot Stroke Path */}
                  {pathD && (
                    <path 
                      d={pathD} 
                      fill="none" 
                      stroke="#D4FF5E" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="transition-all duration-500" 
                    />
                  )}

                  {/* Y Axis Labels (Left-aligned) */}
                  <text x="15" y="25" fill="#8E9299" fontSize="8" fontWeight="black" fontFamily="monospace">
                    ${Math.floor(maxChartValue).toLocaleString()}
                  </text>
                  <text x="15" y="87" fill="#8E9299" fontSize="8" fontWeight="black" fontFamily="monospace">
                    ${Math.floor(maxChartValue * 0.5).toLocaleString()}
                  </text>
                  <text x="15" y="155" fill="#8E9299" fontSize="8" fontWeight="black" fontFamily="monospace">
                    $0
                  </text>

                  {/* Data Point Dots & Interactive Invisible Bars */}
                  {coordinates.map((c, i) => (
                    <g key={i}>
                      {/* Vertical line from active hovered point */}
                      {hoveredPointIndex === i && (
                        <line x1={c.x} y1="20" x2={c.x} y2="155" stroke="rgba(212,255,94,0.3)" strokeWidth="1" strokeDasharray="2,2" />
                      )}

                      {/* Dot Anchor */}
                      <circle 
                        cx={c.x} 
                        cy={c.y} 
                        r={hoveredPointIndex === i ? "5" : "3.5"} 
                        fill={hoveredPointIndex === i ? "#FFFFFF" : "#D4FF5E"} 
                        stroke="#161618" 
                        strokeWidth="1.5" 
                        className="cursor-pointer transition-all duration-300" 
                      />

                      {/* X Axis Labels */}
                      <text x={c.x} y="172" fill="#8E9299" fontSize="8" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                        {c.label}
                      </text>

                      {/* Interactive Hover Area (Transparent Slice) */}
                      <rect
                        x={c.x - (250 / activeDataset.length)}
                        y="0"
                        width={500 / activeDataset.length}
                        height="155"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Section 4: Split Grid for Lists & Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Top Products & Recent Orders */}
            <div className="space-y-6">
              
              {/* Card A: Top Products */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#D4FF5E]" />
                    <span>Top Performing Digital Assets</span>
                  </h3>
                  <span className="text-[9px] font-black text-[#D4FF5E] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-2 py-1 rounded">
                    BY REVENUE
                  </span>
                </div>

                <div className="space-y-3">
                  {topProducts.length === 0 ? (
                    <p className="text-xs text-[#8E9299] text-center py-6 font-bold uppercase tracking-widest">No listings found in catalog</p>
                  ) : (
                    topProducts.map((p, idx) => (
                      <div key={p.id} className="rounded-2xl border border-white/5 bg-[#0A0A0B]/30 p-3 flex items-center justify-between gap-4 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-[#8E9299] font-mono w-4">#{idx + 1}</span>
                          <div className="h-10 w-12 rounded-lg overflow-hidden shrink-0 border border-white/5" style={{ background: p.coverImage }} />
                          <div className="min-w-0">
                            <span className="font-bold text-white text-xs truncate block max-w-[170px] md:max-w-[200px] uppercase">{p.title}</span>
                            <span className="text-[10px] text-[#8E9299] capitalize font-semibold">{p.category} • {p.fileSize}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-black text-[#D4FF5E] block">${(p.creator.salesCount * p.price).toLocaleString()}</span>
                          <span className="text-[9px] text-[#8E9299] font-bold block">{p.creator.salesCount} sold</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card B: Recent Orders */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-[#D4FF5E]" />
                    <span>Recent Sales Deliveries</span>
                  </h3>
                  <span className="text-[9px] font-mono text-[#8E9299]">Live feed</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[#8E9299] uppercase tracking-widest text-[8px] font-black border-b border-white/5">
                      <tr>
                        <th className="pb-3 pr-2">Order ID</th>
                        <th className="pb-3 pr-2">Buyer</th>
                        <th className="pb-3 pr-2">Asset</th>
                        <th className="pb-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px] font-semibold">
                      {recentOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 font-mono text-white text-[10px]">{ord.id}</td>
                          <td className="py-2.5 text-white">{ord.customer}</td>
                          <td className="py-2.5 text-[#8E9299] truncate max-w-[120px]" title={ord.product}>{ord.product}</td>
                          <td className="py-2.5 text-right font-mono text-[#D4FF5E]">${ord.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Customer Reviews, Security & News */}
            <div className="space-y-6">
              
              {/* Card C: Recent Reviews */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#D4FF5E]" />
                    <span>Recent Customer Reviews</span>
                  </h3>
                  <span className="text-[9px] font-black text-[#D4FF5E] font-mono">
                    {allReviews.length} total
                  </span>
                </div>

                <div className="space-y-3">
                  {allReviews.length === 0 ? (
                    <p className="text-xs text-[#8E9299] text-center py-6 font-bold uppercase tracking-widest">No reviews submitted yet</p>
                  ) : (
                    allReviews.map((rev) => (
                      <div key={rev.id} className="rounded-2xl border border-white/5 bg-[#0A0A0B]/30 p-4 space-y-2 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img src={rev.avatar} alt={rev.user} className="h-6 w-6 rounded-full object-cover border border-white/10" />
                            <div>
                              <span className="text-xs font-bold text-white block">{rev.user}</span>
                              <span className="text-[8px] text-[#8E9299] font-mono">Review of {rev.productTitle}</span>
                            </div>
                          </div>
                          <div className="flex gap-0.5 text-amber-400 shrink-0">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#8E9299] leading-relaxed italic">
                          "{rev.comment}"
                        </p>

                        {/* Interactive Developer Reply Box */}
                        {submittedReplies[rev.id] ? (
                          <div className="mt-2 bg-[#D4FF5E]/5 border border-[#D4FF5E]/10 rounded-xl p-2.5 text-[11px] space-y-1">
                            <p className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest">Your Developer Reply:</p>
                            <p className="text-[#F4F4F4]">{submittedReplies[rev.id]}</p>
                          </div>
                        ) : (
                          <div className="mt-2 flex gap-1.5 pt-1">
                            <input 
                              type="text"
                              placeholder="Write a public developer reply..."
                              value={replyText[rev.id] || ''}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [rev.id]: e.target.value }))}
                              className="w-full text-[11px] rounded-lg border border-white/15 bg-black px-2.5 py-1 text-white focus:outline-none focus:border-[#D4FF5E]"
                            />
                            <button
                              onClick={() => handleReplySubmit(rev.id)}
                              className="text-[9px] font-black text-black bg-[#D4FF5E] hover:bg-white px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card D: Security Alerts & Checks */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#D4FF5E]" />
                    <span>System Security & Integrity</span>
                  </h3>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    LEVEL: SECURE
                  </span>
                </div>

                <div className="space-y-3">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="rounded-xl border border-white/5 bg-[#0A0A0B]/20 p-3 flex items-start gap-2.5">
                      {alert.level === 'safe' && <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                      {alert.level === 'warning' && <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />}
                      {alert.level === 'critical' && <ShieldAlert className="h-4 w-4 text-[#D4FF5E] shrink-0 mt-0.5" />}
                      
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-semibold text-white leading-tight">{alert.message}</p>
                        <p className="text-[8px] text-[#8E9299] font-mono uppercase">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card E: Platform Announcements */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-[#D4FF5E]" />
                    <span>OMYRA Platform Announcements</span>
                  </h3>
                  <span className="text-[8px] text-[#8E9299] font-mono">Platform Feed</span>
                </div>

                <div className="space-y-3">
                  {platformAnnouncements.map((ann) => (
                    <div key={ann.id} className="rounded-2xl border border-white/5 bg-[#0A0A0B]/40 p-4 space-y-1.5 hover:border-[#D4FF5E]/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest ${
                          ann.badge === 'PROMOTION' ? 'bg-[#D4FF5E]/10 text-[#D4FF5E] border border-[#D4FF5E]/20' : 'bg-[#161618] text-[#8E9299] border border-white/5'
                        }`}>
                          {ann.badge}
                        </span>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{ann.title}</h4>
                      </div>
                      <p className="text-xs text-[#8E9299] leading-relaxed">
                        {ann.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* RENDER PRODUCT MANAGER */}
      {(activeSubTab === 'listings' || activeSubTab === 'publish') && (
        <ProductManager 
          products={products}
          onUpdateProducts={onUpdateProducts}
          onPublishProduct={onPublishProduct}
          setActiveSubTab={setActiveSubTab}
        />
      )}

      {/* RENDER UPLOAD CENTER */}
      {activeSubTab === 'upload' && (
        <UploadCenter />
      )}

      {/* RENDER STORE MANAGEMENT FEATURE */}
      {activeSubTab === 'store' && (
        <div id="store-management-portal" className="space-y-6">
          
          {/* Live Storefront Mockup Preview */}
          <div className="rounded-[32px] border border-white/10 bg-[#161618] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-[#0A0A0B]/20 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#D4FF5E]" />
                <span>Live Storefront Mockup Preview</span>
              </h3>
              <span className="text-[9px] font-mono text-[#8E9299]">Interactive visual sandbox</span>
            </div>

            <div className="p-6">
              {/* Mini Interactive Showcase Box */}
              <div className="rounded-2xl border border-white/5 bg-black/40 overflow-hidden relative">
                {/* Store Banner */}
                <div 
                  className="h-28 md:h-36 w-full relative transition-all duration-300 flex items-end justify-end p-4"
                  style={{ background: storeBanner }}
                >
                  <span className="text-[9px] font-mono bg-black/40 text-white/80 px-2 py-1 rounded backdrop-blur">
                    Banner Preview
                  </span>
                </div>

                {/* Profile Overhang & Actions */}
                <div className="px-6 pb-6 pt-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 -mt-10 sm:-mt-12">
                    <div className="relative group">
                      <img 
                        src={storeLogo} 
                        alt="Store Logo" 
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-[#161618] object-cover bg-[#0A0A0B]" 
                      />
                      {storeVerification === 'verified' && (
                        <div className="absolute bottom-0 right-0 bg-[#D4FF5E] text-black rounded-full p-1 border-2 border-[#161618]" title="OMYRA Verified Merchant">
                          <ShieldCheck className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    <div className="text-center sm:text-left space-y-0.5">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                        <h4 className="font-display text-base font-black uppercase text-white tracking-tight">{storeName || 'My Digital Store'}</h4>
                        {isFeaturedStore && (
                          <span className="text-[8px] font-black bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 text-[#D4FF5E] px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Featured Store
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-[#8E9299]">
                        omyra.mall/creator/<span className="text-white font-semibold">{storeUrl || 'untitled'}</span>
                      </p>
                      
                      {/* Active Status & Category badges */}
                      <div className="flex flex-wrap gap-1.5 items-center justify-center sm:justify-start pt-1.5">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isOpen 
                            ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                            : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                        }`}>
                          {isOpen ? '● Open / Active' : '● On Vacation'}
                        </span>
                        {storeCategories.map(cat => (
                          <span key={cat} className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 text-[#8E9299]">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                    {website && (
                      <a href={website} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-white border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                        <Globe className="h-3 w-3" />
                        <span>Website</span>
                      </a>
                    )}
                    {portfolio && (
                      <a href={portfolio} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-white border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                        <Share2 className="h-3 w-3" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Store Description Preview */}
                <div className="px-6 pb-6 pt-2 border-t border-white/5 mt-2">
                  <p className="text-xs text-[#8E9299] max-w-2xl leading-relaxed text-center sm:text-left">
                    {storeDescription || 'No description provided. Introduce your studio to digital collectors!'}
                  </p>
                  
                  {/* Social Icons row */}
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-4 text-[#8E9299]">
                    {twitter && <Twitter className="h-4 w-4 hover:text-[#D4FF5E] cursor-pointer" />}
                    {github && <Github className="h-4 w-4 hover:text-[#D4FF5E] cursor-pointer" />}
                    {linkedin && <Linkedin className="h-4 w-4 hover:text-[#D4FF5E] cursor-pointer" />}
                    {instagram && <Instagram className="h-4 w-4 hover:text-[#D4FF5E] cursor-pointer" />}
                  </div>

                  {!isOpen && vacationMessage && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{vacationMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Section Selector & Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Nav Tabs (Responsive block) */}
            <div className="lg:col-span-3 space-y-2">
              <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest pl-2 block mb-1">
                Management Modules
              </span>
              
              {/* Desktop view vertical tabs */}
              <div className="hidden lg:flex flex-col gap-1.5 bg-[#161618] border border-white/10 p-2 rounded-2xl">
                <button
                  onClick={() => setStoreSettingsTab('general')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                    storeSettingsTab === 'general' ? 'bg-[#D4FF5E] text-black font-black' : 'text-[#8E9299] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>1. General Details</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setStoreSettingsTab('socials')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                    storeSettingsTab === 'socials' ? 'bg-[#D4FF5E] text-black font-black' : 'text-[#8E9299] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>2. Socials & Links</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setStoreSettingsTab('business')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                    storeSettingsTab === 'business' ? 'bg-[#D4FF5E] text-black font-black' : 'text-[#8E9299] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>3. Business & Tax Info</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setStoreSettingsTab('seo')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                    storeSettingsTab === 'seo' ? 'bg-[#D4FF5E] text-black font-black' : 'text-[#8E9299] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>4. SEO & Verification</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Mobile view horizontal / select tabs */}
              <div className="lg:hidden flex overflow-x-auto gap-1.5 p-1 bg-[#161618] border border-white/10 rounded-xl max-w-full scrollbar-none">
                <button
                  onClick={() => setStoreSettingsTab('general')}
                  className={`shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    storeSettingsTab === 'general' ? 'bg-[#D4FF5E] text-black' : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setStoreSettingsTab('socials')}
                  className={`shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    storeSettingsTab === 'socials' ? 'bg-[#D4FF5E] text-black' : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  Socials & Links
                </button>
                <button
                  onClick={() => setStoreSettingsTab('business')}
                  className={`shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    storeSettingsTab === 'business' ? 'bg-[#D4FF5E] text-black' : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  Business & Tax
                </button>
                <button
                  onClick={() => setStoreSettingsTab('seo')}
                  className={`shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    storeSettingsTab === 'seo' ? 'bg-[#D4FF5E] text-black' : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  SEO & Verification
                </button>
              </div>

            </div>

            {/* Right Form Inputs based on sub-tab */}
            <div className="lg:col-span-9 bg-[#161618] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
              
              {/* TAB 1: GENERAL INFO */}
              {storeSettingsTab === 'general' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">General Details & Identity</h3>
                    <p className="text-[10px] text-[#8E9299] font-medium mt-1">Configure your storefront name, handle, logo and active trading hours.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Store Name */}
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Store Name (Public)</label>
                      <input 
                        type="text" 
                        value={storeName} 
                        onChange={(e) => setStoreName(e.target.value)} 
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                      />
                    </div>

                    {/* Store URL */}
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Store URL Slug</label>
                      <div className="flex rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0B]">
                        <span className="text-[10px] text-[#8E9299] bg-white/5 border-r border-white/15 px-3 flex items-center font-mono">omyra.mall/</span>
                        <input 
                          type="text" 
                          value={storeUrl} 
                          onChange={(e) => setStoreUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))} 
                          className="w-full bg-transparent px-3 py-2.5 text-xs text-[#F4F4F4] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo and Banner upload controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Logo upload simulator */}
                    <div className="rounded-xl border border-white/5 bg-[#0A0A0B]/30 p-4 space-y-3">
                      <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Store Logo</span>
                      <div className="flex items-center gap-3">
                        <img src={storeLogo} alt="Logo thumbnail" className="h-12 w-12 rounded-full border border-white/10 object-cover" />
                        <div className="flex-1">
                          <button
                            type="button"
                            disabled={isUploadingLogo}
                            onClick={() => {
                              setIsUploadingLogo(true);
                              setTimeout(() => {
                                // Simulate switching to high quality premium abstract logo
                                setStoreLogo('https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&fit=crop&q=80');
                                setIsUploadingLogo(false);
                              }, 1200);
                            }}
                            className="text-[9px] font-black text-black bg-[#D4FF5E] hover:bg-white disabled:bg-white/10 disabled:text-white/40 px-3.5 py-2 rounded-lg uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            <span>{isUploadingLogo ? 'Processing (45%)...' : 'Upload New Logo'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Banner gradient selector */}
                    <div className="rounded-xl border border-white/5 bg-[#0A0A0B]/30 p-4 space-y-3">
                      <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Choose Banner Design Accent</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: 'Sunset Fusion', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
                          { name: 'Emerald Aura', value: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' },
                          { name: 'Dark Void', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }
                        ].map((grad, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setStoreBanner(grad.value)}
                            className={`h-7 rounded-lg border relative overflow-hidden transition-all ${
                              storeBanner === grad.value ? 'border-white scale-105 shadow-md' : 'border-white/5 hover:border-white/25'
                            }`}
                            style={{ background: grad.value }}
                            title={grad.name}
                          >
                            {storeBanner === grad.value && (
                              <span className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Store Description */}
                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Store Public Description</label>
                    <textarea 
                      rows={3}
                      value={storeDescription} 
                      onChange={(e) => setStoreDescription(e.target.value)} 
                      placeholder="Introduce your studio to digital collectors..."
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                    />
                  </div>

                  {/* Store Categories Checkboxes */}
                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-2">Primary Trade Specialties</label>
                    <div className="flex flex-wrap gap-2">
                      {(['templates', 'ebooks', 'design', 'code', 'audio'] as const).map(cat => {
                        const isSelected = storeCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setStoreCategories(storeCategories.filter(c => c !== cat));
                              } else {
                                setStoreCategories([...storeCategories, cat]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                              isSelected 
                                ? 'bg-[#D4FF5E]/10 text-[#D4FF5E] border-[#D4FF5E]/30' 
                                : 'bg-transparent text-[#8E9299] border-white/10 hover:border-white/20'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Open/Closed Trading Status */}
                  <div className="rounded-2xl border border-white/5 bg-[#0A0A0B]/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest block">Store Operational Status</span>
                        <span className="text-[9px] text-[#8E9299]">Toggle whether users can immediately buy and request updates on your assets.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isOpen ? 'bg-[#D4FF5E]' : 'bg-white/10'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                            isOpen ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {!isOpen && (
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="block text-[10px] font-black text-amber-400 uppercase tracking-widest">Vacation/Offline Alert Message</label>
                        <input 
                          type="text" 
                          value={vacationMessage} 
                          onChange={(e) => setVacationMessage(e.target.value)} 
                          className="w-full rounded-xl border border-amber-500/20 bg-[#0A0A0B] px-3.5 py-2 text-xs text-amber-300 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SOCIALS & LINKS */}
              {storeSettingsTab === 'socials' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Social & Platform Connections</h3>
                    <p className="text-[10px] text-[#8E9299] font-medium mt-1">Provide external checkpoints where buyers can audit your professional profile.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Website URL */}
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Official Website</label>
                      <div className="flex rounded-xl border border-white/10 bg-[#0A0A0B] overflow-hidden">
                        <span className="text-[10px] text-[#8E9299] bg-white/5 border-r border-white/15 px-3 flex items-center"><Globe className="h-3.5 w-3.5" /></span>
                        <input 
                          type="text" 
                          value={website} 
                          onChange={(e) => setWebsite(e.target.value)} 
                          placeholder="https://mywebsite.com"
                          className="w-full bg-transparent px-3 py-2.5 text-xs text-[#F4F4F4] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Portfolio URL */}
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Dribbble / Behance Portfolio</label>
                      <div className="flex rounded-xl border border-white/10 bg-[#0A0A0B] overflow-hidden">
                        <span className="text-[10px] text-[#8E9299] bg-white/5 border-r border-white/15 px-3 flex items-center"><Share2 className="h-3.5 w-3.5" /></span>
                        <input 
                          type="text" 
                          value={portfolio} 
                          onChange={(e) => setPortfolio(e.target.value)} 
                          placeholder="https://dribbble.com/mystudio"
                          className="w-full bg-transparent px-3 py-2.5 text-xs text-[#F4F4F4] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Twitter / X */}
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Twitter / X profile</label>
                      <div className="flex rounded-xl border border-white/10 bg-[#0A0A0B] overflow-hidden">
                        <span className="text-[10px] text-[#8E9299] bg-white/5 border-r border-white/15 px-3 flex items-center"><Twitter className="h-3.5 w-3.5" /></span>
                        <input 
                          type="text" 
                          value={twitter} 
                          onChange={(e) => setTwitter(e.target.value)} 
                          placeholder="https://twitter.com/myhandle"
                          className="w-full bg-transparent px-3 py-2.5 text-xs text-[#F4F4F4] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* GitHub */}
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">GitHub Account</label>
                      <div className="flex rounded-xl border border-white/10 bg-[#0A0A0B] overflow-hidden">
                        <span className="text-[10px] text-[#8E9299] bg-white/5 border-r border-white/15 px-3 flex items-center"><Github className="h-3.5 w-3.5" /></span>
                        <input 
                          type="text" 
                          value={github} 
                          onChange={(e) => setGithub(e.target.value)} 
                          placeholder="https://github.com/myorg"
                          className="w-full bg-transparent px-3 py-2.5 text-xs text-[#F4F4F4] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">LinkedIn Page</label>
                      <div className="flex rounded-xl border border-white/10 bg-[#0A0A0B] overflow-hidden">
                        <span className="text-[10px] text-[#8E9299] bg-white/5 border-r border-white/15 px-3 flex items-center"><Linkedin className="h-3.5 w-3.5" /></span>
                        <input 
                          type="text" 
                          value={linkedin} 
                          onChange={(e) => setLinkedin(e.target.value)} 
                          placeholder="https://linkedin.com/company/mystudio"
                          className="w-full bg-transparent px-3 py-2.5 text-xs text-[#F4F4F4] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Instagram Feed</label>
                      <div className="flex rounded-xl border border-white/10 bg-[#0A0A0B] overflow-hidden">
                        <span className="text-[10px] text-[#8E9299] bg-white/5 border-r border-white/15 px-3 flex items-center"><Instagram className="h-3.5 w-3.5" /></span>
                        <input 
                          type="text" 
                          value={instagram} 
                          onChange={(e) => setInstagram(e.target.value)} 
                          placeholder="https://instagram.com/myfeed"
                          className="w-full bg-transparent px-3 py-2.5 text-xs text-[#F4F4F4] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BUSINESS & TAX INFO */}
              {storeSettingsTab === 'business' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Merchant Business & Tax Information</h3>
                    <p className="text-[10px] text-[#8E9299] font-medium mt-1">Strictly confidential registry used exclusively to generate legal standard invoices and manage split-tax compliance.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Legal Entity Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Business Registered Name</label>
                        <input 
                          type="text" 
                          value={businessName} 
                          onChange={(e) => setBusinessName(e.target.value)} 
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Business Registration Number (e.g. LLC / CORP)</label>
                        <input 
                          type="text" 
                          value={businessRegistration} 
                          onChange={(e) => setBusinessRegistration(e.target.value)} 
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Business Physical Address</label>
                      <input 
                        type="text" 
                        value={businessAddress} 
                        onChange={(e) => setBusinessAddress(e.target.value)} 
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                      />
                    </div>

                    {/* Tax Specifics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Tax EIN / Tax ID</label>
                        <input 
                          type="text" 
                          value={taxId} 
                          onChange={(e) => setTaxId(e.target.value)} 
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Registered Tax Country</label>
                        <input 
                          type="text" 
                          value={taxCountry} 
                          onChange={(e) => setTaxCountry(e.target.value)} 
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">EU/Global VAT Number</label>
                        <input 
                          type="text" 
                          value={vatNumber} 
                          onChange={(e) => setVatNumber(e.target.value)} 
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                        />
                      </div>
                    </div>

                    {/* Interactive document uploader */}
                    <div className="rounded-xl border border-white/5 bg-[#0A0A0B]/30 p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Upload Certified Tax Form W-9 / W-8BEN</span>
                        <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">PDF ONLY</span>
                      </div>
                      
                      <div className="border border-dashed border-white/15 rounded-xl p-4 text-center space-y-2">
                        <FileText className="h-6 w-6 text-[#8E9299] mx-auto" />
                        <div className="space-y-0.5">
                          <p className="text-xs text-[#F4F4F4] font-bold uppercase tracking-wider">Drag & drop your tax file or browse</p>
                          <p className="text-[9px] text-[#8E9299]">Current file loaded: <span className="text-[#D4FF5E] font-mono">w9_designaura_signed.pdf</span> (1.4MB)</p>
                        </div>
                        <button
                          type="button"
                          disabled={isUploadingTaxDoc}
                          onClick={() => {
                            setIsUploadingTaxDoc(true);
                            setTimeout(() => {
                              alert('Tax document synchronized successfully on the secure fileserver!');
                              setIsUploadingTaxDoc(false);
                            }, 1500);
                          }}
                          className="text-[9px] font-black text-black bg-[#D4FF5E] hover:bg-white px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all cursor-pointer inline-block"
                        >
                          {isUploadingTaxDoc ? 'Encrypting & Syncing...' : 'Re-upload / Update Form'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SEO & FEATURED STORE */}
              {storeSettingsTab === 'seo' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">SEO Optimizations & Featured Controls</h3>
                    <p className="text-[10px] text-[#8E9299] font-medium mt-1">Configure search metadata and storefront discovery settings.</p>
                  </div>

                  {/* SEO details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Search Engine Title (Meta Title)</label>
                      <input 
                        type="text" 
                        value={seoTitle} 
                        onChange={(e) => setSeoTitle(e.target.value)} 
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Search Engine Meta Description</label>
                      <textarea 
                        rows={3}
                        value={seoMetaDescription} 
                        onChange={(e) => setSeoMetaDescription(e.target.value)} 
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Meta Keywords (Comma separated list)</label>
                      <input 
                        type="text" 
                        value={seoKeywords} 
                        onChange={(e) => setSeoKeywords(e.target.value)} 
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                      />
                    </div>
                  </div>

                  {/* Verification Status & Featured Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                    
                    {/* Featured Store setting */}
                    <div className="rounded-xl border border-white/5 bg-[#0A0A0B]/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Featured Store Hub</span>
                        <button
                          type="button"
                          onClick={() => setIsFeaturedStore(!isFeaturedStore)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isFeaturedStore ? 'bg-[#D4FF5E]' : 'bg-white/10'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                              isFeaturedStore ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#8E9299] leading-relaxed">
                        Promote this storefront on the homepage of OMYRA MALL. Recommended when introducing active collection drops.
                      </p>

                      {isFeaturedStore && (
                        <div className="space-y-1.5 animate-fadeIn">
                          <label className="block text-[9px] font-black text-white uppercase tracking-widest">Select Featured Specialization Category</label>
                          <select 
                            value={featuredCategory}
                            onChange={(e) => setFeaturedCategory(e.target.value as any)}
                            className="w-full rounded-lg border border-white/10 bg-[#0A0A0B] px-2.5 py-1.5 text-[11px] text-[#F4F4F4] focus:outline-none"
                          >
                            <option value="templates">Templates (Premium Systems)</option>
                            <option value="ebooks">Ebooks & Primers</option>
                            <option value="design">Design Systems & Vectors</option>
                            <option value="code">Web Code & Core Services</option>
                            <option value="audio">Audio Loops & Synths</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Merchant Verification status */}
                    <div className="rounded-xl border border-white/5 bg-[#0A0A0B]/30 p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">Sovereign Verification Badge</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest ${
                          storeVerification === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-[#8E9299]'
                        }`}>
                          {storeVerification === 'verified' ? 'VERIFIED MERCHANT' : 'UNVERIFIED'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8E9299] leading-relaxed">
                        Verification validates your brand and protects listings from malicious digital replication.
                      </p>

                      {storeVerification === 'verified' ? (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 flex items-start gap-2 text-[10px] text-emerald-400 font-semibold leading-relaxed font-mono">
                          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>Passed deep audits & holds standard verified status.</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setStoreVerification('pending');
                            setTimeout(() => {
                              setStoreVerification('verified');
                              alert('Cryptographic proof audits verified! Verified status established.');
                            }, 2000);
                          }}
                          className="w-full text-center text-[10px] font-black text-black bg-[#D4FF5E] hover:bg-white py-2 rounded-lg uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          {storeVerification === 'pending' ? 'Verifying Identity Proof...' : 'Request Merchant Audits'}
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* SAVE FORM ACTION */}
              <div className="border-t border-white/5 pt-5 flex justify-between items-center flex-wrap gap-4">
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Drafts autosaved locally on this terminal</span>
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('dashboard')}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#8E9299] hover:text-white transition-colors"
                  >
                    Return to Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Store configurations synchronized perfectly across all public OMYRA endpoints!');
                    }}
                    className="rounded-xl bg-[#D4FF5E] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-black hover:bg-[#c3ec4e] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Synchronize Store Details</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* RENDER NEW ESCROW ORDER LEDGER MODULE */}
      {activeSubTab === 'orders' && (
        <OrderManager />
      )}

      {/* RENDER NEW CRM CUSTOMER MANAGEMENT MODULE */}
      {activeSubTab === 'customers' && (
        <CustomerManager />
      )}

      {/* RENDER NEW REPUTATION & REVIEWS MODERATION MODULE */}
      {activeSubTab === 'reviews' && (
        <ReviewManager />
      )}

      {/* RENDER NEW ANALYTICS MODULE */}
      {activeSubTab === 'analytics' && (
        <AnalyticsManager />
      )}

      {/* RENDER NEW EARNINGS MODULE */}
      {activeSubTab === 'earnings' && (
        <EarningsManager />
      )}

      {/* RENDER NEW PAYOUTS MODULE */}
      {activeSubTab === 'payouts' && (
        <PayoutCenter />
      )}

      {/* RENDER NEW MARKETING MODULE */}
      {activeSubTab === 'marketing' && (
        <MarketingCenter />
      )}

    </div>
  );
}
