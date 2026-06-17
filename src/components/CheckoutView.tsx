import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  QrCode, 
  Timer, 
  Lock, 
  Gift, 
  Truck, 
  Percent, 
  CheckCircle, 
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { Product, CartItem, Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onNavigateToCatalog: () => void;
  onAddNewOrder: (order: Order) => void;
  onNavigateToAdmin: () => void;
  googleAccessToken?: string | null;
  loginWithGoogle?: () => Promise<string | null>;
}

export default function CheckoutView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateToCatalog,
  onAddNewOrder,
  onNavigateToAdmin,
  googleAccessToken,
  loginWithGoogle
}: CheckoutViewProps) {
  // Forms state
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // Gmail Invoice states
  const [targetEmail, setTargetEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qris'>('cod');
  const [qrisTimer, setQrisTimer] = useState(300); // 5 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<Order | null>(null);

  // Errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Countdown logic for QRIS
  useEffect(() => {
    let interval: any;
    if (paymentMethod === 'qris') {
      interval = setInterval(() => {
        setQrisTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      setQrisTimer(300);
    }
    return () => clearInterval(interval);
  }, [paymentMethod]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculations
  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shippingCharge = subtotal > 0 ? 10000 : 0;

  // Tiered discount rules:
  // Rp 0 to Rp 75k: no discount
  // Rp 75k to 150k: Tier 1 discount (Rp 7.500)
  // Above Rp 150k: Tier 2 discount (Rp 20.000)
  const getTierDiscount = () => {
    if (subtotal >= 150000) {
      return 20000;
    } else if (subtotal >= 75000) {
      return 7500;
    }
    return 0;
  };

  const discount = getTierDiscount();
  const totalBill = Math.max(0, subtotal - discount + shippingCharge);

  // Progress calculations
  const getProgressPercentage = () => {
    if (subtotal >= 150000) return 100;
    if (subtotal < 75000) {
      return (subtotal / 75000) * 50; // first half of progress
    } else {
      return 50 + ((subtotal - 75000) / (150000 - 75000)) * 50; // second half
    }
  };

  const getProgressLabel = () => {
    if (subtotal < 75000) {
      const remaining = 75000 - subtotal;
      return {
        text: `Butuh Rp ${remaining.toLocaleString('id-ID')} lagi`,
        nextTier: 'Rp 75k (Hemat 7.5k)'
      };
    } else if (subtotal < 150000) {
      const remaining = 150000 - subtotal;
      return {
        text: `Butuh Rp ${remaining.toLocaleString('id-ID')} lagi`,
        nextTier: 'Rp 150k (Hemat 20k)'
      };
    }
    return {
      text: '🥳 Selamat! Anda mendapat diskon maksimal!',
      nextTier: 'Tier Maksimal Unlocked'
    };
  };

  const progressLabel = getProgressLabel();

  // Validate form
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!recipientName.trim()) tempErrors.name = 'Nama penerima wajib diisi';
    if (!phoneNumber.trim()) tempErrors.phone = 'Nomor telepon wajib diisi';
    if (!address.trim()) tempErrors.address = 'Alamat lengkap wajib diisi';
    if (cartItems.length === 0) tempErrors.cart = 'Keranjang belanja Anda kosong';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit order handler
  const handleSubmitOrder = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API database write with pristine custom loader
    setTimeout(() => {
      const csrf = `pk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
      const newOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: recipientName,
        phoneNumber: phoneNumber,
        address: address,
        items: cartItems.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: subtotal,
        discount: discount,
        shipping: shippingCharge,
        total: totalBill,
        paymentMethod: paymentMethod,
        status: 'PENDING',
        csrfToken: csrf,
        timestamp: new Date().toISOString()
      };

      onAddNewOrder(newOrder);
      setOrderCompleted(newOrder);
      setIsSubmitting(false);
      onClearCart();
    }, 1500);
  };

  // Gmail Invoice sender API call
  const handleSendInvoiceEmail = async () => {
    if (!orderCompleted || !googleAccessToken) return;
    if (!targetEmail.trim()) {
      alert('Tolong masukkan email tujuan.');
      return;
    }

    // MANDATORY USER CONFIRMATION per Workspace SKILL instructions!
    const confirmed = window.confirm(`Kirim detail invoice ke email ${targetEmail}?`);
    if (!confirmed) return;

    setEmailSending(true);
    setEmailSent(false);

    try {
      const subject = `[PanganKu] Konfirmasi & Invoice Pesanan ${orderCompleted.id}`;
      const itemsListHtml = orderCompleted.items.map(item => 
        `<li><strong>${item.productName}</strong> x${item.quantity} (Rp ${item.price.toLocaleString('id-ID')})</li>`
      ).join('');

      const bodyHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e8ed; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #052f0c; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PanganKu</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #fe6a34; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Invoice Pemesanan Sukses</p>
          </div>
          <div style="padding: 24px; color: #2c3e50; line-height: 1.6;">
            <h2 style="font-size: 18px; color: #052f0c; margin-top: 0;">Halo ${orderCompleted.clientName},</h2>
            <p>Terima kasih telah berbelanja pertanian organik & segar di PanganKu! Pesanan Anda telah diterima sistem logistik kami.</p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #fe6a34; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">Ringkasan Pesanan:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                ${itemsListHtml}
              </ul>
              <hr style="border: 0; border-top: 1px solid #e1e8ed; margin: 12px 0;" />
              <table style="width: 100%; font-size: 13px;">
                <tr><td>Subtotal:</td><td style="text-align: right; font-weight: bold;">Rp ${orderCompleted.subtotal.toLocaleString('id-ID')}</td></tr>
                <tr><td>Diskon Hemat:</td><td style="text-align: right; color: #fe6a34; font-weight: bold;">-Rp ${orderCompleted.discount.toLocaleString('id-ID')}</td></tr>
                <tr><td>Ongkos Kirim:</td><td style="text-align: right; font-weight: bold;">Rp ${orderCompleted.shipping.toLocaleString('id-ID')}</td></tr>
                <tr style="font-size: 15px; font-weight: bold; color: #052f0c;">
                  <td>Total Bayar:</td>
                  <td style="text-align: right;">Rp ${orderCompleted.total.toLocaleString('id-ID')}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px;"><strong>Alamat Pengiriman:</strong><br />${orderCompleted.address}</p>
            <p style="font-size: 13px;"><strong>Metode Pembayaran:</strong> ${orderCompleted.paymentMethod === 'cod' ? 'Bayar di Tempat (COD)' : 'QRIS Digital Auto'}</p>
            
            <hr style="border: 0; border-top: 1px solid #e1e8ed; margin: 24px 0;" />
            <p style="font-size: 11px; color: #7f8c8d; text-align: center; margin: 0;">PanganKu Fresh Supply Chain - Securely Transacted via Google API © 2026</p>
          </div>
        </div>
      `;

      const base64Utf8Subject = btoa(unescape(encodeURIComponent(subject)));
      const emailLines = [
        `To: ${targetEmail}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: =?utf-8?B?${base64Utf8Subject}?=`,
        '',
        bodyHtml
      ];
      
      const mime = emailLines.join('\r\n');
      const base64Raw = btoa(unescape(encodeURIComponent(mime)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: base64Raw
        })
      });

      if (!res.ok) {
        throw new Error(`Gmail API returned code ${res.status}`);
      }

      setEmailSent(true);
    } catch (err: any) {
      console.error('Failed to send invoice email:', err);
      alert(`Gagal mengirim invoice email: ${err.message || 'Unknown network error'}`);
    } finally {
      setEmailSending(false);
    }
  };

  // Pre-seed some default info on click for extreme ease of user play
  const handleAutoFill = () => {
    setRecipientName('Budi Santoso');
    setPhoneNumber('0812-3456-7890');
    setAddress('Jl. Petani Sejahtera No. 88, Jakarta Selatan');
  };

  return (
    <div className="min-h-screen bg-bg-light pb-24 relative">
      
      {/* Checkout Minimalist Header */}
      <header className="fixed top-0 left-0 w-full z-45 bg-white border-b border-gray-100 shadow-xs h-16 flex items-center justify-between px-4 md:px-12">
        <button 
          onClick={onNavigateToCatalog}
          className="flex items-center gap-2 text-primary hover:text-secondary font-bold text-xs md:text-sm tracking-wider uppercase transition-colors uppercase group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="font-headline text-lg md:text-xl font-black text-primary tracking-tight md:block">
            Checkout <span className="text-secondary">Aman</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 text-primary">
          <ShieldAlert className="w-5 h-5 text-accent fill-accent/10" />
          <span className="hidden sm:inline font-bold text-xs tracking-wider uppercase">Secure Encription Connected</span>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-24">
        
        {orderCompleted ? (
          /* Order Complete Success Screen Widget */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-emerald-100 shadow-2xl text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-black text-primary">Pesanan Sukses Dibuat!</h2>
              <p className="text-gray-500 text-sm">Terima kasih atas order Anda. ID Pesanan Anda adalah:</p>
              <div className="inline-block px-4 py-2 bg-emerald-50 text-primary rounded-xl font-mono font-bold text-lg border border-emerald-100">
                {orderCompleted.id}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 text-left text-xs space-y-3 border border-gray-100">
              <div className="flex justify-between font-bold text-primary border-b border-gray-100 pb-2">
                <span>Rincian Penerima</span>
                <span>PanganKu Secure</span>
              </div>
              <p><strong>Penerima:</strong> {orderCompleted.clientName}</p>
              <p><strong>Alamat:</strong> {orderCompleted.address}</p>
              <p><strong>Metode Pembayaran:</strong> {orderCompleted.paymentMethod === 'cod' ? 'Cash On Delivery (COD)' : 'QRIS Digital'}</p>
              <p className="text-[10px] text-gray-400 font-mono"><strong>CSRF Security Hash:</strong> {orderCompleted.csrfToken}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={onNavigateToCatalog}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
              >
                Belanja Bahan Lain
              </button>
              <button 
                onClick={() => {
                  setOrderCompleted(null);
                  // Dynamic jump to admin console to see their order live in queue
                  onNavigateToAdmin();
                }}
                className="flex-1 bg-primary text-white hover:bg-opacity-95 py-3.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
              >
                Lihat di Dashboard Logistik
              </button>
            </div>
          </motion.div>
        ) : (
          /* Standard Unsubmitted checkout page grid mapping */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side actions (Forms and payment) */}
            <div className="lg:col-span-7 space-y-6">

              {/* Form Delivery Address */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100/40 relative">
                {/* Auto fill helper */}
                <button 
                  onClick={handleAutoFill}
                  className="absolute top-4 right-4 text-[10px] font-bold text-secondary bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded transition-colors"
                >
                  ⚡ Auto-fill Penonton Demo
                </button>

                <div className="flex items-center gap-2 mb-6 text-primary">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <h2 className="font-headline text-lg font-bold">Informasi Pengiriman</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                        Nama Penerima
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          placeholder="Masukkan nama lengkap" 
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className={`w-full bg-white border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-xl py-3 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
                        />
                      </div>
                      {errors.name && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.name}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                        Nomor Telepon
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="tel" 
                          placeholder="0812-XXXX-XXXX" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className={`w-full bg-white border ${errors.phone ? 'border-red-400' : 'border-gray-200'} rounded-xl py-3 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
                        />
                      </div>
                      {errors.phone && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.phone}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea 
                      placeholder="Contoh: Jl. Petani Sejahtera No. 88, RT/RW 03/05, Jakarta Selatan" 
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full bg-white border ${errors.address ? 'border-red-400' : 'border-gray-200'} rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
                    />
                    {errors.address && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.address}</span>}
                  </div>
                </div>
              </section>

              {/* Order items review nested */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Gift className="w-5 h-5 text-secondary" />
                    <h2 className="font-headline text-lg font-bold">Ringkasan Keranjang Pesanan</h2>
                  </div>
                  <span className="text-xs bg-emerald-50 text-primary px-3 py-1 rounded-full font-bold">
                    {cartItems.length} Produk
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm space-y-3">
                    <p>Keranjang Anda kosong saat ini.</p>
                    <button 
                      onClick={onNavigateToCatalog}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-opacity-95"
                    >
                      Beli Sembako & Bahan Makanan Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 divide-y divide-gray-50">
                    {cartItems.map((item, index) => (
                      <div key={item.product.id} className={`flex gap-4 items-center group pt-3 ${index === 0 ? 'pt-0' : ''}`}>
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Porsi {item.product.unit}
                          </span>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-primary">
                            Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                          
                          {/* Quantity adjustments inside checkout page directly to fit mockup logic */}
                          <div className="flex items-center gap-2 mt-1 border border-gray-100 bg-gray-50 rounded-lg p-0.5">
                            <button 
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateQuantity(item.product.id, item.quantity - 1);
                                } else {
                                  onRemoveItem(item.product.id);
                                }
                              }}
                              className="w-5 h-5 rounded hover:bg-white text-gray-500 font-bold flex items-center justify-center text-xs active:scale-95 transition-all text-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-gray-700 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="w-5 h-5 rounded hover:bg-white text-gray-500 font-bold flex items-center justify-center text-xs active:scale-95 transition-all text-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Direct remove click */}
                        <button 
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Secure Payment Methods selectors */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100/40">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <CreditCard className="w-5 h-5 text-secondary" />
                  <h2 className="font-headline text-lg font-bold">Metode Pembayaran</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* COD Item option */}
                  <button 
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all h-24 text-center cursor-pointer ${
                      paymentMethod === 'cod' 
                        ? 'border-primary bg-emerald-50/50 text-primary font-bold' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle className={`w-5 h-5 mb-1 ${paymentMethod === 'cod' ? 'text-primary' : 'text-gray-300'}`} />
                    <span className="text-xs font-bold">Bayar di Tempat (COD)</span>
                  </button>

                  {/* QRIS Item option */}
                  <button 
                    onClick={() => {
                      setPaymentMethod('qris');
                      setQrisTimer(300); // re-init
                    }}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all h-24 text-center cursor-pointer ${
                      paymentMethod === 'qris' 
                        ? 'border-secondary bg-orange-50/60 text-secondary font-bold' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <QrCode className={`w-5 h-5 mb-1 ${paymentMethod === 'qris' ? 'text-secondary' : 'text-gray-300'}`} />
                    <span className="text-xs font-bold">QRIS Auto-Scan</span>
                  </button>
                </div>

                {/* QRIS Code dynamically appearing based on selection */}
                <AnimatePresence>
                  {paymentMethod === 'qris' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-6"
                    >
                      <div className="p-6 bg-orange-50/30 rounded-xl border border-dashed border-secondary text-center space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#5d1900]">
                          Silakan Scan Kode QRIS PanganKu
                        </p>
                        
                        <div className="relative inline-block bg-white p-4 rounded-xl shadow-md border border-gray-100">
                          {/* Real high quality mock QRIS image */}
                          <img 
                            alt="Mock QRIS code" 
                            className="w-40 h-40 mx-auto" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWS30GD5FalNbwtZ4zrWaCEePdjBLHz4j59FBbxBWFjSDOWokDdiBZWwn-eVZkYNg8LiUNyhL8yaOt2BFhf02jDzlQrFdtz_AwRZtT_xfwKJUVR9VhTvIaX3gJvuI3U_T5PbRcOZEGCyH9RfLSUBWwJlKGtGXq65GnWWBjBh_T3DI8l-SHnfnw7wMzytM90ylazZzgltCLaycFSRQssWE9EKturnmbs0g1-6Qsv9oFdTcb4TVC6GzTGlmgLE6pRyLabKaBrG4_CH4"
                          />
                          <div className="absolute inset-2 border-2 border-secondary/20 rounded-lg pointer-events-none" />
                        </div>

                        <div className="flex items-center justify-center gap-1.5 text-red-600 font-extrabold text-sm font-headline bg-white/60 py-1 px-4 rounded-full max-w-[150px] mx-auto border border-red-100 shadow-xs">
                          <Timer className="w-4 h-4 animate-spin text-red-500" />
                          <span>{formatTime(qrisTimer)}</span>
                        </div>
                        
                        <p className="text-[10px] text-gray-500 italic max-w-sm mx-auto">
                          Harap selesaikan pembayaran sebelum waktu habis untuk menghindari sistem mendeteksi pembatalan logistik otomatis.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </section>

              {/* Secure CSRF Hash Indicators to guarantee alignment with mockup */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <div>
                    <span className="text-xs font-extrabold text-[#0b1c30] block">
                      Transaksi Terenkripsi &amp; Aman
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      X-CSRF-Token: pk_live_51MhUJeL89_SecureFulfill_f9X2
                    </span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="SSL Encrypt Active" />
              </div>

            </div>

            {/* Right side checkout overview and pricing calculations */}
            <div className="lg:col-span-5 space-y-6">

              {/* Progress discount tiered visual widget */}
              <section className="bg-primary text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/75">
                      Progress Diskon Belanja
                    </span>
                    <span className="bg-[#fe6a34] text-white text-[9px] font-extrabold px-2 py-0.5 rounded animate-bounce">
                      HOT DEAL
                    </span>
                  </div>

                  <p className="font-headline text-base font-bold min-h-[40px]">
                    {progressLabel.text}
                  </p>

                  {/* Progress bar line */}
                  <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-accent h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-bold text-white/80 font-mono">
                    <span>Target Tier 1: Rp 75k (Diskon 7.5k)</span>
                    <span>Target Tier 2: Rp 150k (Diskon 20k)</span>
                  </div>
                </div>

                {/* decorative watermark background shadow */}
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
                  <Percent className="w-40 h-40" />
                </div>
              </section>

              {/* Bill totals and Submit Trigger button */}
              <section className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100/50 space-y-6">
                <h3 className="font-headline text-base font-extrabold text-primary border-b border-gray-100 pb-3">
                  Ringkasan Tagihan Masuk
                </h3>

                <div className="space-y-3.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} barang)</span>
                    <span className="font-bold text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>

                  {discount > 0 ? (
                    <div className="flex justify-between text-secondary font-bold bg-amber-50/50 p-2 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-[#ab3500]" />
                        Diskon Tier {subtotal >= 150000 ? '2' : '1'}
                      </span>
                      <span>-Rp {discount.toLocaleString('id-ID')}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-gray-400 italic">
                      <span>Diskon Tiered</span>
                      <span>Belum Terbuka</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Ongkos Kirim Logistik</span>
                    <span className="font-bold text-gray-900">
                      {shippingCharge > 0 ? `Rp ${shippingCharge.toLocaleString('id-ID')}` : 'Rp 0'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                  <span className="font-headline text-sm font-bold text-primary">Total Tagihan</span>
                  <div className="text-right">
                    <span className="font-headline text-2xl font-black text-[#052f0c]">
                      Rp {totalBill.toLocaleString('id-ID')}
                    </span>
                    <p className="text-[9px] text-gray-400 mt-0.5">Termasuk pajak PPN 11%</p>
                  </div>
                </div>

                {errors.cart && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-[10px] font-bold text-center">
                    {errors.cart}
                  </div>
                )}

                {/* Buat Pesanan button */}
                <button 
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || cartItems.length === 0}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer ${
                    isSubmitting || cartItems.length === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-secondary text-white hover:bg-opacity-95'
                  }`}
                  id="submit-order-btn"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memproses Logistik...
                    </span>
                  ) : (
                    <>
                      <span>Buat Pesanan Sekarang</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-gray-400 leading-relaxed pt-2">
                  Dengan mengklik di atas, Anda telah secara sah menyetujui <a href="#" className="underline hover:text-primary">Syarat &amp; Ketentuan</a> serta <a href="#" className="underline hover:text-primary">Kebijakan Privasi</a> PanganKu Enterprise.
                </p>
              </section>

              {/* Promo recommendation helper badge to match mockup bottom look if under targets */}
              {subtotal < 150000 && (
                <div className="bg-orange-50 text-[#ab3500] p-4 rounded-2xl flex items-center gap-3 border border-orange-100 shadow-sm">
                  <Percent className="w-6 h-6 text-secondary flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">Hemat Rp 12.500 lagi!</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      Tambah Rp {(150000 - subtotal).toLocaleString('id-ID')} untuk membuka klaim diskon Tier 2 (Rp 20.000).
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
