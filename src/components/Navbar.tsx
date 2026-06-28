import React, { useState } from 'react';
import { ShoppingCart, Search, BookOpen, Layout, Code, Music, Layers, Library as LibraryIcon, PlusCircle, Sparkles, Menu, X, Compass, HardDrive } from 'lucide-react';
import { Product } from '../types';

interface NavbarProps {
  activeTab: 'marketplace' | 'library' | 'creator' | 'storage';
  setActiveTab: (tab: 'marketplace' | 'library' | 'creator' | 'storage') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  cartCount,
  setIsCartOpen,
  selectedCategory,
  setSelectedCategory
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Assets', icon: Compass },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'code', label: 'Code & Dev', icon: Code },
    { id: 'ebooks', label: 'Books & Guides', icon: BookOpen },
    { id: 'design', label: '3D & Design', icon: Layers },
    { id: 'audio', label: 'Audio & Beats', icon: Music },
  ];

  return (
    <header id="omyra-navbar" className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0A0B]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Logo Brand Signifier */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('marketplace'); setSelectedCategory('all'); }}>
            <div className="w-10 h-10 bg-[#D4FF5E] rounded-full flex items-center justify-center transition-transform hover:rotate-12 duration-300">
              <div className="w-4 h-4 border-2 border-black rotate-45"></div>
            </div>
            <span className="font-display text-2xl font-black tracking-tighter uppercase text-white">
              Omyra Mall
            </span>
          </div>

          {/* Search bar - hidden or minimized on small screens */}
          {activeTab === 'marketplace' && (
            <div className="hidden md:flex relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5">
                <Search className="h-4 w-4 text-[#8E9299]" />
              </div>
              <input
                id="global-search-input"
                type="text"
                placeholder="Search premium templates, scripts, e-books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-[#161618] py-2.5 pl-11 pr-4 text-sm text-[#F4F4F4] placeholder-[#8E9299] focus:border-[#D4FF5E] focus:bg-[#161618] focus:outline-none focus:ring-1 focus:ring-[#D4FF5E] transition-all duration-300"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#8E9299] hover:text-[#F4F4F4] text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              id="nav-marketplace-tab"
              onClick={() => setActiveTab('marketplace')}
              className={`px-1 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'text-[#D4FF5E] border-b-2 border-[#D4FF5E]'
                  : 'text-[#8E9299] hover:text-white border-b-2 border-transparent'
              }`}
            >
              Marketplace
            </button>
            <button
              id="nav-library-tab"
              onClick={() => setActiveTab('library')}
              className={`px-1 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                activeTab === 'library'
                  ? 'text-[#D4FF5E] border-b-2 border-[#D4FF5E]'
                  : 'text-[#8E9299] hover:text-white border-b-2 border-transparent'
              }`}
            >
              My Purchases
            </button>
            <button
              id="nav-creator-tab"
              onClick={() => setActiveTab('creator')}
              className={`px-1 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                activeTab === 'creator'
                  ? 'text-[#D4FF5E] border-b-2 border-[#D4FF5E]'
                  : 'text-[#8E9299] hover:text-white border-b-2 border-transparent'
              }`}
            >
              Sell / Creator Portal
            </button>
            <button
              id="nav-storage-tab"
              onClick={() => setActiveTab('storage')}
              className={`px-1 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                activeTab === 'storage'
                  ? 'text-[#D4FF5E] border-b-2 border-[#D4FF5E]'
                  : 'text-[#8E9299] hover:text-white border-b-2 border-transparent'
              }`}
            >
              R2 Storage Admin
            </button>
          </nav>

          {/* Cart & Controls */}
          <div className="flex items-center gap-3">
            <button
              id="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#161618] text-[#F4F4F4] hover:border-[#D4FF5E] hover:text-[#D4FF5E] focus:outline-none transition-all duration-300 cursor-pointer"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4FF5E] text-[10px] font-black text-black shadow-md ring-2 ring-[#0A0A0B] animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#161618] text-[#F4F4F4] lg:hidden hover:bg-slate-850 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div id="mobile-nav-panel" className="lg:hidden border-t border-white/10 bg-[#0A0A0B] px-4 py-4 animate-in fade-in duration-200">
          {/* Mobile Search Bar */}
          {activeTab === 'marketplace' && (
            <div className="relative mb-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[#8E9299]" />
              </div>
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search templates, scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#161618] py-2 pl-10 pr-4 text-sm text-[#F4F4F4] placeholder-[#8E9299] focus:border-[#D4FF5E] focus:outline-none"
              />
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex flex-col gap-2">
            <button
              id="mobile-nav-marketplace"
              onClick={() => { setActiveTab('marketplace'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest ${
                activeTab === 'marketplace' ? 'bg-[#161618] text-[#D4FF5E] border border-white/10' : 'text-[#8E9299]'
              }`}
            >
              <Compass className="h-5 w-5" />
              Marketplace
            </button>
            <button
              id="mobile-nav-library"
              onClick={() => { setActiveTab('library'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest ${
                activeTab === 'library' ? 'bg-[#161618] text-[#D4FF5E] border border-white/10' : 'text-[#8E9299]'
              }`}
            >
              <LibraryIcon className="h-5 w-5" />
              My Purchases
            </button>
            <button
              id="mobile-nav-creator"
              onClick={() => { setActiveTab('creator'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest ${
                activeTab === 'creator' ? 'bg-[#161618] text-[#D4FF5E] border border-white/10' : 'text-[#8E9299]'
              }`}
            >
              <PlusCircle className="h-5 w-5" />
              Sell / Creator Portal
            </button>
            <button
              id="mobile-nav-storage"
              onClick={() => { setActiveTab('storage'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest ${
                activeTab === 'storage' ? 'bg-[#161618] text-[#D4FF5E] border border-white/10' : 'text-[#8E9299]'
              }`}
            >
              <HardDrive className="h-5 w-5" />
              R2 Storage Admin
            </button>
          </div>

          {/* Quick Categories list in mobile menu */}
          {activeTab === 'marketplace' && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8E9299] px-4">Filter Category</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      id={`mobile-cat-${cat.id}`}
                      onClick={() => { setSelectedCategory(cat.id); setIsMobileMenuOpen(false); }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#D4FF5E]/15 text-[#D4FF5E] border border-[#D4FF5E]/30'
                          : 'bg-[#161618] text-[#8E9299] hover:text-[#F4F4F4] border border-transparent'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Horizontal Sub-Navbar with Category Tags (Desktop only) */}
      {activeTab === 'marketplace' && (
        <div id="category-bar" className="hidden lg:block border-t border-white/5 bg-[#0A0A0B]/60">
          <div className="mx-auto max-w-7xl px-8">
            <div className="flex items-center justify-start gap-4 h-14 overflow-x-auto scrollbar-none py-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`desktop-cat-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 cursor-pointer border ${
                      isActive
                        ? 'bg-[#D4FF5E] text-black border-[#D4FF5E] shadow-lg shadow-[#D4FF5E]/10'
                        : 'text-[#8E9299] hover:text-white bg-[#161618]/50 border-white/5 hover:bg-[#161618]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
