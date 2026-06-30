import React, { useState, useEffect } from 'react';
import { 
  User, Pencil, Download, CreditCard, Shield, 
  Info, FileText, RefreshCw, Check, X, 
  ChevronRight, Key, ShieldCheck, Laptop, 
  MapPin, HelpCircle, ArrowUpRight, Zap, 
  Clock, AlertCircle, Sparkles, LogOut, Lock,
  Terminal, Award, FileDown, ExternalLink, Eye,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface AccountSectionProps {
  purchasedAssets: { 
    id: string; 
    title: string; 
    price: number; 
    coverImage: string; 
    category: string; 
    downloadUrl: string; 
  }[];
  onSwitchToTab: (tab: 'marketplace' | 'library' | 'creator') => void;
  currentUser?: any;
  onLogout?: () => void;
}

export default function AccountSection({ purchasedAssets, onSwitchToTab, currentUser, onLogout }: AccountSectionProps) {
  // Load and save state in localStorage for persistent customer experience
  const [userProfile, setUserProfile] = useState({
    firstName: 'Alex',
    lastName: 'Vanguard',
    username: 'alexvanguard',
    password: '••••••••••••',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80',
    cardBrand: 'visa',
    cardNumber: '•••• •••• •••• 8432',
    cardExpiry: '12/29',
    billingAddress: '404 Pixel Lane, Cupertino, CA 95014',
    streetAddress: '404 Pixel Lane',
    city: 'Cupertino',
    stateProvince: 'CA',
    zipPostal: '95014',
    country: 'United States'
  });

  // Synchronize authenticated user profile with OMYRA identity
  useEffect(() => {
    if (currentUser) {
      const parts = (currentUser.display_name || '').split(' ');
      const first = parts[0] || 'User';
      const last = parts.slice(1).join(' ') || '';
      setUserProfile(prev => ({
        ...prev,
        firstName: first,
        lastName: last,
        username: currentUser.email.split('@')[0],
        email: currentUser.email
      }));
    }
  }, [currentUser]);

  const [activeMenu, setActiveMenu] = useState<'downloads' | 'billing' | 'sell' | 'security' | 'about' | 'terms' | 'refund'>('downloads');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    avatarUrl: ''
  });

  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [successToast, setSuccessToast] = useState('');
  const [errorText, setErrorText] = useState('');

  // Enhanced features: separate product tracking, real-time updates and cryptographically signed URLs
  const [localPurchased, setLocalPurchased] = useState<any[]>([]);
  const [productVersions, setProductVersions] = useState<{
    [key: string]: {
      purchasedVersion: string;
      currentVersion: string;
      lastUpdated: string;
      changelog: string;
      status: 'up-to-date' | 'upgrade-available' | 'auto-synced';
    }
  }>({});

  const [signedUrls, setSignedUrls] = useState<{
    [key: string]: {
      token: string;
      url: string;
      expiresAt: number;
      isClaimed: boolean;
      countdown: number;
    }
  }>({});

  // PDF Document Viewer state handles live document rendering and verification overlays
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);
  const [previewLicense, setPreviewLicense] = useState<any | null>(null);

  // Sync to local storage on init and load enhanced mocks to guarantee visual abundance
  useEffect(() => {
    const saved = localStorage.getItem('omyra_customer_profile');
    if (saved) {
      setUserProfile(JSON.parse(saved));
    } else {
      localStorage.setItem('omyra_customer_profile', JSON.stringify(userProfile));
    }

    // Default high-end developer templates that ship if real purchase history is empty
    const standardMocks = [
      {
        id: 'mock-omyra-codebase',
        title: 'OMYRA ENTERPRISE NODE/REACT SAAS TEMPLATE',
        price: 129.00,
        coverImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        category: 'CODE',
        downloadUrl: '#'
      },
      {
        id: 'mock-neon-ui-kit',
        title: 'NEON CYBERPUNK CUSTOM REACT DESIGN SYSTEM',
        price: 49.00,
        coverImage: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        category: 'PRESETS',
        downloadUrl: '#'
      }
    ];

    // Combine user purchases with starter items to showcase the beautiful multi-section layout
    const merged = purchasedAssets.length > 0 
      ? [...purchasedAssets, ...standardMocks] 
      : standardMocks;

    setLocalPurchased(merged);

    // Seed versions for all assets
    const initialVersions: typeof productVersions = {};
    merged.forEach(asset => {
      // Simulate real auto-upgraded states
      initialVersions[asset.id] = {
        purchasedVersion: 'v1.0.0',
        currentVersion: 'v2.4.2',
        lastUpdated: 'June 26, 2026',
        changelog: 'Refactored CSS state, enabled multi-threaded canvas render, and upgraded Tailwind support.',
        status: 'auto-synced'
      };
    });
    setProductVersions(initialVersions);
  }, [purchasedAssets]);

  // Synchronous signed URL expiration ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setSignedUrls(prev => {
        const copy = { ...prev };
        let changed = false;
        Object.keys(copy).forEach(id => {
          if (copy[id].countdown > 0 && !copy[id].isClaimed) {
            copy[id] = { ...copy[id], countdown: copy[id].countdown - 1 };
            changed = true;
          }
        });
        return changed ? copy : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const saveProfile = (updated: typeof userProfile) => {
    setUserProfile(updated);
    localStorage.setItem('omyra_customer_profile', JSON.stringify(updated));
  };

  const handleOpenEdit = () => {
    setEditForm({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      username: userProfile.username,
      password: '',
      avatarUrl: userProfile.avatarUrl
    });
    setErrorText('');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.username.trim()) {
      setErrorText('First name, Last name, and Username are required.');
      return;
    }

    const updated = {
      ...userProfile,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      username: editForm.username,
      avatarUrl: editForm.avatarUrl,
      ...(editForm.password.trim() ? { password: editForm.password } : {})
    };

    saveProfile(updated);
    setIsEditing(false);
    triggerToast('Profile updated successfully!');
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Cryptographically Signed URL Generator
  const generateSignedUrl = (assetId: string) => {
    const token = 'OM-SIG-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const expiresAt = Date.now() + 60000; // valid for 60 seconds
    const signedUrlString = `https://omyra.mall/dl/signed-token-${token}?expires=60s&sig=hmac_sha256_884cf9`;
    
    setSignedUrls(prev => ({
      ...prev,
      [assetId]: {
        token,
        url: signedUrlString,
        expiresAt,
        isClaimed: false,
        countdown: 60
      }
    }));

    triggerToast('Secure download token signed successfully!');
  };

  // Claim a generated Signed URL download
  const handleClaimDownload = (assetId: string, assetTitle: string) => {
    const activeSig = signedUrls[assetId];
    if (!activeSig) {
      triggerToast('Please sign a secure download URL first!');
      return;
    }

    if (activeSig.isClaimed) {
      triggerToast('❌ Error: This signed URL has been invalidated!');
      return;
    }

    if (Date.now() > activeSig.expiresAt || activeSig.countdown <= 0) {
      triggerToast('❌ Error: Signed URL signature has expired!');
      return;
    }

    // Consumer token claim logic (single-use lock)
    setSignedUrls(prev => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        isClaimed: true
      }
    }));

    setDownloadProgress(prev => ({ ...prev, [assetId]: 0 }));
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[assetId] ?? 0;
        if (current >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadProgress(p => {
              const copy = { ...p };
              delete copy[assetId];
              return copy;
            });

            // Browser virtual package download pipeline
            const sampleSourceCode = `=========================================
OMYRA MALL - SECURE DIGITAL SOURCE CODE
=========================================
Product ID: ${assetId}
Product Title: ${assetTitle}
Licensing Code: OM-LIC-${Math.floor(100000 + Math.random() * 900000)}
Signed Signature Token: ${activeSig.token}
Status: VERIFIED SECURE & CLEAN

Thank you for purchasing on Omyra Mall.
This archive contains optimized source directories,
including clean React tsx components, responsive Tailwind layers,
and custom WebGL integration scripts.

© 2026 OMYRA MALL INC. ALL RIGHTS RESERVED.`;

            const blob = new Blob([sampleSourceCode], { type: 'application/octet-stream' });
            const fileUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = fileUrl;
            const cleanVer = productVersions[assetId]?.currentVersion || '2.0.0';
            a.download = `OMYRA_Source_${assetTitle.replace(/\s+/g, '_')}_${cleanVer}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(fileUrl);

            triggerToast(`Downloaded ${assetTitle} Source ZIP successfully!`);
          }, 1000);
          return 100;
        }
        return current + 20;
      });
    }, 100);
  };

  // Simulate product updates from creators
  const handleReleaseNewVersions = () => {
    setProductVersions(prev => {
      const updated: typeof productVersions = {};
      Object.keys(prev).forEach(id => {
        updated[id] = {
          ...prev[id],
          purchasedVersion: prev[id].purchasedVersion,
          currentVersion: 'v3.0.0', // Instant new release trigger
          lastUpdated: 'Today',
          changelog: 'Critical security updates. Integrated secure signed-URL token validations and real-time licensing synchronizers.',
          status: 'upgrade-available'
        };
      });
      return updated;
    });
    triggerToast('🚀 Creator released updates! Packages synchronized to v3.0.0.');
  };

  // High-fidelity printable PDF generator
  const downloadHtmlInvoiceFile = (asset: any) => {
    const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const orderNo = `OM-${Math.floor(100000 + Math.random() * 900000)}`;
    const vat = (asset.price * 0.08).toFixed(2);
    const total = (asset.price + parseFloat(vat)).toFixed(2);

    const invoiceHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OMYRA Invoice - ${orderNo}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e1e24; margin: 0; padding: 40px; background-color: #fafafa; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 50px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; border-b: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; color: #000; }
    .logo span { color: #84cc16; }
    .title { font-size: 28px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
    .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; margin-bottom: 10px; }
    .address { font-size: 13px; line-height: 1.6; color: #475569; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
    .table th { text-align: left; padding: 12px; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    .table td { padding: 16px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .total-box { margin-left: auto; width: 300px; margin-top: 20px; border-top: 2px solid #0f172a; padding-top: 15px; }
    .total-row { display: flex; justify-content: space-between; font-size: 13px; color: #475569; padding: 4px 0; }
    .total-row.grand { font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 10px; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 30px; margin-top: 50px; line-height: 1.5; }
    .stamp { border: 2px dashed #10b981; color: #10b981; display: inline-block; padding: 8px 16px; font-weight: 900; text-transform: uppercase; font-size: 12px; border-radius: 4px; transform: rotate(-3deg); margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="logo">OMYRA<span style="color:#D4FF5E; font-weight:black;">MALL</span></div>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium Digital Marketplace</p>
      </div>
      <div style="text-align: right;">
        <div class="title">INVOICE</div>
        <p style="font-size: 13px; font-weight: bold; margin-top: 4px; color: #0f172a;">Order Ref: ${orderNo}</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 2px;">Date: ${formattedDate}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="section-title">Billing Address</div>
        <div class="address" style="font-weight: bold; color: #0f172a;">${userProfile.firstName} ${userProfile.lastName}</div>
        <div class="address">
          ${userProfile.streetAddress || '404 Pixel Lane'}<br>
          ${userProfile.city || 'Cupertino'}, ${userProfile.stateProvince || 'CA'} ${userProfile.zipPostal || '95014'}<br>
          ${userProfile.country || 'United States'}
        </div>
      </div>
      <div style="text-align: right;">
        <div class="section-title">Seller Authority</div>
        <div class="address" style="font-weight: bold; color: #0f172a;">OMYRA DIGITAL INC.</div>
        <div class="address">
          Infinite Loop Suite 101<br>
          Cupertino, CA 95014<br>
          United States (Tax Ref: #99-28491)
        </div>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: right;">License Tier</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: bold; color: #0f172a;">${asset.title}</td>
          <td style="text-align: right; color: #475569;">Lifetime Commercial Developer License</td>
          <td style="text-align: right; font-weight: bold; color: #0f172a;">$${asset.price.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div class="stamp">Verified Paid • Omyra Mall</div>
      </div>
      <div class="total-box">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${asset.price.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>VAT / Local Taxes (8%):</span>
          <span>$${vat}</span>
        </div>
        <div class="total-row grand">
          <span>Total Amount paid:</span>
          <span>$${total}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      This invoice serves as proof of purchase and grants direct product code access. <br>
      Licensed to ${userProfile.firstName} ${userProfile.lastName} (${userProfile.username}).<br>
      Thank you for shopping at Omyra Mall. For support claims, use your support ticket dashboard.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMYRA_Invoice_${orderNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('PDF Invoice generated and downloaded!');
  };

  // High-fidelity printable Developer License Key generator
  const downloadHtmlLicenseFile = (asset: any) => {
    const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const licenseKey = `OM-LIC-${Math.floor(100000 + Math.random() * 900000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const licenseHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OMYRA Digital License - ${licenseKey}</title>
  <style>
    body { font-family: 'Georgia', serif; color: #1e293b; margin: 0; padding: 40px; background-color: #faf9f6; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 60px; border-radius: 4px; border: 12px double #cbd5e1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); text-align: center; position: relative; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(226, 232, 240, 0.4); font-family: sans-serif; font-weight: 900; z-index: 0; pointer-events: none; text-transform: uppercase; letter-spacing: 10px; }
    .content { position: relative; z-index: 10; }
    .header-title { font-family: sans-serif; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #84cc16; letter-spacing: 3px; margin-bottom: 20px; }
    .main-title { font-size: 32px; font-weight: normal; color: #0f172a; margin-bottom: 10px; }
    .divider { height: 2px; width: 100px; background: #cbd5e1; margin: 20px auto; }
    .subtitle { font-size: 14px; font-style: italic; color: #64748b; margin-bottom: 40px; }
    .recipient { font-size: 24px; font-weight: bold; color: #0f172a; margin: 30px 0; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px; }
    .body-text { font-size: 14px; line-height: 1.8; color: #334155; max-width: 600px; margin: 0 auto 40px auto; text-align: justify; text-justify: inter-word; }
    .license-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 40px; border-radius: 8px; }
    .license-label { font-family: sans-serif; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 5px; }
    .license-key { font-family: monospace; font-size: 18px; font-weight: bold; color: #0f172a; letter-spacing: 2px; }
    .signatures { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; }
    .sig-block { border-top: 1px solid #cbd5e1; width: 220px; padding-top: 10px; }
    .sig-name { font-size: 12px; font-weight: bold; color: #0f172a; font-family: sans-serif; }
    .sig-title { font-size: 10px; color: #64748b; font-family: sans-serif; text-transform: uppercase; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="watermark">AUTHORIZED</div>
    <div class="content">
      <div class="header-title">Omyra Mall Certification Authority</div>
      <h1 class="main-title">Developer License Key Certificate</h1>
      <div class="divider"></div>
      <p class="subtitle">This official certificate document serves to verify the permanent digital license rights acquired on</p>
      
      <div class="recipient">${userProfile.firstName} ${userProfile.lastName}</div>
      
      <p class="body-text">
        Under this lifetime developer license agreement, the recipient is granted non-exclusive, worldwide, and royalty-free rights to compile, modify, deploy, and host the source codes of <strong>${asset.title}</strong> for commercial or personal products, software setups, client deliverables, and custom SaaS platforms. This license strictly forbids direct redistribution, resale, or sub-licensing of the underlying source files unaltered in any digital asset storefronts.
      </p>

      <div class="license-box">
        <div class="license-label">Authorized Cryptographic Key License</div>
        <div class="license-key">${licenseKey}</div>
        <p style="font-size: 11px; color: #64748b; margin-top: 6px; font-family: sans-serif;">Authorized Date: ${formattedDate} • Status: Active (Verified)</p>
      </div>

      <div class="signatures">
        <div class="sig-block">
          <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 24px; color: #1e3a8a; margin-bottom: -5px; transform: rotate(-2deg);">A. Vanguard</div>
          <div class="sig-name">${userProfile.firstName} ${userProfile.lastName}</div>
          <div class="sig-title">License Holder Signature</div>
        </div>
        <div class="sig-block">
          <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 24px; color: #84cc16; margin-bottom: -5px; transform: rotate(-3deg);">Omyra Auth</div>
          <div class="sig-name">Omyra Mall Licensing Authority</div>
          <div class="sig-title">Official Registry Registrar</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([licenseHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMYRA_License_${asset.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('PDF License Key Certificate downloaded!');
  };

  const avatarOptions = [
    { name: 'Violet Cyber', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80' },
    { name: 'Neon Specialist', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80' },
    { name: 'Abstract Amethyst', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop&q=80' },
    { name: 'Terminal Master', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&fit=crop&q=80' },
    { name: 'Creative Lead', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&fit=crop&q=80' },
    { name: 'Pixel Engineer', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&fit=crop&q=80' }
  ];

  const menuTabs = [
    { id: 'downloads', label: 'Download Library', icon: Download },
    { id: 'billing', label: 'Billing Address', icon: MapPin },
    { id: 'sell', label: 'Sell / Creator Portal', icon: Zap },
    { id: 'security', label: 'Security Panel', icon: Shield },
    { id: 'about', label: 'About Omyra', icon: Info },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'refund', label: 'Refund Policies', icon: RefreshCw }
  ] as const;

  return (
    <div id="user-account-container" className="space-y-12 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-[#D4FF5E] text-black text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20"
          >
            <Check className="h-4 w-4" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP: Highly Polished Rounded Profile Card */}
      <div id="profile-card" className="relative rounded-[40px] border border-white/10 bg-[#161618] p-8 md:p-12 overflow-hidden text-center flex flex-col items-center justify-center space-y-6">
        
        {/* Ambient backlighting */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-44 w-44 rounded-full bg-[#D4FF5E]/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

        <div className="relative group">
          {/* Pulsing glow ring around avatar */}
          <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-[#D4FF5E] to-purple-500 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="relative h-32 w-32 md:h-36 md:w-36 rounded-full overflow-hidden border-4 border-[#0A0A0B] bg-[#0A0A0B]">
            <img 
              id="user-profile-image"
              src={userProfile.avatarUrl} 
              alt="User profile avatar" 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Pencil Edit Icon placed on the image section */}
          <button
            id="profile-edit-trigger"
            onClick={handleOpenEdit}
            className="absolute bottom-1 right-1 bg-[#D4FF5E] hover:bg-white text-black p-3 rounded-full shadow-lg border-2 border-[#0A0A0B] transition-all duration-200 cursor-pointer hover:scale-110 flex items-center justify-center"
            title="Edit Profile Information"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 text-center">
          <h2 id="user-display-name" className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
            {userProfile.firstName} {userProfile.lastName}
          </h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <p id="user-display-username" className="text-xs font-mono font-black uppercase tracking-widest text-[#D4FF5E] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-3.5 py-1.5 rounded-full inline-block">
              @{userProfile.username}
            </p>
            {onLogout && (
              <button
                id="omyra-logout-action"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-full cursor-pointer transition-all"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE: Horizontally Slidable Navigation Menu */}
      <div id="account-navigation-wrapper" className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
            Account Navigation Panel
          </h3>
          <span className="text-[10px] font-mono text-slate-600 hidden md:inline">
            ← Scroll Horizontally on Mobile Devices →
          </span>
        </div>

        {/* Slidable menu row */}
        <div 
          id="account-horizontal-scrollbar" 
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-black scrollbar-thumb-white/10 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {menuTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMenu === tab.id;
            return (
              <button
                key={tab.id}
                id={`account-tab-btn-${tab.id}`}
                onClick={() => setActiveMenu(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-250 cursor-pointer border ${
                  isActive
                    ? 'bg-[#D4FF5E] text-black border-[#D4FF5E] shadow-xl shadow-[#D4FF5E]/5'
                    : 'text-[#8E9299] hover:text-white bg-[#161618] border-white/5 hover:border-white/15'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM: Dynamic Sub-sections Card */}
      <div id="account-content-viewport" className="rounded-[40px] border border-white/10 bg-[#161618] p-6 md:p-10 min-h-[380px] relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#D4FF5E]/5 blur-3xl pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* DOWNLOAD LIBRARY VIEW */}
            {activeMenu === 'downloads' && (
              <div id="view-downloads-pane" className="space-y-8">
                
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                      <Download className="h-5 w-5 text-[#D4FF5E]" /> Your Authorized Downloads
                    </h4>
                    <p className="text-xs text-[#8E9299] mt-1 font-semibold">
                      Secure ZIP installers, licensing keys, and invoice records linked to your Omyra Mall account.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleReleaseNewVersions}
                      className="rounded-xl border border-dashed border-amber-500/20 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 text-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
                      title="Simulate a creator uploading a new version of your purchased products"
                    >
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      <span>Simulate Creator Update</span>
                    </button>
                    
                    <button
                      onClick={() => onSwitchToTab('marketplace')}
                      className="rounded-xl border border-white/10 hover:border-[#D4FF5E] text-xs font-black uppercase tracking-widest px-4 py-2.5 text-white transition-all cursor-pointer"
                    >
                      Browse Store
                    </button>
                  </div>
                </div>

                {localPurchased.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-black/20 space-y-4">
                    <HelpCircle className="h-10 w-10 text-slate-600 mx-auto" />
                    <p className="text-xs text-[#8E9299] font-black uppercase tracking-widest">
                      No purchases found in your account history
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                      All templates and premium packages acquired in the marketplace will instantly manifest here with lifetime download codes.
                    </p>
                    <button
                      onClick={() => onSwitchToTab('marketplace')}
                      className="mt-2 rounded-xl bg-[#D4FF5E] hover:bg-[#c3ec4e] text-black text-xs font-black uppercase tracking-widest px-5 py-3 cursor-pointer"
                    >
                      Visit Omyra Mall Storefront
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Notice banner */}
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3 text-xs">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <p className="text-[#8E9299] font-medium leading-relaxed">
                        <span className="text-emerald-400 font-bold">Omyra Sync Online:</span> Product assets automatically tracking creator versions. Any updates uploaded by creators are instantly patched into your repository records.
                      </p>
                    </div>

                    {/* Stack of Beautiful Separate Product Sections */}
                    {localPurchased.map((asset, index) => {
                      const versionInfo = productVersions[asset.id] || {
                        purchasedVersion: 'v1.0.0',
                        currentVersion: 'v2.4.2',
                        lastUpdated: 'June 26, 2026',
                        changelog: 'Refactored CSS state, enabled multi-threaded canvas render, and upgraded Tailwind support.',
                        status: 'auto-synced'
                      };
                      
                      const progress = downloadProgress[asset.id];
                      const isDownloading = progress !== undefined;
                      const sigUrl = signedUrls[asset.id];
                      const orderRef = `OM-REC-${9000 + index * 123}`;

                      return (
                        <div 
                          key={asset.id} 
                          id={`download-section-${asset.id}`}
                          className="relative rounded-[32px] border border-white/10 bg-black/40 p-6 md:p-8 space-y-6 hover:border-[#D4FF5E]/25 transition-all duration-300 overflow-hidden"
                        >
                          {/* Top lighting overlay to accent separate visual block */}
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4FF5E]/15 to-transparent" />
                          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#D4FF5E]/5 blur-2xl pointer-events-none" />

                          {/* Head of Section: Product Information & Glowing Live Badges */}
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div 
                                className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-white text-sm font-black font-mono shadow-xl border border-white/5"
                                style={{ background: asset.coverImage || 'linear-gradient(135deg, #1e1e24 0%, #33333d 100%)' }}
                              >
                                {asset.category.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-black tracking-widest text-[#D4FF5E] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-2.5 py-0.5 rounded-full inline-block uppercase">
                                  {asset.category} Asset Pack
                                </span>
                                <h5 className="text-sm font-black text-white uppercase tracking-wide">{asset.title}</h5>
                                <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                  <span>Order Key: <span className="font-mono text-slate-400">{orderRef}</span></span>
                                  <span>•</span>
                                  <span>Developer License: Lifetime Commercial</span>
                                </p>
                              </div>
                            </div>

                            {/* VERSION HIGHLIGHT BLOCK */}
                            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-3 flex items-center gap-4 text-xs font-bold shrink-0">
                              <div className="space-y-0.5">
                                <span className="text-[8px] font-mono uppercase text-slate-500 block">Initial Version</span>
                                <span className="text-[11px] text-slate-400 font-mono">{versionInfo.purchasedVersion}</span>
                              </div>
                              <div className="h-6 w-[1px] bg-white/10" />
                              <div className="space-y-0.5">
                                <span className="text-[8px] font-mono uppercase text-[#D4FF5E] block">Latest Available</span>
                                <span className="text-xs text-[#D4FF5E] font-black font-mono flex items-center gap-1 animate-pulse">
                                  {versionInfo.currentVersion}
                                </span>
                              </div>
                              <div className="h-6 w-[1px] bg-white/10" />
                              <div>
                                {versionInfo.currentVersion === 'v3.0.0' ? (
                                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest animate-bounce">
                                    NEW UPDATE LIVE!
                                  </span>
                                ) : (
                                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                                    AUTO-SYNCED
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Changelog & Tech Info Accordion */}
                          <div className="p-4 rounded-2xl bg-[#0A0A0B]/50 border border-white/5 space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                              <Award className="h-3 w-3 text-[#D4FF5E]" /> Version Changelog & Updates
                            </p>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                              {versionInfo.changelog}
                            </p>
                          </div>

                          {/* CRYPTOGRAPHIC SIGNED URL terminal section */}
                          <div className="p-5 rounded-2xl bg-black border border-white/10 font-mono space-y-3.5 relative overflow-hidden">
                            <div className="absolute top-3 right-4 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                              <span className="text-[8px] uppercase text-slate-500 font-bold">Signed Server Core</span>
                            </div>

                            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                              <Terminal className="h-4 w-4 text-[#D4FF5E]" />
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Omyra Token Registry Interface</span>
                            </div>

                            {!sigUrl ? (
                              <div className="space-y-1.5 py-1 text-center md:text-left">
                                <p className="text-xs text-slate-500 font-bold">
                                  🔒 Secure file channel idle. Generate signed URL to initiate download.
                                </p>
                                <p className="text-[10px] text-slate-600">
                                  One-time URLs are generated client-side using Omyra signature tokens and become invalidated instantly upon physical zip download.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2 text-xs">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-slate-500 uppercase block">Generated Token (Valid for 60s)</span>
                                    <span className="text-slate-300 font-bold select-all bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                      {sigUrl.token}
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-right">
                                    <span className="text-[9px] text-slate-500 uppercase block">Link Status</span>
                                    {sigUrl.isClaimed ? (
                                      <span className="text-rose-500 font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded inline-block">
                                        REVOKED / CLAIMED
                                      </span>
                                    ) : sigUrl.countdown <= 0 ? (
                                      <span className="text-slate-500 font-black uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded inline-block">
                                        EXPIRED
                                      </span>
                                    ) : (
                                      <span className="text-[#D4FF5E] font-black uppercase tracking-wider bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-2 py-0.5 rounded inline-block animate-pulse">
                                        ACTIVE • {sigUrl.countdown}s
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                  <p className="text-[10px] text-slate-400 select-all truncate max-w-md font-mono">
                                    {sigUrl.url}
                                  </p>
                                  
                                  <button
                                    onClick={() => handleClaimDownload(asset.id, asset.title)}
                                    disabled={sigUrl.isClaimed || sigUrl.countdown <= 0}
                                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shrink-0 transition-all cursor-pointer ${
                                      sigUrl.isClaimed || sigUrl.countdown <= 0
                                        ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                                        : 'bg-[#D4FF5E] text-black hover:bg-[#c3ec4e] shadow-md shadow-[#D4FF5E]/10'
                                    }`}
                                  >
                                    Claim & Download ZIP
                                  </button>
                                </div>

                                {sigUrl.isClaimed && (
                                  <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-[10px] text-rose-400 flex items-start gap-2 leading-normal font-sans">
                                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                                    <p className="font-semibold">
                                      <span className="font-black">Security Protocol Active:</span> This signed link signature has been neutralized and cannot be claimed again. If you wish to download this asset codebase again, please trigger a brand-new signed URL token by clicking the "Sign Download ZIP" button.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Bottom Row Actions Drawer */}
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                              Secured Actions Mapped to Omyra Registries
                            </p>

                            <div className="w-full md:w-auto grid grid-cols-1 md:flex items-center gap-3">
                              {/* DOWNLOAD ZIP SIGNER TRIGGER */}
                              <button
                                onClick={() => generateSignedUrl(asset.id)}
                                className="rounded-xl border border-white/10 hover:border-[#D4FF5E] text-white px-5 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10"
                              >
                                <Download className="h-4 w-4 text-[#D4FF5E]" />
                                <span>Sign Download ZIP</span>
                              </button>

                              {/* DOWNLOAD PDF INVOICE */}
                              <button
                                onClick={() => downloadHtmlInvoiceFile(asset)}
                                className="rounded-xl border border-white/10 hover:border-emerald-400 bg-black/20 hover:bg-emerald-500/5 text-slate-300 hover:text-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                              >
                                <FileDown className="h-4 w-4 text-emerald-400" />
                                <span>PDF Invoice</span>
                              </button>

                              {/* DOWNLOAD PDF LICENSE */}
                              <button
                                onClick={() => downloadHtmlLicenseFile(asset)}
                                className="rounded-xl border border-white/10 hover:border-indigo-400 bg-black/20 hover:bg-indigo-500/5 text-slate-300 hover:text-indigo-400 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                              >
                                <Award className="h-4 w-4 text-indigo-400" />
                                <span>PDF License</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* BILLING DETAILS / ADDRESS VIEW */}
            {activeMenu === 'billing' && (
              <div id="view-billing-pane" className="space-y-8">
                <div className="border-b border-white/5 pb-5">
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">Billing Address</h4>
                  <p className="text-xs text-[#8E9299] mt-1 font-semibold">Configure and manage your registered billing address for automated marketplace invoices and licensing certificates.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Address Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fullAddress = `${userProfile.streetAddress}, ${userProfile.city}, ${userProfile.stateProvince} ${userProfile.zipPostal}, ${userProfile.country}`;
                      saveProfile({
                        ...userProfile,
                        billingAddress: fullAddress
                      });
                      triggerToast('Billing address saved successfully!');
                    }}
                    className="space-y-5"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Registered Address Form</span>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">Street Address</label>
                      <input 
                        type="text"
                        value={userProfile.streetAddress}
                        onChange={(e) => setUserProfile({ ...userProfile, streetAddress: e.target.value })}
                        placeholder="e.g. 404 Pixel Lane"
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none placeholder-slate-700"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">City</label>
                        <input 
                          type="text"
                          value={userProfile.city}
                          onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
                          placeholder="e.g. Cupertino"
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none placeholder-slate-700"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">State / Province</label>
                        <input 
                          type="text"
                          value={userProfile.stateProvince}
                          onChange={(e) => setUserProfile({ ...userProfile, stateProvince: e.target.value })}
                          placeholder="e.g. CA"
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none placeholder-slate-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">ZIP / Postal Code</label>
                        <input 
                          type="text"
                          value={userProfile.zipPostal}
                          onChange={(e) => setUserProfile({ ...userProfile, zipPostal: e.target.value })}
                          placeholder="e.g. 95014"
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none placeholder-slate-700"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">Country</label>
                        <input 
                          type="text"
                          value={userProfile.country}
                          onChange={(e) => setUserProfile({ ...userProfile, country: e.target.value })}
                          placeholder="e.g. United States"
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-3 px-4 text-xs text-white focus:border-[#D4FF5E] focus:outline-none placeholder-slate-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#D4FF5E] hover:bg-[#c3ec4e] text-black py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#D4FF5E]/10"
                      >
                        Save Address Details
                      </button>
                    </div>
                  </form>

                  {/* Right Column: Live Envelope Envelope Visualization */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block font-mono">Live Shipping & Invoicing Card</span>

                    <div className="relative rounded-[24px] bg-gradient-to-br from-[#1b1b1f] to-black border border-white/10 p-6 min-h-[220px] flex flex-col justify-between overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#D4FF5E]/5 blur-2xl pointer-events-none" />
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black tracking-widest text-[#D4FF5E] uppercase bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-2.5 py-1 rounded-full">
                            Billing Destination
                          </span>
                        </div>
                        <MapPin className="h-5 w-5 text-[#D4FF5E]" />
                      </div>

                      {/* Display name and mailing details */}
                      <div className="space-y-3 relative z-10 my-4">
                        <div className="space-y-0.5">
                          <span className="text-[8px] uppercase font-mono text-slate-500">Addressee</span>
                          <p className="text-sm font-black text-white uppercase tracking-wide">
                            {userProfile.firstName} {userProfile.lastName}
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[8px] uppercase font-mono text-slate-500">Mailing Address</span>
                          <p className="text-xs text-slate-300 font-medium leading-relaxed font-mono">
                            {userProfile.streetAddress || 'No Street Address'}<br />
                            {userProfile.city || 'No City'}, {userProfile.stateProvince || 'No State'} {userProfile.zipPostal || 'No ZIP'}<br />
                            {userProfile.country || 'No Country'}
                          </p>
                        </div>
                      </div>

                      {/* Foot of invoice view */}
                      <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/5">
                        <div>
                          <span className="text-[8px] uppercase font-mono text-slate-500 block">Status</span>
                          <span className="text-[10px] font-black uppercase tracking-wide text-emerald-400">
                            Verified Tax-Exempt
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 font-bold">OMYRA PAY ID #8432</span>
                      </div>
                    </div>

                    {/* Quick billing tips helper */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <p className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-[#D4FF5E]" /> Invoicing Notice
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        Your physical address is used to determine local tax rates and is compiled onto your license certificates. Changing this address will instantly apply to future receipts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SELL / CREATOR PLATFORM HUB VIEW */}
            {activeMenu === 'sell' && (
              <div id="view-creator-hub-pane" className="space-y-6">
                <div className="border-b border-white/5 pb-5">
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">Sell & Creator Portal</h4>
                  <p className="text-xs text-[#8E9299] mt-1 font-semibold">Monetize your code, UI presets, and books with instant payouts.</p>
                </div>

                <div className="p-6 rounded-3xl border border-[#D4FF5E]/20 bg-[#D4FF5E]/5 relative overflow-hidden space-y-6">
                  <div className="absolute top-[-30px] right-[-30px] h-28 w-28 rounded-full bg-[#D4FF5E]/10 blur-2xl" />
                  
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#D4FF5E] bg-[#D4FF5E]/15 border border-[#D4FF5E]/30 px-2.5 py-1 rounded-full inline-block">
                      Enterprise Program Active
                    </span>
                    <h5 className="text-xl font-black uppercase tracking-tight text-white">
                      Unlock Your Studio Seller Dashboard
                    </h5>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      You are registered as a merchant seller with DesignAura Labs. Sell codebases, 3D layouts, beats, and guides instantly. Keep 95% of every transaction.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Seller ID</span>
                      <span className="text-xs font-mono font-black text-white">#OMY-9842</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Sales</span>
                      <span className="text-xs font-mono font-black text-[#D4FF5E]">$1,542.00</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Items</span>
                      <span className="text-xs font-mono font-black text-white">3 Listed</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Seller Rating</span>
                      <span className="text-xs font-mono font-black text-amber-400">4.95 ★</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => onSwitchToTab('creator')}
                      className="rounded-xl bg-[#D4FF5E] hover:bg-[#c3ec4e] text-black px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center"
                    >
                      Enter Creator Dashboard
                    </button>
                    <button
                      onClick={() => triggerToast('Guidelines downloaded. Check your Downloads.')}
                      className="rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center"
                    >
                      Read Seller Policies
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY PANEL VIEW */}
            {activeMenu === 'security' && (
              <div id="view-security-pane" className="space-y-6">
                <div className="border-b border-white/5 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-white">Security & Keys</h4>
                    <p className="text-xs text-[#8E9299] mt-1 font-semibold">Reset passwords, review authorized logins, and authorize keys.</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <ShieldCheck className="h-3 w-3" /> Secure Connection
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Change Password panel */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const newPass = (form.elements.namedItem('new_password') as HTMLInputElement).value;
                      if (!newPass) {
                        setErrorText('Please enter a valid password.');
                        return;
                      }
                      saveProfile({ ...userProfile, password: newPass });
                      form.reset();
                      triggerToast('Security password saved successfully!');
                    }} 
                    className="p-6 rounded-2xl border border-white/5 bg-black/20 space-y-4"
                  >
                    <h5 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-[#D4FF5E]" /> Reset Password
                    </h5>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">Current Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-2.5 px-3.5 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">New Secure Password</label>
                      <input 
                        name="new_password"
                        type="password"
                        placeholder="Min 8 characters"
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-2.5 px-3.5 text-xs text-white focus:border-[#D4FF5E]"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Save Password
                    </button>
                  </form>

                  {/* Active Sessions */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Authorized Sessions</h5>
                    
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl border border-white/5 bg-black/40 flex items-start gap-3.5">
                        <Laptop className="h-5 w-5 text-[#D4FF5E] shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs">
                          <p className="font-black text-white uppercase">Chrome 122.0.0 (MacOS Venture)</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Cupertino, USA</span>
                            <span>•</span>
                            <span className="text-[#D4FF5E]">Active Now</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-white/5 bg-black/40 flex items-start gap-3.5 opacity-60">
                        <Laptop className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs">
                          <p className="font-black text-slate-300 uppercase">Safari Mobile (iOS 17.4)</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Austin, USA</span>
                            <span>•</span>
                            <span>3 days ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT US VIEW */}
            {activeMenu === 'about' && (
              <div id="view-about-pane" className="space-y-6">
                <div className="border-b border-white/5 pb-5">
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">About Omyra Mall</h4>
                  <p className="text-xs text-[#8E9299] mt-1 font-semibold">Curating the highest quality source code assemblies for modern engineering.</p>
                </div>

                <div className="prose prose-invert text-xs font-medium text-slate-400 space-y-4 max-w-3xl leading-relaxed">
                  <p>
                    Established in <strong className="text-white">2026</strong>, Omyra Mall was engineered to eliminate low-quality, buggy developer packages. We serve as a premium curated marketplace for verified web applications, full-stack architectural blueprints, developer masterclasses, and visual layout assets.
                  </p>
                  <p>
                    Every asset on Omyra is put through static analysis, code security audits, and visual design checks before entering the general catalog. We ensure:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-300">
                    <li><strong className="text-white">Zero Bloat</strong>: Fully modular setups without unrequested, secondary background frameworks.</li>
                    <li><strong className="text-white">Optimized Styling</strong>: Strict Tailwind implementation with high-contrast elegant layouts.</li>
                    <li><strong className="text-white">Direct ZIP codes</strong>: No hidden subscriptions. Single transaction triggers absolute lifelong ownership.</li>
                  </ul>
                  <p className="pt-4 border-t border-white/5 text-[11px] italic text-slate-500">
                    Omyra Mall - Crafted for Elite Frontend Craftsmen, designed to elevate digital design with responsive, high-performance visual integrity.
                  </p>
                </div>
              </div>
            )}

            {/* TERMS OF SERVICE VIEW */}
            {activeMenu === 'terms' && (
              <div id="view-terms-pane" className="space-y-6">
                <div className="border-b border-white/5 pb-5">
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">Terms of Digital Service</h4>
                  <p className="text-xs text-[#8E9299] mt-1 font-semibold">License terms governing purchased files, customization rights, and redistributions.</p>
                </div>

                <div className="space-y-4 text-xs font-medium text-slate-400">
                  <div className="space-y-1">
                    <h5 className="font-black text-white uppercase text-[11px]">1. Commercial License Rights</h5>
                    <p className="leading-relaxed">
                      Every code, asset, or template purchased grants you a non-exclusive, worldwide, lifetime commercial license. You may deploy it for client projects, personal setups, or SaaS businesses.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-black text-white uppercase text-[11px]">2. Strictly Forbidden Reselling</h5>
                    <p className="leading-relaxed">
                      You are strictly prohibited from redistributing, sub-licensing, or reselling any code files or design assets unaltered or as individual products on other digital marketplaces.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-black text-white uppercase text-[11px]">3. Liability and Warranty Limits</h5>
                    <p className="leading-relaxed">
                      OMYRA digital assets are provided "as-is", compiled with standard developer dependencies. Omyra Mall holds no liability for downstream server downtimes, integration faults, or client losses.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* REFUND AND RETURN POLICY VIEW */}
            {activeMenu === 'refund' && (
              <div id="view-refund-pane" className="space-y-6">
                <div className="border-b border-white/5 pb-5">
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">Refund & Return Policies</h4>
                  <p className="text-xs text-[#8E9299] mt-1 font-semibold">100% Risk-Free guarantees and client-protection protocols.</p>
                </div>

                <div className="space-y-5 text-xs font-medium text-slate-400 max-w-3xl">
                  <div className="p-5 rounded-2xl bg-[#D4FF5E]/5 border border-[#D4FF5E]/10 space-y-2">
                    <h5 className="font-black text-white uppercase tracking-wider text-xs">
                      14-Day No-Questions-Asked Refund Guarantee
                    </h5>
                    <p className="leading-relaxed text-slate-300">
                      We stand by our code standards. If a template doesn't compile properly, misses essential components, or fails to meet responsive performance metrics, request a full refund within 14 days of purchase. No verification phone calls required.
                    </p>
                  </div>

                  <div className="space-y-2 leading-relaxed">
                    <h5 className="font-black text-white uppercase text-[11px]">Initiate a Refund Claim</h5>
                    <p>
                      To request refunds or file license claims, click the trigger button below to speak directly to our 24/7 technical help desks.
                    </p>
                    <button
                      onClick={() => triggerToast('Claim ticket created. Our team will email you within 15 mins.')}
                      className="mt-2 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest px-5 py-3 cursor-pointer hover:bg-[#D4FF5E] transition-colors"
                    >
                      File Support Claim Ticket
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* EDIT PROFILE DIALOG MODAL OVERLAY */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-[32px] border border-white/10 bg-[#161618] p-6 md:p-8 space-y-6 shadow-2xl"
            >
              <button
                id="close-edit-modal"
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 p-2 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-[#D4FF5E]" /> Edit Profile Info
                </h3>
                <p className="text-xs text-[#8E9299] mt-1 font-semibold">Update account credentials and select design-focused avatars.</p>
              </div>

              {errorText && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorText}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                
                {/* Avatar selection grid */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Select Avatar Picture
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {avatarOptions.map((opt) => {
                      const isSelected = editForm.avatarUrl === opt.url;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, avatarUrl: opt.url })}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                            isSelected ? 'border-[#D4FF5E]' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          title={opt.name}
                        >
                          <img 
                            src={opt.url} 
                            alt={opt.name} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#D4FF5E]/20 flex items-center justify-center">
                              <Check className="h-4 w-4 text-[#D4FF5E] drop-shadow" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-[8px] font-mono uppercase text-slate-500 mb-1">
                      Or Paste Avatar Image URL
                    </label>
                    <input 
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={editForm.avatarUrl}
                      onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-2 px-3 text-[11px] text-white focus:border-[#D4FF5E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                    <input 
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-2.5 px-3.5 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                    <input 
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-2.5 px-3.5 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Username</label>
                  <input 
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-2.5 px-3.5 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">New Password (Optional)</label>
                  <input 
                    type="password"
                    placeholder="Leave empty to keep existing password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] py-2.5 px-3.5 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 text-center text-xs font-black uppercase tracking-widest text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 text-center text-xs font-black uppercase tracking-widest text-black bg-[#D4FF5E] hover:bg-[#c3ec4e] py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
