import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  Calendar, 
  Eye, 
  EyeOff, 
  Tag, 
  DollarSign, 
  Percent, 
  Zap, 
  Briefcase, 
  HelpCircle, 
  ListPlus, 
  BookOpen, 
  FileText, 
  Settings, 
  Clock, 
  Link as LinkIcon, 
  Video, 
  Image as ImageIcon,
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info,
  Boxes,
  Activity,
  UserCheck
} from 'lucide-react';
import { Product } from '../types';
import { UploadedFile } from './UploadCenter';

interface ProductManagerProps {
  products: Product[];
  onUpdateProducts?: (products: Product[]) => void;
  onPublishProduct?: (product: Omit<Product, 'id' | 'createdAt' | 'downloads' | 'reviews' | 'rating' | 'reviewCount'>) => void;
  setActiveSubTab: (tab: 'dashboard' | 'listings' | 'upload' | 'store') => void;
}

export default function ProductManager({
  products,
  onUpdateProducts,
  onPublishProduct,
  setActiveSubTab
}: ProductManagerProps) {
  // Navigation tabs within Listings Manager
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'archived'>('all');
  
  // States for bulk editing
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkPriceChangeType, setBulkPriceChangeType] = useState<'fixed' | 'percent'>('fixed');
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<string>('');

  // States for Editing/Adding Product workspace
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<'general' | 'pricing' | 'variants' | 'files' | 'requirements' | 'documentation'>('general');

  // Load Cloudflare R2 uploaded files list so user can link files
  const [r2Files, setR2Files] = useState<UploadedFile[]>([]);
  useEffect(() => {
    const cached = localStorage.getItem('omyra_uploaded_assets');
    if (cached) {
      setR2Files(JSON.parse(cached));
    }
  }, [editingProduct, isAddingNew]);

  // Temporary Form States for Creator Product Workspace
  const [formTitle, setFormTitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState<'templates' | 'ebooks' | 'design' | 'code' | 'audio'>('templates');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('19.00');
  const [formTags, setFormTags] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'scheduled' | 'archived'>('published');
  const [formScheduledDate, setFormScheduledDate] = useState('');
  
  // Advanced variables nested state
  const [formLicenseType, setFormLicenseType] = useState<'personal' | 'commercial' | 'resell' | 'mit' | 'proprietary'>('commercial');
  const [formDemoUrl, setFormDemoUrl] = useState('');
  const [formPreviewVideo, setFormPreviewVideo] = useState('');
  const [formGallery, setFormGallery] = useState<string[]>([]);
  const [formNewGalleryUrl, setFormNewGalleryUrl] = useState('');
  const [formFilesIncluded, setFormFilesIncluded] = useState<string[]>([]);
  
  // Discount rules state
  const [discountActive, setDiscountActive] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('20');
  
  // Flash Sale rules state
  const [flashSaleActive, setFlashSaleActive] = useState(false);
  const [flashPercent, setFlashPercent] = useState('50');
  const [flashEndDate, setFlashEndDate] = useState('');
  
  // Coupon support state
  const [formCoupons, setFormCoupons] = useState<{ code: string; discountPercentage: number; active: boolean }[]>([
    { code: 'OMYRA30', discountPercentage: 30, active: true }
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState('10');

  // Variants state
  const [formVariants, setFormVariants] = useState<{ id: string; name: string; price: number; licenseType: string; filesIncluded: string[] }[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('49.00');
  const [newVarLicense, setNewVarLicense] = useState('commercial');

  // Changelogs / Versions state
  const [formVersions, setFormVersions] = useState<{ version: string; date: string; changelog: string[] }[]>([]);
  const [newVerNum, setNewVerNum] = useState('');
  const [newVerChangelog, setNewVerChangelog] = useState('');

  // Dependencies & Requirements
  const [formDependencies, setFormDependencies] = useState<string[]>([]);
  const [newDependency, setNewDependency] = useState('');
  const [reqOS, setReqOS] = useState('Windows / macOS / Linux');
  const [reqRAM, setReqRAM] = useState('8 GB');
  const [reqCPU, setReqCPU] = useState('Intel Core i5 or Apple M1');
  const [reqStorage, setReqStorage] = useState('500 MB available space');

  // FAQs
  const [formFaqs, setFormFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  const [formDocumentation, setFormDocumentation] = useState('');

  // Sync only products belonging to "DesignAura Labs" or "You (Creator)"
  const isCreatorOwned = (p: Product) => {
    return p.creator.name === 'DesignAura Labs' || p.creator.name === 'You (Creator)';
  };

  const creatorProducts = products.filter(isCreatorOwned);

  // Get status of a product (defaulting to 'published' if field absent)
  const getProductStatus = (p: Product): 'draft' | 'published' | 'scheduled' | 'archived' => {
    return p.status || 'published';
  };

  const filteredProducts = creatorProducts.filter(p => {
    const status = getProductStatus(p);
    if (activeTab === 'all') return true;
    return status === activeTab;
  });

  // Bulk Actions Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const executeBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} listings from the catalog?`)) {
      const updated = products.filter(p => !selectedIds.includes(p.id));
      if (onUpdateProducts) onUpdateProducts(updated);
      setSelectedIds([]);
    }
  };

  const executeBulkEdit = () => {
    if (selectedIds.length === 0) return;
    
    const updated = products.map(p => {
      if (!selectedIds.includes(p.id)) return p;
      
      let nextPrice = p.price;
      if (bulkPriceValue) {
        const val = parseFloat(bulkPriceValue);
        if (!isNaN(val)) {
          if (bulkPriceChangeType === 'fixed') {
            nextPrice = Math.max(0, val);
          } else {
            nextPrice = Math.max(0, p.price * (1 + val / 100));
          }
        }
      }

      return {
        ...p,
        price: nextPrice,
        category: (bulkCategory ? bulkCategory : p.category) as any,
        status: (bulkStatus ? bulkStatus : getProductStatus(p)) as any
      };
    });

    if (onUpdateProducts) onUpdateProducts(updated);
    setIsBulkEditOpen(false);
    setSelectedIds([]);
    alert('Bulk edits applied successfully across targeted assets!');
  };

  // Populate workspace when editing
  const loadProductIntoWorkspace = (p: Product) => {
    setEditingProduct(p);
    setIsAddingNew(false);
    setWorkspaceTab('general');

    setFormTitle(p.title);
    setFormTagline(p.tagline);
    setFormCategory(p.category);
    setFormDescription(p.description);
    setFormPrice(p.price.toString());
    setFormTags(p.tags.join(', '));
    setFormFeatures(p.features.join('\n'));
    setFormCoverImage(p.coverImage);
    setFormStatus(getProductStatus(p));
    setFormScheduledDate(p.scheduledPublishDate || '');
    
    setFormLicenseType(p.licenseType || 'commercial');
    setFormDemoUrl(p.demoUrl || '');
    setFormPreviewVideo(p.previewVideo || '');
    setFormGallery(p.gallery || []);
    setFormFilesIncluded(p.filesIncluded || []);
    
    setDiscountActive(!!p.discountRules?.active);
    setDiscountPercent(p.discountRules?.percentage.toString() || '20');
    
    setFlashSaleActive(!!p.flashSale?.active);
    setFlashPercent(p.flashSale?.discountPercentage.toString() || '50');
    setFlashEndDate(p.flashSale?.endDate || '');

    setFormCoupons(p.coupons || []);
    setFormVariants(p.variants || []);
    setFormVersions(p.versions || []);
    setFormDependencies(p.dependencies || []);
    
    setReqOS(p.minimumRequirements?.os || 'Windows / macOS / Linux');
    setReqRAM(p.minimumRequirements?.ram || '8 GB');
    setReqCPU(p.minimumRequirements?.cpu || 'Intel Core i5 or Apple M1');
    setReqStorage(p.minimumRequirements?.storage || '500 MB available space');

    setFormFaqs(p.faqs || []);
    setFormDocumentation(p.documentation || '');
  };

  const createBlankNewProduct = () => {
    setEditingProduct(null);
    setIsAddingNew(true);
    setWorkspaceTab('general');

    setFormTitle('');
    setFormTagline('');
    setFormCategory('templates');
    setFormDescription('');
    setFormPrice('19.00');
    setFormTags('');
    setFormFeatures('');
    setFormCoverImage('linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)');
    setFormStatus('published');
    setFormScheduledDate('');
    
    setFormLicenseType('commercial');
    setFormDemoUrl('');
    setFormPreviewVideo('');
    setFormGallery([]);
    setFormFilesIncluded([]);
    
    setDiscountActive(false);
    setDiscountPercent('20');
    
    setFlashSaleActive(false);
    setFlashPercent('50');
    setFlashEndDate('');

    setFormCoupons([]);
    setFormVariants([]);
    setFormVersions([]);
    setFormDependencies([]);
    setReqOS('Windows / macOS / Linux');
    setReqRAM('8 GB');
    setReqCPU('Intel Core i5 or Apple M1');
    setReqStorage('500 MB available space');
    setFormFaqs([]);
    setFormDocumentation('');
  };

  const handleSaveWorkspace = () => {
    if (!formTitle || !formDescription) {
      alert('Asset Title and Description are required parameters.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum)) {
      alert('Price must be a valid numerical value.');
      return;
    }

    const tagArray = formTags.split(',').map(t => t.trim()).filter(Boolean);
    const featureArray = formFeatures.split('\n').map(f => f.trim()).filter(Boolean);

    const updatedProductData = {
      title: formTitle,
      tagline: formTagline,
      description: formDescription,
      category: formCategory,
      price: priceNum,
      tags: tagArray,
      features: featureArray,
      filesIncluded: formFilesIncluded.length > 0 ? formFilesIncluded : ['source-code.zip'],
      fileSize: '15.4 MB',
      coverImage: formCoverImage,
      status: formStatus,
      scheduledPublishDate: formStatus === 'scheduled' ? formScheduledDate : undefined,
      
      licenseType: formLicenseType,
      demoUrl: formDemoUrl || undefined,
      previewVideo: formPreviewVideo || undefined,
      gallery: formGallery,
      dependencies: formDependencies,
      minimumRequirements: {
        os: reqOS,
        ram: reqRAM,
        cpu: reqCPU,
        storage: reqStorage
      },
      faqs: formFaqs,
      documentation: formDocumentation,
      variants: formVariants,
      discountRules: {
        active: discountActive,
        percentage: parseInt(discountPercent) || 20
      },
      flashSale: {
        active: flashSaleActive,
        discountPercentage: parseInt(flashPercent) || 50,
        endDate: flashEndDate || new Date(Date.now() + 86400000).toISOString(),
        originalPrice: priceNum
      },
      coupons: formCoupons
    };

    if (isAddingNew) {
      // Create new
      const newId = 'omy-art-' + Math.random().toString(36).substring(2, 9);
      const fullNewProduct: Product = {
        id: newId,
        ...updatedProductData,
        rating: 5.0,
        reviewCount: 0,
        downloads: 0,
        createdAt: new Date().toISOString(),
        creator: {
          name: 'You (Creator)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop&q=80',
          salesCount: 0,
          badge: 'Verified Creator'
        },
        reviews: []
      };

      if (onUpdateProducts) {
        onUpdateProducts([fullNewProduct, ...products]);
      }
      setIsAddingNew(false);
      alert('New digital asset cataloged successfully!');
    } else if (editingProduct) {
      // Edit existing
      const updatedList = products.map(p => {
        if (p.id !== editingProduct.id) return p;
        return {
          ...p,
          ...updatedProductData
        };
      });

      if (onUpdateProducts) {
        onUpdateProducts(updatedList);
      }
      setEditingProduct(null);
      alert('Product schema parameters updated successfully!');
    }
  };

  // Helpers for inner state builders
  const addCoupon = () => {
    if (!newCouponCode) return;
    setFormCoupons(prev => [...prev, {
      code: newCouponCode.toUpperCase(),
      discountPercentage: parseInt(newCouponPercent) || 10,
      active: true
    }]);
    setNewCouponCode('');
  };

  const removeCoupon = (idx: number) => {
    setFormCoupons(prev => prev.filter((_, i) => i !== idx));
  };

  const addVariant = () => {
    if (!newVarName) return;
    setFormVariants(prev => [...prev, {
      id: 'var-' + Date.now(),
      name: newVarName,
      price: parseFloat(newVarPrice) || 0,
      licenseType: newVarLicense,
      filesIncluded: ['source-dist.zip']
    }]);
    setNewVarName('');
  };

  const removeVariant = (id: string) => {
    setFormVariants(prev => prev.filter(v => v.id !== id));
  };

  const addVersion = () => {
    if (!newVerNum) return;
    setFormVersions(prev => [{
      version: newVerNum,
      date: new Date().toISOString().split('T')[0],
      changelog: newVerChangelog.split('\n').map(c => c.trim()).filter(Boolean)
    }, ...prev]);
    setNewVerNum('');
    setNewVerChangelog('');
  };

  const addDependency = () => {
    if (!newDependency) return;
    setFormDependencies(prev => [...prev, newDependency]);
    setNewDependency('');
  };

  const addFaq = () => {
    if (!newFaqQ || !newFaqA) return;
    setFormFaqs(prev => [...prev, { question: newFaqQ, answer: newFaqA }]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const toggleLinkedFile = (fileName: string) => {
    setFormFilesIncluded(prev => {
      if (prev.includes(fileName)) {
        return prev.filter(x => x !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  };

  const addGalleryImage = () => {
    if (!formNewGalleryUrl) return;
    setFormGallery(prev => [...prev, formNewGalleryUrl]);
    setFormNewGalleryUrl('');
  };

  // Status Tab badges count
  const getCountByStatus = (status: 'all' | 'published' | 'draft' | 'scheduled' | 'archived') => {
    if (status === 'all') return creatorProducts.length;
    return creatorProducts.filter(p => getProductStatus(p) === status).length;
  };

  return (
    <div id="product-management-system" className="space-y-6">
      
      {/* Dynamic Render: Listings list or Editing Workspace */}
      {!editingProduct && !isAddingNew ? (
        <div className="space-y-6">
          
          {/* Header row with stats & action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-1.5">
                <Boxes className="h-4.5 w-4.5 text-[#D4FF5E]" />
                <span>Product Management Engine ({filteredProducts.length})</span>
              </h3>
              <p className="text-[10px] text-[#8E9299] font-medium mt-1">
                Configure listings, variants, markdown documentation, licensing, scheduled releases, and coupon discounts.
              </p>
            </div>

            <button
              onClick={createBlankNewProduct}
              className="rounded-xl bg-[#D4FF5E] hover:bg-[#bce647] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-1.5 transition-all self-start"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Product Asset</span>
            </button>
          </div>

          {/* Tab Sub Controls Filter Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-2">
            <div className="flex flex-wrap gap-2">
              {(['all', 'published', 'draft', 'scheduled', 'archived'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const count = getCountByStatus(tab);
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setSelectedIds([]); }}
                    className={`px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all ${
                      isActive
                        ? 'bg-[#D4FF5E]/10 border-[#D4FF5E] text-[#D4FF5E]'
                        : 'bg-transparent border-transparent text-[#8E9299] hover:text-[#F4F4F4]'
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            {/* Bulk actions trigger if checked */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2.5 bg-[#161618] border border-white/10 px-3.5 py-1.5 rounded-xl animate-in fade-in zoom-in duration-200">
                <span className="text-[9px] font-mono text-white font-bold">{selectedIds.length} SELECTED</span>
                <button
                  onClick={() => setIsBulkEditOpen(true)}
                  className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-wider text-[#F4F4F4] px-2.5 py-1"
                >
                  Bulk Edit Price/Cat
                </button>
                <button
                  onClick={executeBulkDelete}
                  className="rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[9px] font-black uppercase tracking-wider text-rose-400 px-2.5 py-1 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Bulk Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Bulk Edit dialog overlay if toggled */}
          {isBulkEditOpen && (
            <div className="rounded-2xl border border-white/10 bg-[#161618] p-4 sm:p-5 space-y-4 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4FF5E]">Bulk Schema Configuration Builder</span>
                <button onClick={() => setIsBulkEditOpen(false)} className="text-[9px] font-mono text-[#8E9299] hover:text-white uppercase">Cancel</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1.5">Adjust Base Price</label>
                  <div className="flex gap-1.5">
                    <select
                      value={bulkPriceChangeType}
                      onChange={(e) => setBulkPriceChangeType(e.target.value as any)}
                      className="rounded-lg border border-white/10 bg-[#0A0A0B] text-[#F4F4F4] px-2.5 py-1.5 text-xs"
                    >
                      <option value="fixed">Set fixed ($)</option>
                      <option value="percent">Percent adjustment (%)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="e.g. 29.00 or -10"
                      value={bulkPriceValue}
                      onChange={(e) => setBulkPriceValue(e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#0A0A0B] px-3 py-1.5 text-xs text-[#F4F4F4] w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1.5">Override Category</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#0A0A0B] px-3 py-1.5 text-xs text-[#F4F4F4]"
                  >
                    <option value="">Leave unchanged</option>
                    <option value="templates">Templates</option>
                    <option value="code">Code & Dev</option>
                    <option value="ebooks">Books & Guides</option>
                    <option value="design">3D & Design</option>
                    <option value="audio">Audio & Beats</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1.5">Override Status</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#0A0A0B] px-3 py-1.5 text-xs text-[#F4F4F4]"
                  >
                    <option value="">Leave unchanged</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={executeBulkEdit}
                  className="rounded-lg bg-[#D4FF5E] text-black font-black text-[9px] uppercase tracking-widest px-4 py-2"
                >
                  Apply Bulk Overwrite
                </button>
              </div>
            </div>
          )}

          {/* Listings Ledger table */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#161618] p-12 text-center text-xs text-[#8E9299] uppercase tracking-widest font-black">
              No product listings found in active folder status ({activeTab}).
            </div>
          ) : (
            <div className="bg-[#161618] border border-white/10 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0A0B]/40 text-[#8E9299] uppercase tracking-widest text-[9px] font-black border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-white/10 bg-[#0A0A0B] text-[#D4FF5E] focus:ring-0"
                        />
                      </th>
                      <th className="px-6 py-4">Product Asset</th>
                      <th className="px-6 py-4 text-center">Enforced Status</th>
                      <th className="px-6 py-4 text-center">Price Rules</th>
                      <th className="px-6 py-4 text-center">Variants</th>
                      <th className="px-6 py-4 text-center">Licensing</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-transparent">
                    {filteredProducts.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      const status = getProductStatus(p);

                      // Determine promotional rate if discounts active
                      const promoPrice = p.discountRules?.active 
                        ? p.price * (1 - p.discountRules.percentage / 100)
                        : p.price;

                      return (
                        <tr key={p.id} className={`transition-colors hover:bg-white/5 ${isSelected ? 'bg-white/[0.02]' : ''}`}>
                          <td className="px-6 py-4 text-center w-12">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                              className="rounded border-white/10 bg-[#0A0A0B] text-[#D4FF5E] focus:ring-0"
                            />
                          </td>
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="h-9 w-12 rounded-lg overflow-hidden shrink-0 border border-white/5" style={{ background: p.coverImage }} />
                            <div className="min-w-0">
                              <span className="font-bold text-white truncate block max-w-[180px] uppercase">{p.title}</span>
                              <span className="text-[10px] text-[#8E9299] font-mono capitalize">{p.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                              status === 'published' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
                              status === 'draft' ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' :
                              status === 'scheduled' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
                              'border-rose-500/20 text-rose-400 bg-rose-500/5'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono">
                            <div className="flex flex-col items-center">
                              {p.discountRules?.active ? (
                                <>
                                  <span className="text-[9px] text-[#8E9299] line-through">${p.price.toFixed(2)}</span>
                                  <span className="text-xs font-bold text-[#D4FF5E]">${promoPrice.toFixed(2)}</span>
                                </>
                              ) : (
                                <span className="font-bold text-white">${p.price.toFixed(2)}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-[#8E9299] font-mono font-bold">
                            {p.variants?.length ? `${p.variants.length} active` : 'Base only'}
                          </td>
                          <td className="px-6 py-4 text-center capitalize font-mono text-[#8E9299]">
                            {p.licenseType || 'commercial'}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => loadProductIntoWorkspace(p)}
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-[#8E9299] hover:text-white"
                              title="Edit product schema"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to permanently delete this listing?')) {
                                  const list = products.filter(x => x.id !== p.id);
                                  if (onUpdateProducts) onUpdateProducts(list);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-rose-500/30 text-[#8E9299] hover:text-rose-400"
                              title="Delete listing"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* PRODUCT CREATION/EDITING WORKSPACE */
        <div className="rounded-[32px] border border-white/10 bg-[#161618] overflow-hidden">
          
          {/* Workspace Title bar */}
          <div className="px-6 py-5 border-b border-white/5 bg-[#0A0A0B]/20 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#D4FF5E] font-mono">WORKSPACE CORE</span>
              <span className="text-[#8E9299]">/</span>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4]">
                {isAddingNew ? 'Configure New Digital Listing' : `Editing Listing ID: ${editingProduct?.id}`}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setEditingProduct(null); setIsAddingNew(false); }}
                className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-white/10 text-[#8E9299] hover:text-white hover:border-white/20 rounded-xl"
              >
                Close Without Saving
              </button>
              <button
                type="button"
                onClick={handleSaveWorkspace}
                className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-[#D4FF5E] text-black hover:bg-[#bce647] rounded-xl flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Asset parameters</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Sidebar sub-tabs (Col 3) */}
            <div className="lg:col-span-3 border-r border-white/5 bg-[#0A0A0B]/10 p-4 space-y-1">
              <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block px-3.5 mb-2.5">
                Listing Schema Groups
              </span>
              {(['general', 'pricing', 'variants', 'files', 'requirements', 'documentation'] as const).map(tab => {
                const isActive = workspaceTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setWorkspaceTab(tab)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#D4FF5E]/10 text-[#D4FF5E] border border-[#D4FF5E]/20'
                        : 'text-[#8E9299] hover:text-[#F4F4F4] hover:bg-white/[0.02] border border-transparent'
                    }`}
                  >
                    {tab === 'general' && <Settings className="h-3.5 w-3.5" />}
                    {tab === 'pricing' && <DollarSign className="h-3.5 w-3.5" />}
                    {tab === 'variants' && <Layers className="h-3.5 w-3.5" />}
                    {tab === 'files' && <FileText className="h-3.5 w-3.5" />}
                    {tab === 'requirements' && <HelpCircle className="h-3.5 w-3.5" />}
                    {tab === 'documentation' && <BookOpen className="h-3.5 w-3.5" />}
                    <span className="capitalize">{tab} Parameters</span>
                  </button>
                );
              })}
              
              <div className="pt-8 px-4 space-y-2.5">
                <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-wider block">Listing State Status</span>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3 py-2 text-[10px] font-bold text-white uppercase tracking-wider focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled Publishing</option>
                  <option value="archived">Archived</option>
                </select>

                {formStatus === 'scheduled' && (
                  <div className="space-y-1 animate-in slide-in-from-top duration-200">
                    <label className="block text-[8px] font-bold text-[#8E9299] uppercase tracking-wider">Release Timestamp</label>
                    <input
                      type="datetime-local"
                      value={formScheduledDate}
                      onChange={(e) => setFormScheduledDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3 py-2 text-[10px] text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Active Workspace Form Panel (Col 9) */}
            <div className="lg:col-span-9 p-6 md:p-8 space-y-6 max-h-[640px] overflow-y-auto">
              
              {/* TAB 1: GENERAL SCHEMA */}
              {workspaceTab === 'general' && (
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4]">General Metadata Configuration</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Asset Name / Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Nexus Premium Tailwind UI Landing Page"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Short Tagline</label>
                      <input
                        type="text"
                        placeholder="e.g. Clean design system with 40+ pre-built React components"
                        value={formTagline}
                        onChange={(e) => setFormTagline(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">System Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4]"
                      >
                        <option value="templates">Templates</option>
                        <option value="code">Code & Dev</option>
                        <option value="ebooks">Books & Guides</option>
                        <option value="design">3D & Design</option>
                        <option value="audio">Audio & Beats</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Meta Keywords / Tags (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. saas, dashboard, react, figma"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Product Description Overview</label>
                    <textarea
                      rows={4}
                      placeholder="Input comprehensive description outlining features, use cases, and support details..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Bullet Points / Highlighted Features (One per line)</label>
                    <textarea
                      rows={3}
                      placeholder="Feature 1: responsive grids&#10;Feature 2: dark mode toggles"
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Cover Background Styling Preset</label>
                      <input
                        type="text"
                        placeholder="e.g. linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        value={formCoverImage}
                        onChange={(e) => setFormCoverImage(e.target.value)}
                        className="w-full rounded-xl border border-[#D4FF5E]/30 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] font-mono"
                      />
                      <span className="text-[8.5px] text-[#8E9299] mt-1 block">Supports standard CSS linear-gradients or direct visual CDN URL paths.</span>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-black/20 flex flex-col justify-center">
                      <span className="text-[8px] font-bold text-[#8E9299] uppercase tracking-wider mb-2.5 block">Live Cover Preview Card</span>
                      <div className="h-14 w-full rounded-xl border border-white/10 flex items-center justify-center font-bold text-xs uppercase text-white shadow" style={{ background: formCoverImage }}>
                        Cover Gradient Sync
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING RULES */}
              {workspaceTab === 'pricing' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4]">Financial & Discount Configurations</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/20 border border-white/5 rounded-2xl p-4 space-y-2">
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1">Base Listing Rate ($)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8E9299] font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] pl-7 pr-3.5 py-2 text-xs text-[#F4F4F4] font-mono"
                        />
                      </div>
                    </div>

                    <div className="bg-black/20 border border-white/5 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-[#8E9299] uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={discountActive}
                            onChange={(e) => setDiscountActive(e.target.checked)}
                            className="rounded border-white/10 bg-[#0A0A0B] text-[#D4FF5E] focus:ring-0"
                          />
                          <span>Promotional Discount</span>
                        </label>
                      </div>
                      <div className="relative flex items-center gap-2">
                        <input
                          type="number"
                          disabled={!discountActive}
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-1.5 text-xs text-[#F4F4F4] disabled:opacity-40 font-mono"
                        />
                        <span className="text-xs text-[#8E9299]">% OFF</span>
                      </div>
                    </div>

                    <div className="bg-black/20 border border-[#D4FF5E]/10 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-[#D4FF5E] uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={flashSaleActive}
                            onChange={(e) => setFlashSaleActive(e.target.checked)}
                            className="rounded border-white/10 bg-[#0A0A0B] text-[#D4FF5E] focus:ring-0 animate-pulse"
                          />
                          <span>Active Flash Sale (50%+)</span>
                        </label>
                      </div>
                      <div className="space-y-2 animate-in slide-in-from-top duration-200">
                        <input
                          type="number"
                          disabled={!flashSaleActive}
                          placeholder="Flash rate e.g. 60"
                          value={flashPercent}
                          onChange={(e) => setFlashPercent(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-1.5 text-xs text-[#F4F4F4] disabled:opacity-40 font-mono"
                        />
                        <input
                          type="datetime-local"
                          disabled={!flashSaleActive}
                          value={flashEndDate}
                          onChange={(e) => setFlashEndDate(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-1.5 text-[10px] text-white disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coupon Support builder */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-[#8E9299] uppercase tracking-widest block">
                      Coupons & Promo Codes Escrow
                    </span>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        type="text"
                        placeholder="e.g. CYBER40"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white placeholder-[#8E9299] uppercase font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Percent OFF e.g. 40"
                        value={newCouponPercent}
                        onChange={(e) => setNewCouponPercent(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white w-28 font-mono"
                      />
                      <button
                        type="button"
                        onClick={addCoupon}
                        className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#F4F4F4]"
                      >
                        Add Promo
                      </button>
                    </div>

                    {formCoupons.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formCoupons.map((c, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-1.5 text-[10px] font-mono font-bold text-emerald-400">
                            <span>{c.code} ({c.discountPercentage}% OFF)</span>
                            <button type="button" onClick={() => removeCoupon(idx)} className="text-emerald-500 hover:text-white text-xs font-bold leading-none pl-1">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: VARIANTS */}
              {workspaceTab === 'variants' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4]">Asset Pricing Variants & Licensing</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Base Core License Type</label>
                      <select
                        value={formLicenseType}
                        onChange={(e) => setFormLicenseType(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4]"
                      >
                        <option value="personal">Personal License Only (Single Use)</option>
                        <option value="commercial">Commercial standard License (SaaS / Production)</option>
                        <option value="resell">Resell Rights (Template flipping)</option>
                        <option value="mit">MIT Permissive Open-Source</option>
                        <option value="proprietary">Proprietary Private Escrow</option>
                      </select>
                    </div>
                  </div>

                  {/* Add Product Variants builders */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-[#8E9299] uppercase tracking-widest block">
                      Product Variant SKU Manager
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <input
                        type="text"
                        placeholder="Variant Name e.g. Extended Developer License"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        className="sm:col-span-2 rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="Price Override $"
                        value={newVarPrice}
                        onChange={(e) => setNewVarPrice(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={addVariant}
                        className="rounded-xl bg-[#D4FF5E] hover:bg-[#bce647] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add SKU</span>
                      </button>
                    </div>

                    {formVariants.length > 0 ? (
                      <div className="overflow-x-auto pt-2">
                        <table className="w-full text-left text-[11px] bg-black/40 border border-white/5 rounded-xl overflow-hidden">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/5 font-mono text-[9px] font-black text-[#8E9299] uppercase tracking-widest">
                              <th className="px-4 py-2.5">Variant Description SKU</th>
                              <th className="px-4 py-2.5 text-center">Price Rate</th>
                              <th className="px-4 py-2.5 text-center">License Grant</th>
                              <th className="px-4 py-2.5 text-right">Scope Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-[#F4F4F4]">
                            {formVariants.map((v) => (
                              <tr key={v.id}>
                                <td className="px-4 py-3 font-bold">{v.name}</td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-[#D4FF5E]">${v.price.toFixed(2)}</td>
                                <td className="px-4 py-3 text-center capitalize font-mono text-[#8E9299]">{v.licenseType}</td>
                                <td className="px-4 py-3 text-right">
                                  <button type="button" onClick={() => removeVariant(v.id)} className="text-rose-400 hover:text-white font-bold uppercase text-[9px]">Remove</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#8E9299] block font-mono">No variants configured. Product compiles with base listing rate only.</span>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PREVIEWS & FILE MANAGER */}
              {workspaceTab === 'files' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4]">Media Previews & Cloudflare R2 Escrow Linking</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Interactive Demo URL</label>
                      <input
                        type="url"
                        placeholder="https://nexus-dashboard-demo.io"
                        value={formDemoUrl}
                        onChange={(e) => setFormDemoUrl(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Preview Video Embed / Link URL</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=preview"
                        value={formPreviewVideo}
                        onChange={(e) => setFormPreviewVideo(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] font-mono"
                      />
                    </div>
                  </div>

                  {/* Screenshots gallery builder */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-[#8E9299] uppercase tracking-widest block">
                      Screenshots / Asset Gallery Linker
                    </span>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="url"
                        placeholder="URL link e.g. https://images.unsplash.com/photo-..."
                        value={formNewGalleryUrl}
                        onChange={(e) => setFormNewGalleryUrl(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white w-full font-mono"
                      />
                      <button
                        type="button"
                        onClick={addGalleryImage}
                        className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#F4F4F4] shrink-0"
                      >
                        Link Photo
                      </button>
                    </div>

                    {formGallery.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {formGallery.map((img, idx) => (
                          <div key={idx} className="relative rounded-xl border border-white/10 bg-[#0A0A0B] overflow-hidden group h-14 sm:h-20">
                            <img src={img} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => setFormGallery(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center text-[11px]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* R2 Secure Association File Manager */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-[#D4FF5E] uppercase tracking-widest block">
                        R2 Escrow Asset File Linker
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('upload')}
                        className="text-[9px] font-mono text-[#8E9299] hover:text-[#D4FF5E]"
                      >
                        Upload to R2 First
                      </button>
                    </div>
                    <p className="text-[10px] text-[#8E9299] leading-relaxed">
                      Select which secure R2-uploaded object files are automatically bundled and delivered to buyers after checkout:
                    </p>

                    {r2Files.length === 0 ? (
                      <div className="border border-dashed border-white/5 rounded-xl p-4 text-center text-[10px] font-mono text-[#8E9299]">
                        No R2 file ledger entries found. Deploy file payloads via the Upload Center, then bind them here!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {r2Files.map(file => {
                          const isLinked = formFilesIncluded.includes(file.name);
                          return (
                            <div
                              key={file.id}
                              onClick={() => toggleLinkedFile(file.name)}
                              className={`rounded-xl border p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                isLinked
                                  ? 'border-[#D4FF5E] bg-[#D4FF5E]/5 text-white font-bold'
                                  : 'border-white/5 bg-[#0A0A0B]/30 text-[#8E9299] hover:border-white/10 hover:text-[#F4F4F4]'
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="block text-xs truncate max-w-[180px] sm:max-w-[200px] uppercase">{file.name}</span>
                                <span className="block text-[8px] font-mono text-[#8E9299] uppercase tracking-wider mt-0.5">Bucket: {file.bucket}</span>
                              </div>
                              <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center ${
                                isLinked ? 'border-[#D4FF5E] bg-[#D4FF5E] text-black' : 'border-white/10 bg-transparent'
                              }`}>
                                {isLinked && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: MINIMUM REQUIREMENTS & FAQS */}
              {workspaceTab === 'requirements' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4]">Dependencies & Host Requirements</h4>
                  </div>

                  {/* Dependencies tags */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-[#8E9299] uppercase tracking-widest block">
                      Product Architecture Dependencies
                    </span>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        placeholder="e.g. React 18, Tailwind CSS v4, Vite 5"
                        value={newDependency}
                        onChange={(e) => setNewDependency(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white w-full"
                      />
                      <button
                        type="button"
                        onClick={addDependency}
                        className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#F4F4F4]"
                      >
                        Link Stack
                      </button>
                    </div>

                    {formDependencies.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {formDependencies.map((dep, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono text-[#8E9299]">
                            <span>{dep}</span>
                            <button type="button" onClick={() => setFormDependencies(prev => prev.filter((_, i) => i !== idx))} className="text-white hover:text-rose-400 pl-1 text-[11px]">×</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#8E9299] block font-mono">No specific architectural dependencies listed.</span>
                    )}
                  </div>

                  {/* Minimum requirements inputs */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-[#8E9299] uppercase tracking-widest block">
                      Hardware & Software Specifications
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1.5">Operating System requirements</label>
                        <input
                          type="text"
                          value={reqOS}
                          onChange={(e) => setReqOS(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1.5">Memory Limit (RAM)</label>
                        <input
                          type="text"
                          value={reqRAM}
                          onChange={(e) => setReqRAM(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1.5">Processor Standard (CPU)</label>
                        <input
                          type="text"
                          value={reqCPU}
                          onChange={(e) => setReqCPU(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1.5">Hard Disk Size</label>
                        <input
                          type="text"
                          value={reqStorage}
                          onChange={(e) => setReqStorage(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FAQs manager */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-[#8E9299] uppercase tracking-widest block">
                      Frequently Asked Questions (FAQ Ledger)
                    </span>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="e.g. Is lifetime updates standard?"
                        value={newFaqQ}
                        onChange={(e) => setNewFaqQ(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white"
                      />
                      <textarea
                        rows={2}
                        placeholder="e.g. Yes! Every buyer gets access to version logs instantly after approval."
                        value={newFaqA}
                        onChange={(e) => setNewFaqA(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={addFaq}
                        className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#F4F4F4]"
                      >
                        Add FAQ Block
                      </button>
                    </div>

                    {formFaqs.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {formFaqs.map((faq, idx) => (
                          <div key={idx} className="rounded-xl border border-white/5 bg-[#0A0A0B]/40 p-3.5 relative">
                            <button
                              type="button"
                              onClick={() => setFormFaqs(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-2 right-2 text-xs text-[#8E9299] hover:text-rose-400 font-bold"
                            >
                              Remove
                            </button>
                            <span className="block text-xs font-black text-white uppercase tracking-wider pr-10">Q: {faq.question}</span>
                            <span className="block text-[11px] text-[#8E9299] mt-1">A: {faq.answer}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: DOCUMENTATION & CHANGELOG */}
              {workspaceTab === 'documentation' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4]">Asset Documentation & Changelog Logs</h4>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Asset Instruction Documentation (supports text/markdown)</label>
                    <textarea
                      rows={6}
                      placeholder="# Nexus React Dashboard Installation&#10;1. run `npm install`&#10;2. set environment variables in .env..."
                      value={formDocumentation}
                      onChange={(e) => setFormDocumentation(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] p-4 text-xs text-white font-mono"
                    />
                  </div>

                  {/* Add Version / Changelog history log */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-[#8E9299] uppercase tracking-widest block">
                      Release Version Logs (Changelog)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        placeholder="Version e.g. v1.1.0"
                        value={newVerNum}
                        onChange={(e) => setNewVerNum(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white font-mono"
                      />
                      <textarea
                        rows={1}
                        placeholder="Bullet points (one per line) of fixes"
                        value={newVerChangelog}
                        onChange={(e) => setNewVerChangelog(e.target.value)}
                        className="sm:col-span-2 rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addVersion}
                      className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#F4F4F4]"
                    >
                      Record Version Seal
                    </button>

                    {formVersions.length > 0 ? (
                      <div className="space-y-3 pt-2">
                        {formVersions.map((v, idx) => (
                          <div key={idx} className="rounded-xl border border-white/5 bg-[#0A0A0B]/20 p-3.5 font-mono text-xs">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider border-b border-white/5 pb-1 mb-2">
                              <span className="text-[#D4FF5E]">{v.version}</span>
                              <span className="text-[#8E9299]">{v.date}</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-[#8E9299]">
                              {v.changelog.map((change, cIdx) => (
                                <li key={cIdx}>{change}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#8E9299] block font-mono">No changelogs recorded. Base initial release v1.0.0 assumed.</span>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
