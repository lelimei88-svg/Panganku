import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  User, 
  ArrowRight, 
  TrendingUp,
  BarChart2, 
  ShieldCheck, 
  Plus, 
  Minus,
  Check,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CatalogViewProps {
  onAddToCart: (product: Product) => void;
  cartCount: number;
  onNavigateToCheckout: () => void;
  onNavigateToAdmin: () => void;
}

export default function CatalogView({
  onAddToCart,
  cartCount,
  onNavigateToCheckout,
  onNavigateToAdmin
}: CatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bumbu' | 'siap-saji' | 'minuman'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedPopup, setAddedPopup] = useState<string | null>(null);

  // Filter products
  const mainBahanPokok = INITIAL_PRODUCTS.filter(p => p.category === 'pokok');
  const [filteredSupporting, setFilteredSupporting] = useState<Product[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const supporting = INITIAL_PRODUCTS.filter(p => p.category !== 'pokok');
      const categoryFilter = selectedCategory === 'all' 
        ? supporting 
        : supporting.filter(p => p.category === selectedCategory);
      
      const searchFilter = categoryFilter.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredSupporting(searchFilter);
      setIsLoading(false);
    }, 450); // Cool TanStack-like query cache simulation speed

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleAddToCartWithFeedback = (product: Product) => {
    onAddToCart(product);
    setAddedPopup(product.name);
    setTimeout(() => {
      setAddedPopup(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-bg-light relative pb-16">
      
      {/* Dynamic Pop-up Feedback toast for Cart additions */}
      <AnimatePresence>
        {addedPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-primary-container"
          >
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm">
              Berhasil menambahkan <strong>{addedPopup}</strong> ke keranjang!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Panel compatible with modern Enterprise layout */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-100 shadow-xs h-16 flex items-center justify-between px-4 md:px-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedCategory('all')}>
            <span className="text-xl md:text-2xl font-black text-primary font-headline tracking-tight flex items-center gap-1">
              <ShoppingBag className="w-6 h-6 text-accent fill-accent" />
              PanganKu<span className="text-secondary font-medium text-base md:text-lg">Enterprise</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button 
              onClick={() => setSelectedCategory('all')} 
              className={`pb-1 border-b-2 transition-all cursor-pointer ${
                selectedCategory === 'all' ? 'border-secondary text-secondary font-bold' : 'border-transparent text-gray-500 hover:text-secondary'
              }`}
            >
              Beranda
            </button>
            <a href="#bahan-utama" className="text-gray-500 hover:text-secondary transition-colors">Katalog Utama</a>
            <a href="#bahan-pendukung" className="text-gray-500 hover:text-secondary transition-colors">Bahan Pendukung</a>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari bahan pokok..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-56 text-xs transition-all"
            />
          </div>

          {/* Cart Icon trigger */}
          <button 
            onClick={onNavigateToCheckout}
            className="relative p-2 text-gray-600 hover:text-secondary hover:bg-gray-50 rounded-full transition-all cursor-pointer active:scale-95"
            id="cart-btn"
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin panel switch */}
          <button 
            onClick={onNavigateToAdmin}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer"
            id="admin-panel-btn"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Konsol Admin</span>
          </button>
        </div>
      </header>

      {/* Main showcase scroll body */}
      <main className="pt-16">
        
        {/* Modern Immersive Hero Section */}
        <section className="relative w-full h-[450px] md:h-[520px] overflow-hidden">
          <img 
            alt="PanganKu Enterprise banner background" 
            className="absolute inset-0 w-full h-full object-cover brightness-65 object-center scale-105 motion-safe:animate-[pulse_10s_infinite_ease-in-out]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcLZV3hiIWu9IdLAngZ46Qcr89uS5cspaP8bR-aIsRJjF4gPVQiRW97z9uc34kZzp-XKp0KROmbpCRV0N5SiWMISRnlvOVEGhSiE5IBTq0vkjvVGFhlzJAbakQBkqSYAsi1QgfMlsdHu127JUwzF9FIvZSPsrXAShavcWoh9eQSl9DrvRObD0npbTRkcdGanb13NUHLuzU6nlR22K3Q11h18yeVRTrVthtYZAYqXMUmH6j2Y_mcGC35GdL7mE7__TsUQay3KCyquw"
          />
          {/* Subtle natural organic lighting look overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent flex items-center px-6 md:px-16" />
          
          <div className="absolute inset-0 flex items-center px-4 md:px-16 max-w-7xl mx-auto z-10">
            <div className="max-w-2xl text-white space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-semibold stroke-white border border-white/20">
                <Zap className="w-3 h-3 text-accent fill-accent" />
                <span>Pangan Segar Bergaransi Resmi</span>
              </div>
              <h1 className="font-headline text-3xl md:text-5xl font-extrabold leading-tight text-white tracking-tight">
                Penuhi Kebutuhan Dapur Anda dengan <span className="text-amber-300">Aman</span>, <span className="text-accent underline decoration-wavy">Hemat</span>, dan <span className="text-emerald-300">Cepat</span>.
              </h1>
              <p className="text-sm md:text-base font-medium text-white/80 leading-relaxed max-w-lg">
                Distribusi pangan skala enterprise dengan jaminan mutu terbaik dari petani binaan, didukung logistik pengiriman real-time terenkripsi.
              </p>
              <div className="flex gap-3 pt-2">
                <a 
                  href="#bahan-utama" 
                  className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-95 transition-all shadow-lg text-sm text-center"
                >
                  Mulai Belanja
                </a>
                <button 
                  onClick={onNavigateToCheckout}
                  className="border-2 border-white text-white px-5 py-3 rounded-xl font-bold hover:bg-white/10 transition-all text-sm"
                >
                  Halaman Checkout
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Body Container */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16">
          
          {/* Section: BAHAN POKOK UTAMA */}
          <section id="bahan-utama" className="scroll-mt-20">
            <div className="flex justify-between items-end mb-8 border-l-4 border-primary pl-4">
              <div>
                <h2 className="font-headline text-2xl font-black text-primary uppercase">BAHAN POKOK UTAMA</h2>
                <p className="text-gray-500 text-xs md:text-sm">Kebutuhan dasar dengan mutu premium pilihan terbaik.</p>
              </div>
              <a href="#bahan-pendukung" className="text-secondary font-bold text-xs hover:underline flex items-center gap-1 transition-all">
                Bahan Pendukung <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Grid layout for featured primary items with special hero card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
              
              {/* Product Hero Spotlight card (Beras Premium) */}
              {mainBahanPokok.length > 0 && (
                <div className="md:col-span-2 md:row-span-1 group relative overflow-hidden bg-white rounded-2xl border border-emerald-100 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 ring-2 ring-emerald-500/10">
                  <span className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-[10px] font-bold z-10 tracking-widest uppercase">
                    🔥 TERLARIS MINGGU INI
                  </span>
                  
                  <div className="relative h-64 md:h-72 mb-4 overflow-hidden rounded-xl bg-gray-50">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src={mainBahanPokok[0].image} 
                      alt={mainBahanPokok[0].name}
                    />
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-accent text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                        {mainBahanPokok[0].discountTag}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-headline text-lg md:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {mainBahanPokok[0].name}
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-headline text-xl md:text-2xl font-black text-primary">
                        Rp {mainBahanPokok[0].price.toLocaleString('id-ID')}
                      </span>
                      {mainBahanPokok[0].originalPrice && (
                        <span className="text-gray-400 line-through text-xs font-semibold">
                          Rp {mainBahanPokok[0].originalPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-500 text-xs leading-relaxed max-w-md line-clamp-2">
                      {mainBahanPokok[0].description}
                    </p>
                  </div>

                  <button 
                    onClick={() => handleAddToCartWithFeedback(mainBahanPokok[0])}
                    className="w-full mt-6 bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-secondary/10"
                    id={`add-featured-${mainBahanPokok[0].id}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Tambah ke Keranjang
                  </button>
                </div>
              )}

              {/* Standard Primary Materials loop (the remaining three) */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {mainBahanPokok.slice(1).map((item) => (
                  <div 
                    key={item.id} 
                    className="group bg-white rounded-2xl border border-gray-100 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      <div className="h-40 mb-3 overflow-hidden rounded-xl bg-gray-50">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          src={item.image} 
                          alt={item.name}
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-secondary tracking-widest block mb-1">
                        Bahan Utama • {item.unit}
                      </span>
                      <h4 className="font-headline text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-2 mt-1 min-h-[32px]">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col gap-2">
                      <span className="text-primary font-extrabold text-base md:text-lg">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                      <button 
                        onClick={() => handleAddToCartWithFeedback(item)}
                        className="w-full border border-primary text-primary hover:bg-primary hover:text-white py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        id={`add-${item.id}`}
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* Section: BAHAN PENDUKUNG / PELENGKAP */}
          <section id="bahan-pendukung" className="pt-4 scroll-mt-20">
            <div className="mb-6">
              <h2 className="font-headline text-2xl font-black text-primary uppercase">
                BAHAN PENDUKUNG / PELENGKAP
              </h2>
              <p className="text-gray-500 text-xs md:text-sm mt-1">Lengkapi kebutuhan kreasi masakan Anda di rumah dengan harga super hemat.</p>
              
              {/* Category Filter Pills */}
              <div className="flex gap-2.5 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { id: 'all', label: 'Semua Produk' },
                  { id: 'bumbu', label: 'Bumbu & Sayur' },
                  { id: 'siap-saji', label: 'Lauk & Siap Saji' },
                  { id: 'minuman', label: 'Minuman Segar' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-5 py-2 rounded-full font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat.id 
                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated TanStack Loading & Products Grid */}
            <div className="relative min-h-[300px]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="skeleton-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-6"
                  >
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="space-y-3 p-4 bg-white rounded-2xl border border-gray-100">
                        <div className="h-32 w-full skeleton-pulse rounded-xl" />
                        <div className="h-3 w-3/4 skeleton-pulse rounded" />
                        <div className="h-5 w-1/2 skeleton-pulse rounded" />
                        <div className="h-8 w-full skeleton-pulse rounded-lg" />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="products-loaded"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 lg:grid-cols-5 gap-6"
                    id="product-grid"
                  >
                    {filteredSupporting.length === 0 ? (
                      <div className="col-span-full py-16 text-center space-y-2">
                        <p className="text-gray-400 text-sm font-medium">Bahan tersebut tidak dapat ditemukan.</p>
                        <p className="text-xs text-gray-300">Harap mencari dengan istilah kata kunci produk lain.</p>
                      </div>
                    ) : (
                      filteredSupporting.map((product) => (
                        <div 
                          key={product.id}
                          className="group bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                        >
                          <div>
                            <div className="h-32 mb-3 overflow-hidden rounded-xl bg-gray-50 relative">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-[2px] text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                                {product.unit}
                              </span>
                            </div>
                            <h4 className="font-headline text-xs md:text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                              {product.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-2 border-t border-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-primary font-extrabold text-sm md:text-base">
                                Rp {product.price.toLocaleString('id-ID')}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleAddToCartWithFeedback(product)}
                              className="w-full border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-transparent py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 cursor-pointer"
                              id={`add-badge-${product.id}`}
                            >
                              Tambah
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Section: Modern Enterprise Infrastructure Showcase */}
          <section className="bg-emerald-50/50 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-100">
            <div className="md:max-w-2xl space-y-3">
              <span className="px-3 py-1 bg-emerald-100 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                🛡️ Enterprise Infrastructure
              </span>
              <h3 className="font-headline text-lg md:text-2xl font-black text-primary">
                Modern Enterprise Food Infrastructure & Sourcing
              </h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                PanganKu Enterprise menggunakan teknologi mutakhir untuk memastikan ketersediaan data real-time. Kami memanfaatkan <strong>TanStack Query</strong> untuk manajemen caching yang efisien dan <strong>Supabase RLS (Row Level Security)</strong> untuk menjamin keamanan enkripsi data transaksi pelanggan Anda di tingkat database.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-white rounded-lg border border-emerald-100 text-[10px] font-bold text-primary shadow-xs">
                  ⚡ High Availability 99.99%
                </span>
                <span className="px-3 py-1 bg-white rounded-lg border border-emerald-100 text-[10px] font-bold text-primary shadow-xs">
                  🔑 End-to-End CSRF Encryption
                </span>
                <span className="px-3 py-1 bg-white rounded-lg border border-emerald-100 text-[10px] font-bold text-primary shadow-xs">
                  🥬 Petani Lokal Binaan
                </span>
              </div>
            </div>
            
            <div className="w-full md:w-56 h-36 bg-primary rounded-2xl flex flex-col items-center justify-center p-4 text-white text-center shadow-lg relative overflow-hidden">
              <BarChart2 className="w-12 h-12 text-accent stroke-1 animate-[bounce_2.5s_infinite_ease-in-out]" />
              <span className="font-headline text-lg font-extrabold mt-2">Logistics Sync</span>
              <span className="text-[9px] font-mono text-emerald-300">Live DB Connection active</span>
              {/* background vector effect */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
            </div>
          </section>

        </div>
      </main>

      {/* Corporate Clean Footer */}
      <footer className="bg-gray-905 border-t border-gray-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <span className="font-headline font-black text-lg text-primary">
              PanganKu <span className="text-secondary font-medium text-sm">Enterprise</span>
            </span>
            <p className="text-xs text-gray-400">© 2026 PanganKu Enterprise. Hak Cipta Dilindungi Undang-Undang.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500 font-medium">
            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-primary transition-colors">Etika Rantai Pasok</a>
            <a href="#" className="hover:text-primary transition-colors">Hubungi Bantuan</a>
          </div>
          
          <div className="flex gap-4">
            <span className="text-xs text-gray-400 flex items-center gap-1 hover:text-primary cursor-pointer">
              🌐 Bahasa Indonesia
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
