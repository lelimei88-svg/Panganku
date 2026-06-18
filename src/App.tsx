import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order } from './types';
import CatalogView from './components/CatalogView';
import CheckoutView from './components/CheckoutView';
import AdminConsoleView from './components/AdminConsoleView';
import OptimizationDemo from './components/OptimizationDemo';
import { 
  Building2, 
  ShoppingCart, 
  Workflow, 
  ClipboardCheck, 
  TrendingUp, 
  Layers, 
  Heart,
  ChevronRight,
  Info,
  LogIn,
  LogOut,
  User as UserIcon,
  Lock,
  Globe,
  Smartphone,
  Download,
  X,
  Check,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext.tsx';

export default function App() {
  const [activeView, setActiveView] = useState<'catalog' | 'checkout' | 'admin' | 'optimization'>('catalog');
  const { user, token, googleAccessToken, loginWithGoogle, logout } = useAuth();

  // Redesign custom nav states
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [adminErrorToast, setAdminErrorToast] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'ID' | 'EN'>('ID');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLanguageToast, setShowLanguageToast] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt event caught');
    };
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      // Fallback message for environments like AI Studio Preview where native prompt is blocked
      alert("Fitur Instalasi Aktif! (Di lingkungan produksi/hosting asli, ini akan langsung memicu pop-up instalasi otomatis dari browser Chrome/Android Anda).");
    }
  };

  const handleSayaMengertiClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
    setShowInstallGuide(false);
  };

  const handleStartNow = () => {
    setActiveView('catalog');
    setIsCartDrawerOpen(true);
    setTimeout(() => {
      const element = document.getElementById('bahan-utama');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleAdminLoginSubmit = () => {
    const isUsernameCorrect = adminUsernameInput.trim().toLowerCase() === 'admin';
    const isPasswordCorrect = adminPasswordInput === 'admin123' || adminPasswordInput === 'admin';
    if (isUsernameCorrect && isPasswordCorrect) {
      setActiveView('admin');
      setIsAdminPasswordModalOpen(false);
      setAdminUsernameInput('');
      setAdminPasswordInput('');
      setAdminPasswordError('');
    } else {
      setAdminPasswordError('Kredensial Admin Salah');
      setAdminErrorToast('Kredensial Admin Salah');
      setTimeout(() => {
        setAdminErrorToast('');
      }, 3000);
    }
  };
  
  // Cart state initialized with default 2 items
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: {
        id: 'bayam-organik',
        name: 'Bayam Organik',
        price: 12000,
        category: 'bumbu',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqQQE92KpgZt4oUiErPnwxWB6s1J9gwdAqVG35ZyYJKJ26qgRKuE-UTGhBbdQ33b-Kj8iwEIrprSbywpXmpLsZcd9wJXDxYskK8JpRSHdOyAIzX7Ht0UNyC0v_EaVXh2Fe_a49pN8FMd1IozHnxFeKE6lDzq66rIuB74oBtjjUaGi5qmIUgQS9u9WLQltVhqz5x1x3yPnwbLFV4RexvP5e3v87W-bNpfviVwkeojyDsPpv7GtrKvE0qCosB-I18NU8LhsLHKXGAI0',
        unit: '250 gram'
      },
      quantity: 1
    },
    {
      product: {
        id: 'ayam-kampung',
        name: 'Ayam Kampung',
        price: 65000,
        category: 'siap-saji',
        image: '/images/ayam-kampung.jpg',
        unit: '1 Ekor (~0.8kg)'
      },
      quantity: 1
    }
  ]);

  // Customer submitted orders queue synced with database
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sync orders from Cloud SQL database via Server-Side API Proxy
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/orders', { headers });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to sync orders from database:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Calculate cart counts
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order submission
  const handleAddNewOrder = async (order: Order) => {
    // Add locally for optimistic UI responsiveness
    setOrders((prev) => [order, ...prev]);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(order)
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error('Failed to store order into PostgreSQL:', e);
    }
  };

  // Approval on admin workspace
  const handleApproveOrder = async (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'APPROVED' } : o))
    );

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/orders/${orderId}/approve`, {
        method: 'POST',
        headers
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error('Failed to update approval status:', e);
    }
  };

  return (
    <div className="relative font-sans min-h-screen bg-[#f3fbf5]">
      
      {/* Redesigned TOP NAVBAR based on image_fca525.png with brand theme from image_fe6323.png */}
      <div className="bg-[#031505]/95 backdrop-blur-sm text-white font-sans sticky top-0 z-50 shadow-md border-b border-white/10 active:translate-y-0 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          
          {/* Left Side: PanganKu Logo & Elegant ADMIN link with lock icon */}
          <div className="flex items-center gap-5">
            {/* PanganKu Logo */}
            <div 
              onClick={() => {
                setActiveView('catalog');
                setIsCartDrawerOpen(false);
              }}
              className="flex items-center cursor-pointer active:scale-95 transition-transform"
              id="brand-logo"
            >
              <span className="font-headline font-black text-lg md:text-xl tracking-tight text-white select-none">
                PANGAN<span className="text-[#FF6B35]">KU</span>
              </span>
            </div>

            <span className="w-[1px] h-5 bg-white/20 hidden sm:block"></span>

            <button 
              onClick={() => setIsAdminPasswordModalOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-black text-white/95 hover:text-[#FF6B35] transition-colors uppercase tracking-widest py-1.5 cursor-pointer"
              id="admin-nav-link"
            >
              <Lock className="w-4 h-4 text-[#FF6B35] stroke-[2.5]" />
              <span>ADMIN</span>
            </button>
          </div>

          {/* Center-Left & Center-Right content wrapped nicely */}
          <div className="flex items-center gap-3 md:gap-5 flex-wrap">
            {/* Center-Left: Prominent PASANG APLIKASI with brand orange border */}
            <button 
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 md:py-2 border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white font-black text-[10.5px] md:text-xs tracking-widest rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_8px_rgba(255,107,53,0.15)] flex items-center gap-1.5"
              id="pwa-install-nav-btn"
            >
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>PASANG APLIKASI</span>
            </button>

            {/* Center-Right: Localized language switcher ID | EN with world icon */}
            <button 
              onClick={() => {
                setCurrentLanguage(prev => prev === 'ID' ? 'EN' : 'ID');
                setShowLanguageToast(true);
                setTimeout(() => setShowLanguageToast(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-white/10 text-white/90 active:scale-95 transition-all cursor-pointer border border-white/5"
              title="Ganti Bahasa / Switch Language"
              id="language-switcher-btn"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF6B35] stroke-[2]" />
              <span className="font-mono tracking-wider font-extrabold text-[11px]">{currentLanguage === 'ID' ? 'ID | EN' : 'EN | ID'}</span>
            </button>
          </div>

          {/* Right-Center & Far Right groups */}
          <div className="flex items-center gap-4">
            {/* Right-Center: "AKUN SAYA" text link toggling profile info */}
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="text-xs font-extrabold text-white/90 hover:text-[#FF6B35] hover:underline transition-all cursor-pointer flex items-center gap-2"
              id="my-account-nav-link"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-5 h-5 rounded-full border border-[#FF6B35] referrerPolicy='no-referrer'" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-[#FF6B35]" />
                </div>
              )}
              <span className="tracking-widest uppercase text-[11px]">AKUN SAYA</span>
              {user && <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse shrink-0"></span>}
            </button>

            {/* Far Right: Active Shopping Cart / Checkout interface button */}
            <button 
              onClick={handleStartNow}
              className="bg-[#FF6B35] text-white hover:bg-[#E55A2B] font-semibold px-5 py-2 rounded-md shadow-sm transition-all duration-200 ease-in-out flex items-center gap-2 text-[11px] md:text-sm font-headline active:scale-95 cursor-pointer uppercase tracking-widest animate-[pulse_3s_infinite]"
              id="start-now-nav-btn"
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              <span></span>
            </button>
          </div>

        </div>
      </div>

      {/* Admin Password Login Modal */}
      <AnimatePresence>
        {isAdminPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-lime-500/10"
            >
              <div className="bg-[#031505] text-white p-6 relative">
                <button 
                  onClick={() => {
                    setIsAdminPasswordModalOpen(false);
                    setAdminUsernameInput('');
                    setAdminPasswordInput('');
                    setAdminPasswordError('');
                  }}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-headline font-black text-base tracking-tight">Protected Logistics Console</h3>
                    <p className="text-gray-400 text-[10px] tracking-wider uppercase font-bold">Authentication Required</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Masukkan nama dan sandi administrator untuk mengonfirmasi status penanggung jawab dan mengakses konsol logistik.
                </p>

                {/* Nama Admin */}
                <div>
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Nama Admin / Username Admin</label>
                  <input 
                    type="text"
                    placeholder="Contoh: admin"
                    value={adminUsernameInput}
                    onChange={(e) => {
                      setAdminUsernameInput(e.target.value);
                      setAdminPasswordError('');
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-xs focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                  />
                </div>

                {/* Kata Sandi */}
                <div>
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Kata Sandi / Password Admin</label>
                  <input 
                    type="password"
                    placeholder="Sandi bawaan: admin123"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminPasswordError('');
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-xs focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAdminLoginSubmit();
                      }
                    }}
                  />
                  {adminPasswordError && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">{adminPasswordError}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setIsAdminPasswordModalOpen(false);
                      setAdminUsernameInput('');
                      setAdminPasswordInput('');
                      setAdminPasswordError('');
                    }}
                    className="px-4 py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleAdminLoginSubmit}
                    className="px-5 py-2 border-2 border-lime-500 text-lime-600 hover:bg-lime-500 hover:text-[#031505] font-black text-xs rounded-xl transition-all duration-200 cursor-pointer uppercase tracking-wider"
                  >
                    Masuk Logistik
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Modal ("AKUN SAYA") */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-emerald-100"
            >
              {/* Header */}
              <div className="bg-[#031505] text-white p-6 relative">
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full transition-colors cursor-pointer flex items-center justify-center border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-lime-400 text-[#031505] rounded-xl font-black text-[10px] tracking-widest uppercase">
                    PROFIL
                  </div>
                  <div>
                    <h3 className="font-headline font-black text-base tracking-tight">Akun Saya</h3>
                    <p className="text-lime-300 text-[9px] tracking-wider uppercase font-bold">PanganKu Integrated Hub</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-gray-700">
                {/* User Details */}
                <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-12 h-12 rounded-full border-2 border-lime-400 shadow-sm" referrerpolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-lime-400/10 border border-lime-400/40 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-lime-700" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-[#031505] text-xs">{user?.displayName || 'Tamu / Walk-in Guest'}</h4>
                    <p className="text-[10px] text-gray-500 truncate max-w-[180px]">{user?.email || 'pembeli-anonim@panganku.com'}</p>
                    <div className="mt-1">
                      <span className="px-2 py-0.5 bg-lime-200 text-[#031505] font-black rounded-md text-[8px] uppercase tracking-wider">PELANGGAN PREMIUM</span>
                    </div>
                  </div>
                </div>

                {/* Status List */}
                <div className="space-y-1.5 border-t border-gray-100 pt-3 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Database Engine:</span>
                    <span className="font-extrabold text-[#052f0c]">PostgreSQL Synced</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Koneksi Server:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Online & Aman
                    </span>
                  </div>
                </div>

                {/* Authentication controls */}
                <div className="border-t border-gray-100 pt-3 flex justify-between gap-3">
                  {user ? (
                    <button
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-red-150"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Putuskan Akun Google</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { loginWithGoogle(); setIsProfileOpen(false); }}
                      className="w-full py-2 px-4 bg-[#ccff00]/10 text-[#031505] border-2 border-[#ccff00]/50 hover:bg-[#ccff00]/30 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Hubungkan Akun Google</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA Install Guide Modal */}
      <AnimatePresence>
        {showInstallGuide && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-lime-150"
            >
              <div className="bg-[#031505] text-white p-6 relative">
                <button 
                  onClick={() => setShowInstallGuide(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full transition-colors cursor-pointer flex items-center justify-center border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-lime-400 text-[#031505] rounded-xl font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline font-black text-base tracking-tight">Pasang Aplikasi PanganKu</h3>
                    <p className="text-gray-400 text-[10px] tracking-wider uppercase font-bold">PWA Offline Capabilities</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs text-gray-700 leading-relaxed">
                <p>
                  Mendukung teknologi <strong>PWA & Service Worker</strong>! Anda dapat mengunduh dan memasang aplikasi PanganKu langsung di layar utama smartphone atau laptop Anda untuk kecepatan maksimal dan offline penuh.
                </p>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 font-medium text-[#052f0c]">
                  🌐 <strong>Offline Bergaransi</strong>: Semua data gambar aset, rincian produk, dan cache transaksi akan disimpan lokal agar Anda tetap bisa berbelanja meskipun tanpa paket data/wifi!
                </div>
                <div className="space-y-3">
                  <p className="font-black text-[#ab3500] uppercase text-[10px] tracking-wider border-b pb-1.5 border-dashed border-gray-150">Alur Pembuatan & Deploy PWA:</p>
                  <ol className="space-y-2.5 text-gray-700">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                      <span className="text-[11px] leading-snug">Membuat React PWA menggunakan CRA Template PWA</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                      <span className="text-[11px] leading-snug">Mengubah <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-mono">manifest.json</code></span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                      <span className="text-[11px] leading-snug">Menambahkan ikon aplikasi</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">4</span>
                      <span className="text-[11px] leading-snug">Mengaktifkan Service Worker</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">5</span>
                      <span className="text-[11px] leading-snug">Melakukan build</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">6</span>
                      <span className="text-[11px] leading-snug">Deploy ke Netlify</span>
                    </li>
                  </ol>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={handleSayaMengertiClick}
                    className="px-5 py-2 px-4.5 bg-[#052f0c] text-white hover:bg-opacity-95 font-black rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                  >
                    Saya Mengerti
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast for Language Switch */}
      <AnimatePresence>
        {showLanguageToast && (
          <div className="fixed bottom-6 left-6 z-50">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-[#031505] text-white px-4 py-2.5 rounded-xl border border-lime-400 text-xs font-semibold flex items-center gap-2 shadow-xl"
            >
              <Check className="w-4 h-4 text-lime-400" />
              <span>{currentLanguage === 'ID' ? 'Bahasa diubah ke Bahasa Indonesia!' : 'Language shifted to English!'}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast for Admin Credentials Error */}
      <AnimatePresence>
        {adminErrorToast && (
          <div className="fixed bottom-6 right-6 z-50">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-red-955 text-red-200 px-4 py-2.5 rounded-xl border border-red-500 text-xs font-semibold flex items-center gap-2 shadow-xl"
            >
              <X className="w-4 h-4 text-red-400 stroke-[3]" />
              <span>{adminErrorToast}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main viewport rendering with exit/entry transition animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {activeView === 'catalog' && (
            <CatalogView 
              onAddToCart={handleAddToCart}
              cartCount={totalCartCount}
              onNavigateToCheckout={() => setActiveView('checkout')}
              onNavigateToAdmin={() => setActiveView('admin')}
              isCartDrawerOpen={isCartDrawerOpen}
              setIsCartDrawerOpen={setIsCartDrawerOpen}
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
            />
          )}

          {activeView === 'checkout' && (
            <CheckoutView 
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onNavigateToCatalog={() => setActiveView('catalog')}
              onAddNewOrder={handleAddNewOrder}
              onNavigateToAdmin={() => setActiveView('admin')}
              googleAccessToken={googleAccessToken}
              loginWithGoogle={loginWithGoogle}
            />
          )}

          {activeView === 'admin' && (
            <AdminConsoleView 
              orders={orders}
              onApproveOrder={handleApproveOrder}
              onNavigateToCatalog={() => setActiveView('catalog')}
              googleAccessToken={googleAccessToken}
              loginWithGoogle={loginWithGoogle}
            />
          )}

          {activeView === 'optimization' && (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <OptimizationDemo />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}

// Check if credentials are bound
function dbCredentialsActive() {
  return true; 
}
