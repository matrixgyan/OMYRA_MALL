import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Layout, Code, BookOpen, Layers, Music, Star, ArrowRight, ShieldCheck, RefreshCw, Key, ShoppingCart, Library as LibIcon, PlusCircle, HelpCircle, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import Library from './components/Library';
import CreatorDashboard from './components/CreatorDashboard';
import StorageDashboard from './components/StorageDashboard';
import { INITIAL_PRODUCTS } from './data';
import { Product, CartItem, Purchase, Review } from './types';

export default function App() {
  // Global React States
  const [activeTab, setActiveTab] = useState<'marketplace' | 'library' | 'creator' | 'storage'>('marketplace');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchased, setPurchased] = useState<{ id: string; title: string; price: number; coverImage: string; category: string; downloadUrl: string }[]>([]);
  
  // Browsing filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('trending');

  // UI state toggles
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Active Checkout metrics
  const [checkoutValues, setCheckoutValues] = useState({
    subtotal: 0,
    discount: 0,
    total: 0,
    promoApplied: ''
  });

  // Local Storage Synchronization
  useEffect(() => {
    const savedProducts = localStorage.getItem('omyra_products');
    const savedCart = localStorage.getItem('omyra_cart');
    const savedPurchased = localStorage.getItem('omyra_purchased');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('omyra_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    if (savedPurchased) {
      setPurchased(JSON.parse(savedPurchased));
    }
  }, []);

  const saveProductsToStorage = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('omyra_products', JSON.stringify(updatedProducts));
  };

  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('omyra_cart', JSON.stringify(updatedCart));
  };

  const savePurchasedToStorage = (updatedPurchased: any[]) => {
    setPurchased(updatedPurchased);
    localStorage.setItem('omyra_purchased', JSON.stringify(updatedPurchased));
  };

  // Add to Cart
  const handleAddToCart = (product: Product) => {
    const alreadyExists = cart.find(item => item.product.id === product.id);
    if (alreadyExists) {
      setIsCartOpen(true);
      return;
    }

    const newCart = [...cart, { product, quantity: 1 }];
    saveCartToStorage(newCart);
    
    // Smooth auto-slide of cart to show immediate action feedback
    setIsCartOpen(true);
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    const newCart = cart.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCartToStorage(newCart);
  };

  // Remove from Cart
  const handleRemoveItem = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCartToStorage(newCart);
  };

  // Trigger Checkout Transition
  const handleCheckoutTrigger = (subtotal: number, discount: number, total: number, promoApplied: string) => {
    setCheckoutValues({ subtotal, discount, total, promoApplied });
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Complete Simulated Purchase
  const handlePurchaseComplete = (boughtList: any[]) => {
    // Merge new downloads into user's existing inventory
    const existingIds = new Set(purchased.map(p => p.id));
    const newlyBought = boughtList.filter(item => !existingIds.has(item.id));
    const finalLibraryList = [...purchased, ...newlyBought];

    savePurchasedToStorage(finalLibraryList);
    saveCartToStorage([]); // Clear checkout items
    setIsCheckoutOpen(false);
    
    // Instantly transition user to their visual purchased assets library
    setActiveTab('library');
  };

  // Add Custom Product Review
  const handleAddReview = (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const reviewId = `rev-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newReview: Review = {
      id: reviewId,
      date: today,
      ...reviewData
    };

    const updatedProducts = products.map(prod => {
      if (prod.id === productId) {
        const updatedReviews = [newReview, ...prod.reviews];
        // Dynamic re-calculations of ratings averages
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newRatingAvg = parseFloat((totalRating / updatedReviews.length).toFixed(2));
        
        return {
          ...prod,
          reviews: updatedReviews,
          rating: newRatingAvg,
          reviewCount: updatedReviews.length
        };
      }
      return prod;
    });

    saveProductsToStorage(updatedProducts);

    // Dynamic reactive refresh of modal viewport detail if open
    const refreshedProduct = updatedProducts.find(p => p.id === productId);
    if (refreshedProduct) {
      setSelectedProduct(refreshedProduct);
    }
  };

  // Sell/Publish New Product Listing
  const handlePublishProduct = (newProdData: Omit<Product, 'id' | 'createdAt' | 'downloads' | 'reviews' | 'rating' | 'reviewCount'>) => {
    const newId = `prod-custom-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      id: newId,
      createdAt: today,
      downloads: 0,
      reviews: [],
      rating: 5.0,
      reviewCount: 0,
      ...newProdData
    };

    const updatedProducts = [newProduct, ...products];
    saveProductsToStorage(updatedProducts);
  };

  // Filter Catalog Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sort Catalog Products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'popular') return b.downloads - a.downloads;
    return b.downloads - a.downloads; // Default trending
  });

  return (
    <div id="omyra-mall-app" className="min-h-screen bg-[#0A0A0B] font-sans text-slate-300 flex flex-col selection:bg-[#D4FF5E] selection:text-black">
      
      {/* Dynamic Header & Category tags */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        setIsCartOpen={setIsCartOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'marketplace' && (
          <div className="space-y-12">
            
            {/* Visual Hero Section Banner */}
            <section id="hero-banner" className="relative rounded-[40px] border border-white/10 bg-[#161618] overflow-hidden py-16 md:py-24 px-6 md:px-12 text-center flex flex-col items-center">
              {/* Abstract decorative ambient background bubbles */}
              <div className="absolute top-[-20%] left-[-10%] h-80 w-80 rounded-full bg-[#D4FF5E]/5 blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-20%] right-[-10%] h-80 w-80 rounded-full bg-[#D4FF5E]/5 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4FF5E]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#D4FF5E] border border-[#D4FF5E]/20 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium Digital Artifacts Marketplace
                </span>
                
                <h1 className="font-display text-4xl md:text-6xl font-black uppercase italic tracking-tight text-white leading-[1.08]">
                  Discover Elite <span className="text-[#D4FF5E] not-italic">Developer Assets</span> & UI Systems
                </h1>
                
                <p className="text-xs md:text-sm text-[#8E9299] max-w-xl mx-auto leading-relaxed font-semibold">
                  OMYRA MALL is a curated marketplace of beautiful UI templates, full-stack blueprints, developer e-books, and 3D icons crafted by elite creators.
                </p>

                {/* Inline Search Bar on Hero Segment */}
                <div className="relative max-w-md mx-auto w-full pt-4">
                  <Compass className="absolute left-4 top-7.5 h-4 w-4 text-[#8E9299]" />
                  <input
                    id="hero-search-input"
                    type="text"
                    placeholder="Search templates, guides, design packages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3.5 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:bg-black focus:outline-none transition-all duration-350"
                  />
                </div>
              </div>
            </section>

            {/* Catalog Grid Section */}
            <section id="catalog-section" className="space-y-6">
              
              {/* Filters / Sort bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <span>Premium Catalogs</span>
                    {selectedCategory !== 'all' && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#D4FF5E] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-2.5 py-1 rounded-full">
                        {selectedCategory}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#8E9299] mt-1 font-semibold">Found {sortedProducts.length} developer templates ready for production downloads.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8E9299] font-black uppercase tracking-wider">Sort:</span>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#161618] py-1.5 px-3 text-xs font-semibold text-white focus:outline-none focus:border-[#D4FF5E] cursor-pointer"
                  >
                    <option value="trending">🔥 Trending Hits</option>
                    <option value="popular">💎 Most Downloads</option>
                    <option value="rating">⭐ Best Rated</option>
                    <option value="price-low">💸 Lowest Price</option>
                    <option value="price-high">📈 Highest Price</option>
                  </select>
                </div>
              </div>

              {/* Grid or empty state */}
              {sortedProducts.length === 0 ? (
                <div id="catalog-empty-state" className="text-center py-20 rounded-3xl border border-dashed border-white/10 bg-[#161618]/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8E9299]">No products found matching "{searchQuery}". Try searching for Figma, Code, or Audio.</p>
                  <button 
                    id="reset-search-btn"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                    className="mt-6 rounded-xl bg-[#D4FF5E] hover:bg-[#c3ec4e] px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div id="products-catalog-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={setSelectedProduct}
                      onAddToCart={handleAddToCart}
                      isAlreadyInCart={cart.some(item => item.product.id === product.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Why OMYRA MALL Bento Highlight Segment */}
            <section id="features-highlights" className="space-y-6 pt-6">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4FF5E] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-3 py-1.5 rounded-full">
                  Secure Infrastructure
                </span>
                <h2 className="mt-4 font-display text-2xl font-black uppercase italic tracking-tight text-white">Engineered For Digital Assets</h2>
                <p className="text-xs text-[#8E9299] mt-1 max-w-md mx-auto font-medium">We audit every file listed to guarantee developers a pristine integration workspace.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="rounded-[28px] border border-white/10 bg-[#161618] p-6 md:p-8 space-y-3.5 hover:border-[#D4FF5E]/20 transition-all duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4FF5E]/10 text-[#D4FF5E]">
                    <ShieldCheck className="h-5 w-5 text-[#D4FF5E]" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">256-Bit SSL Escrows</h3>
                  <p className="text-xs text-[#8E9299] leading-relaxed font-semibold">
                    All financial operations undergo robust cryptographic checkouts. Creator compensation is settled automatically.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[#161618] p-6 md:p-8 space-y-3.5 hover:border-[#D4FF5E]/20 transition-all duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4FF5E]/10 text-[#D4FF5E]">
                    <Zap className="h-5 w-5 text-[#D4FF5E]" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Instant ZIP Downloads</h3>
                  <p className="text-xs text-[#8E9299] leading-relaxed font-semibold">
                    No waiting for physical delivery. Upon purchasing, access is granted to download complete codebase, PDFs, or design files immediately.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[#161618] p-6 md:p-8 space-y-3.5 hover:border-[#D4FF5E]/20 transition-all duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4FF5E]/10 text-[#D4FF5E]">
                    <RefreshCw className="h-5 w-5 text-[#D4FF5E]" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Lifetime updates</h3>
                  <p className="text-xs text-[#8E9299] leading-relaxed font-semibold">
                    Sellers list standard updates for their artifacts. You can re-download newer versions inside your library anytime for free.
                  </p>
                </div>

              </div>
            </section>

          </div>
        )}

        {activeTab === 'library' && (
          <Library
            purchasedAssets={purchased}
            onBrowseMall={() => { setActiveTab('marketplace'); setSelectedCategory('all'); }}
          />
        )}

        {activeTab === 'creator' && (
          <CreatorDashboard
            products={products}
            onPublishProduct={handlePublishProduct}
            onUpdateProducts={saveProductsToStorage}
          />
        )}

        {activeTab === 'storage' && (
          <StorageDashboard />
        )}

      </main>

      {/* Cart sliding drawer overlay */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckoutTrigger}
      />

      {/* Checkout wizard overlay */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={checkoutValues.subtotal}
        discount={checkoutValues.discount}
        total={checkoutValues.total}
        promoCodeApplied={checkoutValues.promoApplied}
        cartItems={cart}
        onPurchaseComplete={handlePurchaseComplete}
      />

      {/* Product detail overlays */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isAlreadyInCart={cart.some(item => item.product.id === selectedProduct.id)}
          onAddReview={handleAddReview}
        />
      )}

      {/* Sleek Minimalist Footer */}
      <footer id="omyra-footer" className="mt-20 border-t border-white/5 bg-[#0A0A0B] py-10 text-center text-xs text-[#8E9299]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <span className="font-display font-black text-white text-base tracking-widest uppercase italic">
            OMYRA <span className="text-[#D4FF5E]">MALL</span>
          </span>
          <p className="font-medium text-[11px] uppercase tracking-wider">© 2026 OMYRA MALL. Fully automated instant delivery digital workspace. All rights reserved.</p>
          <div className="flex justify-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition-colors">Security Audits</span>
            <span className="hover:text-white cursor-pointer transition-colors">Sellers Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">License Policies</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
