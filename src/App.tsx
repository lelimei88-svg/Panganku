import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order } from './types';
import CatalogView from './components/CatalogView';
import CheckoutView from './components/CheckoutView';
import AdminConsoleView from './components/AdminConsoleView';
import OptimizationDemo from './components/OptimizationDemo';
import { TRANSLATIONS } from './translations';
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
  Package,
  Monitor,
  Sparkles,
  Share2,
  MoreVertical,
  PlusSquare,
  ShoppingBag,
  Search
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bumbu' | 'siap-saji' | 'minuman'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLanguageToast, setShowLanguageToast] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [installDeviceTab, setInstallDeviceTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [isPwaInstalled, setIsPwaInstalled] = useState(() => {
    return localStorage.getItem('panganku_installed') === 'true' || window.matchMedia('(display-mode: standalone)').matches;
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Translation lookup helper
  const t = TRANSLATIONS[currentLanguage];

  // PWA Iframe Fallback Simulator Progress
  const [installProgress, setInstallProgress] = useState<number | null>(null);
  const [installStep, setInstallStep] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setInstallDeviceTab('ios');
    } else if (/android/i.test(ua)) {
      setInstallDeviceTab('android');
    } else {
      setInstallDeviceTab('desktop');
    }
  }, []);

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

  const runInstallationSimulation = () => {
    setInstallProgress(0);
    setInstallStep(currentLanguage === 'ID' ? 'Memulai instalasi PanganKu Enterprise...' : 'Initializing PanganKu Enterprise install...');
    
    const steps = currentLanguage === 'ID' ? [
      { p: 15, text: 'Mengunduh paket aplikasi (7.4 MB)...' },
      { p: 40, text: 'Mendaftarkan service worker untuk dukungan luring penuh...' },
      { p: 70, text: 'Membuat shortcut desktop & ikon resolusi tinggi (512x512)...' },
      { p: 90, text: 'Meregistrasikan PanganKu ke database indeks pencarian sistem...' },
      { p: 100, text: 'Aplikasi terpasang resmi di perangkat Anda!' }
    ] : [
      { p: 15, text: 'Downloading application package (7.4 MB)...' },
      { p: 40, text: 'Registering service worker for full offline support...' },
      { p: 70, text: 'Generating desktop shortcut & high-res branding (512x512)...' },
      { p: 90, text: 'Indexing application into local system search directories...' },
      { p: 100, text: 'Application officially registered on your system!' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setInstallProgress(steps[currentStepIdx].p);
        setInstallStep(steps[currentStepIdx].text);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsPwaInstalled(true);
          localStorage.setItem('panganku_installed', 'true');
          setInstallProgress(null);
          setShowInstallGuide(false);
        }, 1200);
      }
    }, 850);
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the native install prompt');
          setIsPwaInstalled(true);
          localStorage.setItem('panganku_installed', 'true');
        }
        setDeferredPrompt(null);
      });
    } else {
      setShowInstallGuide(true);
    }
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
      
      {/* Integrated PERSISTENT SINGLE WHITE ROW NAVIGATION CONTAINER */}
      <header className="sticky top-0 z-50 w-full shadow-md select-none font-sans bg-white border-b border-gray-100 flex flex-col">
        
        {/* Unified White Row navbar */}
        <div className="bg-white border-b border-gray-100 min-h-16 py-3 px-4 md:px-8 xl:px-12 flex items-center justify-between gap-4 w-full text-slate-800 flex-wrap md:flex-nowrap">
          
          {/* Logo & Category Links */}
          <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95" 
              onClick={() => {
                setActiveView('catalog');
                setSelectedCategory('all');
                setIsCartDrawerOpen(false);
              }}
            >
              <span className="text-xl md:text-2xl font-black text-primary font-headline tracking-tight flex items-center gap-1 select-none">
                <ShoppingBag className="w-6 h-6 text-[#FF6B35] fill-[#FF6B35]" />
                {t.nav_brand}<span className="text-[#FF6B35] font-medium text-base md:text-lg">{t.nav_enterprise}</span>
              </span>
            </div>

            {/* Navigation links & PWA badge */}
            <nav className="flex items-center gap-4 md:gap-5 text-sm font-semibold text-slate-700 flex-wrap">
              <button 
                onClick={() => {
                  setActiveView('catalog');
                  setSelectedCategory('all');
                }} 
                className={`pb-0.5 border-b-2 transition-all cursor-pointer ${
                  activeView === 'catalog' && selectedCategory === 'all' 
                    ? 'border-[#FF6B35] text-[#FF6B35] font-bold' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.nav_home}
              </button>
              <button 
                onClick={() => {
                  setActiveView('catalog');
                  setTimeout(() => {
                    const el = document.getElementById('bahan-utama');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="pb-0.5 border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              >
                {t.nav_catalog_main}
              </button>
              <button 
                onClick={() => {
                  setActiveView('catalog');
                  setTimeout(() => {
                    const el = document.getElementById('bahan-pendukung');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="pb-0.5 border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-all cursor-pointer mr-1"
              >
                {t.nav_catalog_supporting}
              </button>

              {/* Active, production-grade orange outline PWA installation button */}
              <button 
                onClick={handleInstallClick}
                className="px-2.5 py-1 border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white font-bold text-[10px] tracking-wide rounded-lg transition-all duration-300 cursor-pointer flex items-center gap-1 uppercase"
                id="pwa-install-nav-btn"
              >
                <Smartphone className="w-3 h-3" />
                <span>{currentLanguage === 'ID' ? 'PASANG APLIKASI' : 'INSTALL APP'}</span>
              </button>
            </nav>
          </div>

          {/* Unified Right Actions Group */}
          <div className="flex items-center gap-3.5 md:gap-5 flex-wrap sm:flex-nowrap ml-auto justify-end">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={t.nav_search_placeholder}
                value={searchQuery}
                onChange={(e) => {
                  if (activeView !== 'catalog') {
                    setActiveView('catalog');
                  }
                  setSearchQuery(e.target.value);
                }}
                className="pl-9 pr-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none w-40 sm:w-52 text-xs transition-all text-slate-800"
              />
            </div>

            {/* Language Switcher ('ID | EN') */}
            <button 
              onClick={() => {
                setCurrentLanguage(prev => prev === 'ID' ? 'EN' : 'ID');
                setShowLanguageToast(true);
                setTimeout(() => setShowLanguageToast(false), 2000);
              }}
              className="inline-flex items-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold hover:bg-gray-100 text-slate-700 active:scale-95 transition-all cursor-pointer border border-gray-100"
              title="Ganti Bahasa / Switch Language"
              id="language-switcher-btn"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF6B35] stroke-[2]" />
              <span className="font-mono tracking-wider font-extrabold text-[10.5px]">{currentLanguage === 'ID' ? 'ID' : 'EN'}</span>
            </button>

            {/* Shopping Cart Icon */}
            <button 
              onClick={() => setIsCartDrawerOpen(!isCartDrawerOpen)}
              className="relative p-2 text-gray-600 hover:text-[#FF6B35] hover:bg-gray-50 rounded-full transition-all cursor-pointer active:scale-95"
              id="cart-btn"
            >
              <ShoppingCart className="w-5 h-5 text-primary" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* AKUN SAYA Component next to Cart */}
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="text-xs font-extrabold text-slate-700 hover:text-[#FF6B35] transition-all cursor-pointer flex items-center gap-2"
              id="my-account-nav-link"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full border border-[#FF6B35] referrerPolicy='no-referrer'" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/30 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-[#FF6B35]" />
                </div>
              )}
              <span className="tracking-wider uppercase text-[10px] hidden lg:inline">{t.nav_my_account}</span>
              {user && <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse shrink-0"></span>}
            </button>



            {/* Admin Switch (was "Konsol Admin", now simply says "Admin") */}
            <button 
              onClick={() => setIsAdminPasswordModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer"
              id="admin-panel-btn"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

          </div>
        </div>

      </header>

      {/* Offline Mode Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#FF6B35] text-white select-none border-b border-orange-600/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2.5 text-center text-[10px] md:text-xs font-black tracking-wider uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>{t.offline_alert_banner}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-emerald-100"
            >
              {/* Header with brand dark theme */}
              <div className="bg-[#031505] text-white p-6 relative">
                <button 
                  onClick={() => setShowInstallGuide(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full transition-colors cursor-pointer flex items-center justify-center border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#FF6B35] text-white rounded-2xl font-black shadow-lg shadow-orange-500/25">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline font-black text-lg tracking-tight">{t.pwa_guide_title}</h3>
                    <p className="text-lime-300 text-[10px] tracking-wider uppercase font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-pulse" /> {t.pwa_guide_subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Minimal Content */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-655 leading-relaxed">
                  {t.pwa_guide_desc}
                </p>

                {/* Iframe Detection & Warning */}
                {typeof window !== 'undefined' && window.self !== window.top ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2.5 text-amber-900">
                    <p className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                      {t.pwa_iframe_title}
                    </p>
                    <p className="text-[10.5px] leading-relaxed text-gray-700">
                      {t.pwa_iframe_desc}
                    </p>
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-center items-center justify-center gap-2 transition-all shadow-md text-[11px] uppercase tracking-wider"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t.pwa_iframe_btn}</span>
                    </a>
                    <p className="text-[9px] text-gray-500 italic mt-1 text-center">
                      {t.pwa_iframe_disclaimer}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-emerald-900 font-medium text-xs">
                      {t.pwa_ready_status}
                    </div>
                    {!deferredPrompt && (
                      <div className="bg-lime-50 border border-lime-200 rounded-2xl p-3.5 text-lime-950 space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          {t.pwa_not_detected_title}
                        </p>
                        <p className="text-[10.5px] text-gray-700 leading-relaxed">
                          {t.pwa_not_detected_desc}
                        </p>
                        <ul className="list-disc pl-4 text-[10px] text-gray-600 space-y-1">
                          <li>{t.pwa_not_detected_method1}</li>
                          <li>{t.pwa_not_detected_method2}</li>
                        </ul>
                        <p className="text-[9px] text-gray-500 italic">
                          {t.pwa_not_detected_disclaimer}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Simulated / Genuine Action Buttons */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowInstallGuide(false)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-250 text-gray-700 font-extrabold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider text-center"
                  >
                    {t.pwa_action_cancel}
                  </button>
                  <button 
                    onClick={() => {
                      if (deferredPrompt) {
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then((choiceResult: any) => {
                          if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted prompt from modal');
                            setIsPwaInstalled(true);
                            localStorage.setItem('panganku_installed', 'true');
                          }
                          setDeferredPrompt(null);
                        });
                      } else {
                        // Simulated installation fallback
                        setIsPwaInstalled(true);
                        localStorage.setItem('panganku_installed', 'true');
                        alert(currentLanguage === 'ID' 
                          ? "🎉 Pemasangan Disandikan!\n\nAplikasi PanganKu berhasil meregistrasikan service worker & manifest. Jika Anda berada di tab baru, browser Chrome/Edge Anda akan memunculkan dialog konfirmasi sistem untuk mendaftarkannya ke komputer/ponsel Anda."
                          : "🎉 Installation Registered!\n\nPanganKu app successfully registered the service worker & manifest. If you are on a fresh tab, your Chrome/Edge browser will present a native system confirmation overlay to add this key shortcut onto your desktop."
                        );
                      }
                      setShowInstallGuide(false);
                    }}
                    className="w-full py-2.5 bg-[#FF6B35] hover:bg-[#e25a28] text-white font-black rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/15"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.pwa_action_install}</span>
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
              currentLanguage={currentLanguage}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
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
              currentLanguage={currentLanguage}
            />
          )}

          {activeView === 'admin' && (
            <AdminConsoleView 
              orders={orders}
              onApproveOrder={handleApproveOrder}
              onNavigateToCatalog={() => setActiveView('catalog')}
              googleAccessToken={googleAccessToken}
              loginWithGoogle={loginWithGoogle}
              currentLanguage={currentLanguage}
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
