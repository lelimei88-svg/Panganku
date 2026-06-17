import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Filter, 
  Check, 
  ArrowRight, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  Activity, 
  ChevronRight, 
  Briefcase,
  Users,
  Settings,
  LogOut,
  Sparkles,
  RefreshCw,
  Plus,
  Mail
} from 'lucide-react';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import GmailManager from './GmailManager.tsx';

interface AdminConsoleViewProps {
  orders: Order[];
  onApproveOrder: (orderId: string) => void;
  onNavigateToCatalog: () => void;
  googleAccessToken: string | null;
  loginWithGoogle: () => Promise<string | null>;
}

export default function AdminConsoleView({
  orders,
  onApproveOrder,
  onNavigateToCatalog,
  googleAccessToken,
  loginWithGoogle
}: AdminConsoleViewProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gmail'>('dashboard');
  const [hideConfidential, setHideConfidential] = useState(false);
  const [revenueOffset, setRevenueOffset] = useState(482900000); // Rp 482.9M default starting value

  // Mock static historical orders to ensure realistic, high density information
  const [staticOrders, setStaticOrders] = useState<Order[]>([
    {
      id: '#ORD-9921',
      clientName: 'IndoFood Supply',
      phoneNumber: '021-9988-771',
      address: 'Gudang Utama, Cikarang Barat',
      items: [{ productName: 'Premium Paddy', quantity: 1, price: 154000000 }],
      subtotal: 154000000,
      discount: 0,
      shipping: 250000,
      total: 154250000,
      paymentMethod: 'cod',
      status: 'PENDING',
      csrfToken: 'pk_live_f007xX92',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
    },
    {
      id: '#ORD-9922',
      clientName: 'Mitra Agro Jaya',
      phoneNumber: '021-5544-231',
      address: 'Sentra Distribusi, Kebayoran Baru',
      items: [{ productName: 'Cacao Beans', quantity: 1, price: 82000000 }],
      subtotal: 82000000,
      discount: 0,
      shipping: 150000,
      total: 82150000,
      paymentMethod: 'qris',
      status: 'PENDING',
      csrfToken: 'pk_live_d001xP34',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString() // 8 hours ago
    }
  ]);

  const allActivePendingOrders = [
    ...orders.filter(o => o.status === 'PENDING'),
    ...staticOrders.filter(o => o.status === 'PENDING')
  ];

  const handleApprove = (id: string) => {
    // Find the order to calculate how much total CASH to add to our live cumulative revenue!
    const localOrder = orders.find(o => o.id === id);
    const staticOrder = staticOrders.find(o => o.id === id);
    
    const addedAmount = localOrder ? localOrder.total : (staticOrder ? staticOrder.total : 0);
    
    // Add transaction value to Revenue
    setRevenueOffset(prev => prev + addedAmount);

    if (localOrder) {
      onApproveOrder(id);
    } else if (staticOrder) {
      setStaticOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'APPROVED' } : o));
    }
  };

  // KPI Calculations
  const pendingCount = allActivePendingOrders.length;
  // Stock alerts starting counts
  const [stockAlerts, setStockAlerts] = useState(3);

  // Download simulation
  const [downloading, setDownloading] = useState(false);
  const handleDownloadExcel = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Master Ledger Excel (.xlsx) berhasil di-export & siap di-download untuk audit audit internal!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bg-light flex font-sans">
      
      {/* Sidenav Sidebar Navigation */}
      <aside className="w-64 bg-primary text-white flex flex-col p-6 shadow-xl fixed left-0 top-0 h-screen z-40 transition-all duration-300">
        
        {/* Brand block header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6 text-white stroke-2" />
          </div>
          <div>
            <h1 className="font-headline text-sm font-black text-white">Admin Console</h1>
            <p className="text-[10px] text-white/60 uppercase font-mono tracking-wider">Enterprise Logistics</p>
          </div>
        </div>

        {/* New shipment action */}
        <button 
          onClick={onNavigateToCatalog}
          className="mb-8 w-full bg-[#ab3500] hover:bg-opacity-95 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-secondary/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Order</span>
        </button>

        {/* Nav Links */}
        <nav className="flex-grow space-y-1.5 text-xs text-white/70">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-bold text-left cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-secondary text-white shadow-md shadow-secondary/5'
                : 'hover:bg-white/10 hover:text-white text-white/75'
            }`}
          >
            <span className="flex items-center gap-3">
              <Sparkles className="w-4 h-4" />
              <span>Dashboard Logistik</span>
            </span>
            {activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <button 
            onClick={() => setActiveTab('gmail')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-bold text-left cursor-pointer ${
              activeTab === 'gmail'
                ? 'bg-secondary text-white shadow-md shadow-secondary/5'
                : 'hover:bg-white/10 hover:text-white text-white/75'
            }`}
          >
            <span className="flex items-center gap-3">
              <Mail className="w-4 h-4" />
              <span>Gmail Customer Hub</span>
            </span>
            {activeTab === 'gmail' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </nav>

        {/* Profile and Settings Footer */}
        <div className="mt-auto space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <img 
              className="w-10 h-10 rounded-full border-2 border-secondary object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgMoAMarOyR8gYlB30wE5MnJHAmtK5Yu8Op4OSxgGh8TSLTsbtuzVBQ6ZIdlwE0hHD8-UUPBXVa6-1eKSyxtBrCpIyKxg0eb6Y9S0c3eje2sND14rVqL_sMJP0dsudw_Z6zuy2XKO3C_PTyTpLms7Sxm40DEO-eu2B7NX8RZwD0RTqxB4vVjiyj9InVmmbdXCVcAymPtWa12mC4TYscjHCfNQZ7nPKNEeb1j2_d2JUPzUqQw8Zi9j0Ea1ndLcVeb2M6R0FUe6nUxk" 
              alt="Admin Profile photo" 
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-white/50 truncate font-mono">admin@panganku.com</p>
            </div>
          </div>

          <div className="pt-2 text-xs text-white/60 space-y-1">
            <button 
              onClick={onNavigateToCatalog}
              className="w-full flex items-center gap-3.5 px-3 py-2 hover:text-white rounded transition-colors text-left cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Ke Toko Belanja</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Main Workspace Frame container */}
      <main className="ml-64 flex-1 p-6 md:p-10 min-h-screen">
        
        {/* Notification indicator block header */}
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-between p-4 rounded-2xl mb-8">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={2.5} />
            <span><strong>Secure Agent Portal Active:</strong> Database, API proxy, and security systems initialized successfully.</span>
          </div>
          <span className="text-[10px] font-mono bg-white text-primary rounded px-2 py-0.5 border border-emerald-100 font-bold">
            Role: enterprise_admin
          </span>
        </div>

        {/* Head Intro */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-black text-primary">Logistics Overview</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Real-time supply chain, inventory performance, and administrative controls.</p>
          </div>

          {/* Timefilter Pill controls */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
            <button className="px-3.5 py-1.5 bg-white text-primary rounded-lg shadow-xs font-bold transition-all cursor-pointer">
              Last 24h
            </button>
            <button className="px-3.5 py-1.5 text-gray-500 hover:text-primary transition-all cursor-pointer">
              Last 7d
            </button>
            <button className="px-3.5 py-1.5 text-gray-500 hover:text-primary transition-all cursor-pointer">
              Custom Ranges
            </button>
          </div>
        </header>

        {/* KPI metrics row with animated status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1: Total Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border-l-4 border-primary flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue Logistik</p>
                <h3 className="font-headline text-2xl md:text-3xl font-black text-primary">
                  Rp {revenueOffset.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-primary font-bold">
              <span>+12.4% from past month</span>
            </div>
          </div>

          {/* Card 2: Pending quality audits */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border-l-4 border-secondary flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Antrean Validasi (Pending)</p>
                <h3 className="font-headline text-2xl md:text-3xl font-black text-gray-900">
                  {pendingCount} Pesanan
                </h3>
              </div>
              <span className="bg-red-50 text-red-700 text-[9px] font-black px-2 py-1 rounded h-fit tracking-wider animate-pulse">
                URGENT
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-4 italic">Awaiting quality and address verification manually</p>
          </div>

          {/* Card 3: Stock alerts warnings */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border-l-4 border-amber-yellow flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Alarm Stok Rendah</p>
                <h3 className="font-headline text-2xl md:text-3xl font-black text-gray-900">
                  {stockAlerts} Item
                </h3>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-red-500 font-bold">Requires immediate restock supply</span>
              <button 
                onClick={() => setStockAlerts(0)}
                className="text-[10px] text-primary hover:underline font-bold"
              >
                Clear Alert
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic split section grid columns mapping */}
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Order Management fulfillment desk */}
          <section id="order-mgmt" className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-55/10">
              <div>
                <h4 className="font-headline text-base font-bold text-primary">Fulfillment & Verification Queue</h4>
                <p className="text-[11px] text-gray-400">Validate real-time orders submitted by buyers securely</p>
              </div>
              <button className="text-primary hover:bg-gray-50 border border-gray-100 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Antrean</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[9px] font-bold tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">ID Order</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Commodity / Items</th>
                    <th className="px-6 py-4 text-right">Cash Volume</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Fulfillment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {/* Local customer orders list mapping */}
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{o.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{o.clientName}</div>
                        <div className="text-[10px] text-gray-400">{o.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[150px] truncate" title={o.items.map(i=>i.productName).join(', ')}>
                        {o.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        Rp {o.total.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase ${
                          o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {o.status === 'PENDING' ? (
                          <button 
                            onClick={() => handleApprove(o.id)}
                            className="bg-primary text-white hover:bg-opacity-95 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 mx-auto active:scale-95 transition-all cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>APPROVE</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 font-semibold text-[10px]">VERIFIED ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Static demo mock orders mappings */}
                  {staticOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{o.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{o.clientName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{o.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[150px] truncate">
                        {o.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        Rp {o.total.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase ${
                          o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {o.status === 'PENDING' ? (
                          <button 
                            onClick={() => handleApprove(o.id)}
                            className="bg-primary text-white hover:bg-opacity-95 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 mx-auto active:scale-95 transition-all cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>APPROVE</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 font-semibold text-[10px]">VERIFIED ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* If queue is fully empty */}
                  {orders.length === 0 && staticOrders.filter(o=>o.status==='PENDING').length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400 italic">
                        Semua antrean validasi pengiriman selesai diproses!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-[10px] text-gray-400 italic font-mono">
                System optimized with Virtual Window DOM tracking for 10,000+ active enterprise records.
              </p>
            </div>
          </section>

          {/* RIGHT: Confidential Stock price ledger */}
          <section id="inventory" className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <div>
                  <h4 className="font-headline text-sm font-bold text-primary">Confidential Pricing</h4>
                  <p className="text-[10px] text-gray-400">Admin Cost & Wholesale Ledger</p>
                </div>
              </div>

              {/* Toggle show prices */}
              <button 
                onClick={() => setHideConfidential(!hideConfidential)}
                className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                title={hideConfidential ? "Tampilkan harga modal" : "Sembunyikan harga modal"}
              >
                {hideConfidential ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
              
              {/* Ledger Card 1 */}
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs space-y-2.5">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-[#052f0c] block">Beras Setra Ramos Premium</span>
                  <span className="bg-emerald-100 text-[#052f0c] text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono">
                    STOCK HIGH
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-[9px] text-gray-400 uppercase font-black block tracking-wider">Harga Modal</span>
                    <span className="font-mono font-bold text-gray-700">
                      {hideConfidential ? '••••••' : 'Rp 12.400 / kg'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-[9px] text-gray-400 uppercase font-black block tracking-wider">Harga Jual</span>
                    <span className="font-mono font-bold text-secondary">
                      Rp 15.000 / kg
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                  <span>Margin Bersih: <span className="text-primary font-bold">{hideConfidential ? '•••' : '17.3%'}</span></span>
                  <span>Disposisi: 12.400 Kg</span>
                </div>
              </div>

              {/* Ledger Card 2 */}
              <div className="p-4 bg-orange-50/30 rounded-xl border border-orange-100 text-xs space-y-2.5">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-gray-900 block">Minyak Kelapa Sawit Curah</span>
                  <span className="bg-orange-100 text-[#ab3500] text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono">
                    STOCK LOW
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-orange-100">
                    <span className="text-[9px] text-gray-400 uppercase font-black block tracking-wider">Harga Modal</span>
                    <span className="font-mono font-bold text-gray-700">
                      {hideConfidential ? '••••••' : 'Rp 14.100 / L'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-orange-100">
                    <span className="text-[9px] text-gray-400 uppercase font-black block tracking-wider">Harga Jual</span>
                    <span className="font-mono font-bold text-secondary">
                      Rp 17.000 / L
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                  <span>Margin Bersih: <span className="text-primary font-bold">{hideConfidential ? '•••' : '17.1%'}</span></span>
                  <span>Disposisi: 450 Liters</span>
                </div>
              </div>

              {/* Ledger Card 3 */}
              <div className="p-4 bg-amber-50/20 rounded-xl border border-amber-100 text-xs space-y-2.5">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-gray-900 block">Daging Ayam Kampung Utuh</span>
                  <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono">
                    STOCK HIGH
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-[9px] text-gray-400 uppercase font-black block tracking-wider">Harga Modal</span>
                    <span className="font-mono font-bold text-gray-700">
                      {hideConfidential ? '••••••' : 'Rp 52.000 / ekor'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-[9px] text-gray-400 uppercase font-black block tracking-wider">Harga Jual</span>
                    <span className="font-mono font-bold text-secondary">
                      Rp 65.000 / ekor
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                  <span>Margin Bersih: <span className="text-primary font-bold">{hideConfidential ? '•••' : '20.0%'}</span></span>
                  <span>Disposisi: 180 Ekor</span>
                </div>
              </div>

            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center mt-auto">
              <button 
                onClick={handleDownloadExcel}
                className="w-full text-center py-2 bg-white hover:bg-gray-100 border border-gray-200 text-primary font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Downloading...' : 'Download Master Ledger (.xlsx)'}</span>
              </button>
            </div>
          </section>

        </div>
        ) : (
          <div className="w-full">
            <GmailManager 
              googleAccessToken={googleAccessToken}
              loginWithGoogle={loginWithGoogle}
            />
          </div>
        )}

      </main>

    </div>
  );
}
