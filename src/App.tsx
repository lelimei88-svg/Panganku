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
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext.tsx';

export default function App() {
  const [activeView, setActiveView] = useState<'catalog' | 'checkout' | 'admin' | 'optimization'>('catalog');
  const { user, token, googleAccessToken, loginWithGoogle, logout } = useAuth();


  
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
      
      {/* Dynamic Floating view-switch controller with Integrated Authentication */}
      <div className="bg-[#052f0c] text-white text-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 border-b border-[#fe6a34]">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-[#ffc692] animate-spin" style={{ animationDuration: '3s' }} />
          <span className="font-bold tracking-wide">PanganKu Integrated Ecosystem Switcher:</span>
          {dbCredentialsActive() ? (
            <span className="text-[#a7f3d0] text-[10.5px]">Cloud SQL Synced</span>
          ) : (
            <span className="text-gray-300 text-[10.5px]">Local Sandbox Mode</span>
          )}
        </div>

        <div className="flex items-center gap-2 font-semibold flex-wrap">
          <button 
            onClick={() => setActiveView('catalog')}
            className={`px-3 py-1 rounded transition-all cursor-pointer ${
              activeView === 'catalog' 
                ? 'bg-[#fe6a34] text-white font-extrabold shadow-sm' 
                : 'bg-white/15 text-white/90 hover:bg-white/20'
            }`}
          >
            🛒 Catalog Belanja
          </button>

          <button 
            onClick={() => setActiveView('checkout')}
            className={`px-3 py-1 rounded transition-all cursor-pointer relative ${
              activeView === 'checkout' 
                ? 'bg-[#ab3500] text-white font-extrabold shadow-sm' 
                : 'bg-white/15 text-white/90 hover:bg-white/20'
            }`}
          >
            💳 Checkout Aman
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#fe6a34] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {totalCartCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveView('admin')}
            className={`px-3 py-1 rounded transition-all cursor-pointer ${
              activeView === 'admin' 
                ? 'bg-[#ab3500] text-white font-bold shadow-sm' 
                : 'bg-white/15 text-white/90 hover:bg-white/20'
            }`}
          >
            📊 Admin & Logistik
            {orders.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[9px] px-1 rounded font-bold">
                {orders.filter(o=>o.status==='PENDING').length} Urg
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveView('optimization')}
            className={`px-3 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
              activeView === 'optimization' 
                ? 'bg-[#fe6a34] text-white font-black shadow-sm' 
                : 'bg-white/15 text-white/90 hover:bg-white/20'
            }`}
          >
            <span>⚡ Optimasi & Cache</span>
          </button>



          {/* Firebase Authentication integration */}
          <div className="h-4.5 w-px bg-white/20 mx-1 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-xl border border-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-4 h-4 rounded-full referrerPolicy='no-referrer'" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-[#ffc692]" />
                )}
                <span className="text-[10px] text-white/90 truncate max-w-[90px]">
                  {user.displayName || user.email}
                </span>
              </div>
              <button 
                onClick={logout}
                className="bg-red-950/40 text-red-200 hover:bg-red-900/40 px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-red-500/20"
                id="sign-out-btn"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="bg-[#fe6a34] hover:bg-[#ab3500] text-white px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
              id="google-login-btn"
            >
              <LogIn className="w-3 h-3" />
              <span>Masuk Google</span>
            </button>
          )}
        </div>
        
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-emerald-200 opacity-80 uppercase tracking-wider font-mono">
          <Info className="w-3.5 h-3.5" />
          <span>Click any pill button to test views</span>
        </div>
      </div>

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
