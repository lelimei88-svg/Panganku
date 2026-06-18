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
  Minus,
  Mail,
  Send
} from 'lucide-react';
import { Product, CartItem, Order } from '../types';
import { TRANSLATIONS, TRANSLATE_PRODUCT_METADATA } from '../translations';
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
  currentLanguage?: 'ID' | 'EN';
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
  loginWithGoogle,
  currentLanguage = 'ID'
}: CheckoutViewProps) {
  const t = TRANSLATIONS[currentLanguage];

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

  const formatPrice = (price: number) => {
    return 'Rp ' + price.toLocaleString(currentLanguage === 'ID' ? 'id-ID' : 'en-US');
  };

  // Translate the cartItems list to reflect the current language dynamically
  const translatedCartItems = cartItems.map(item => {
    const meta = TRANSLATE_PRODUCT_METADATA[currentLanguage]?.[item.product.id as keyof typeof TRANSLATE_PRODUCT_METADATA['ID']];
    return {
      ...item,
      product: {
        ...item.product,
        name: meta?.name || item.product.name,
        unit: meta?.unit || item.product.unit,
        description: meta?.description || item.product.description
      }
    };
  });

  // Calculations
  const calculateSubtotal = () => {
    return translatedCartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
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
        text: currentLanguage === 'ID' ? `Butuh Rp ${remaining.toLocaleString('id-ID')} lagi` : `Need ${formatPrice(remaining)} more`,
        nextTier: currentLanguage === 'ID' ? 'Rp 75k (Hemat 7.5k)' : 'Rp 75k (Save 7.5k)'
      };
    } else if (subtotal < 150000) {
      const remaining = 150000 - subtotal;
      return {
        text: currentLanguage === 'ID' ? `Butuh Rp ${remaining.toLocaleString('id-ID')} lagi` : `Need ${formatPrice(remaining)} more`,
        nextTier: currentLanguage === 'ID' ? 'Rp 150k (Hemat 20k)' : 'Rp 150k (Save 20k)'
      };
    }
    return {
      text: t.chk_disc_max_unlocked,
      nextTier: t.chk_disc_max_unstuff
    };
  };

  const progressLabel = getProgressLabel();

  // Validate form
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!recipientName.trim()) tempErrors.name = t.chk_form_err_name;
    if (!phoneNumber.trim()) tempErrors.phone = t.chk_form_err_phone;
    if (!address.trim()) tempErrors.address = t.chk_form_err_address;
    if (translatedCartItems.length === 0) tempErrors.cart = t.chk_form_err_cart;
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
        items: translatedCartItems.map(item => ({
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
      alert(currentLanguage === 'ID' ? 'Tolong masukkan email tujuan.' : 'Please enter target email address.');
      return;
    }

    // MANDATORY USER CONFIRMATION per Workspace SKILL instructions!
    const confirmPrompt = currentLanguage === 'ID' 
      ? `Kirim detail invoice ke email ${targetEmail}?` 
      : `Send invoice details to email ${targetEmail}?`;
    const confirmed = window.confirm(confirmPrompt);
    if (!confirmed) return;

    setEmailSending(true);
    setEmailSent(false);

    try {
      const subject = `[PanganKu] ${currentLanguage === 'ID' ? 'Konfirmasi & Invoice Pesanan' : 'Order Invoice & Confirmation'} ${orderCompleted.id}`;
      const itemsListHtml = orderCompleted.items.map(item => 
        `<li><strong>${item.productName}</strong> x${item.quantity} (${formatPrice(item.price)})</li>`
      ).join('');

      const bodyHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e8ed; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #052f0c; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PanganKu</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #fe6a34; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${currentLanguage === 'ID' ? 'Invoice Pemesanan Sukses' : 'Order Invoice Successful'}</p>
          </div>
          <div style="padding: 24px; color: #2c3e50; line-height: 1.6;">
            <h2 style="font-size: 18px; color: #052f0c; margin-top: 0;">${currentLanguage === 'ID' ? 'Halo' : 'Hello'} ${orderCompleted.clientName},</h2>
            <p>${currentLanguage === 'ID' ? 'Terima kasih telah berbelanja pertanian organik & segar di PanganKu! Pesanan Anda telah diterima sistem logistik kami.' : 'Thank you for shopping farm-fresh organic products on PanganKu! Your order has been admitted to our logistics core pipeline.'}</p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #fe6a34; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${currentLanguage === 'ID' ? 'Ringkasan Pesanan:' : 'Order Summary:'}</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                ${itemsListHtml}
              </ul>
              <hr style="border: 0; border-top: 1px solid #e1e8ed; margin: 12px 0;" />
              <table style="width: 100%; font-size: 13px;">
                <tr><td>Subtotal:</td><td style="text-align: right; font-weight: bold;">${formatPrice(orderCompleted.subtotal)}</td></tr>
                <tr><td>${currentLanguage === 'ID' ? 'Diskon Hemat' : 'Benefit Discount'}:</td><td style="text-align: right; color: #fe6a34; font-weight: bold;">-${formatPrice(orderCompleted.discount)}</td></tr>
                <tr><td>${currentLanguage === 'ID' ? 'Ongkos Kirim' : 'Freight Shipping'}:</td><td style="text-align: right; font-weight: bold;">${formatPrice(orderCompleted.shipping)}</td></tr>
                <tr style="font-size: 15px; font-weight: bold; color: #052f0c;">
                  <td>${currentLanguage === 'ID' ? 'Total Bayar' : 'Aggregated Total'}:</td>
                  <td style="text-align: right;">${formatPrice(orderCompleted.total)}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px;"><strong>${currentLanguage === 'ID' ? 'Alamat Pengiriman:' : 'Delivery Address:'}</strong><br />${orderCompleted.address}</p>
            <p style="font-size: 13px;"><strong>${currentLanguage === 'ID' ? 'Metode Pembayaran' : 'Payment Route'}:</strong> ${orderCompleted.paymentMethod === 'cod' ? (currentLanguage === 'ID' ? 'Bayar di Tempat (COD)' : 'Cash On Delivery (COD)') : 'QRIS Digital'}</p>
            
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
      alert(currentLanguage === 'ID' ? `Gagal mengirim invoice email: ${err.message || 'Error jaringan tidak dikenal'}` : `Failed to dispatch invoice: ${err.message || 'Unknown Network Error'}`);
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
          className="flex items-center gap-2 text-primary hover:text-secondary font-bold text-xs md:text-sm tracking-wider uppercase transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{t.chk_header_back}</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="font-headline text-lg md:text-xl font-black text-primary tracking-tight">
            Checkout <span className="text-secondary">{t.nav_enterprise}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 text-primary">
          <ShieldAlert className="w-5 h-5 text-accent fill-accent/10" />
          <span className="hidden sm:inline font-bold text-[10px] tracking-wider uppercase">{t.chk_header_desc}</span>
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
              <h2 className="font-headline text-2xl md:text-3xl font-black text-primary">{t.chk_success_title}</h2>
              <p className="text-gray-500 text-sm">{t.chk_success_subtitle}</p>
              <div className="inline-block px-4 py-2 bg-emerald-50 text-primary rounded-xl font-mono font-bold text-lg border border-emerald-100">
                {orderCompleted.id}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 text-left text-xs space-y-3 border border-gray-100">
              <div className="flex justify-between font-bold text-primary border-b border-gray-100 pb-2">
                <span>{t.chk_success_card_title}</span>
                <span>PanganKu Secure</span>
              </div>
              <p><strong>{t.chk_success_recipient}</strong> {orderCompleted.clientName}</p>
              <p><strong>{t.chk_success_address}</strong> {orderCompleted.address}</p>
              <p><strong>{t.chk_success_payment}</strong> {orderCompleted.paymentMethod === 'cod' ? (currentLanguage === 'ID' ? 'Bayar di Tempat (COD)' : 'Cash On Delivery (COD)') : 'QRIS Digital'}</p>
              <p className="text-[10px] text-gray-400 font-mono"><strong>{t.chk_success_csrf}</strong> {orderCompleted.csrfToken}</p>
            </div>

            {/* Gmail Invoice Integration Block */}
            <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 text-left space-y-4">
              <div className="flex items-center gap-2 text-primary border-b border-emerald-100 pb-2">
                <Mail className="w-4.5 h-4.5 text-secondary" />
                <span className="font-headline text-sm font-extrabold">{t.chk_success_gmail_title}</span>
              </div>

              {emailSent ? (
                <div className="p-3.5 bg-emerald-100 border border-emerald-200 text-primary rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>{t.chk_success_gmail_sent}</span>
                </div>
              ) : !googleAccessToken ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t.chk_success_gmail_oauth}
                  </p>
                  <button 
                    type="button"
                    onClick={() => loginWithGoogle && loginWithGoogle().catch(() => {})}
                    className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>{t.profile_login}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t.chk_success_gmail_ready_desc}
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder={t.chk_success_gmail_placeholder}
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      className="flex-grow px-3.5 py-2 border border-gray-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-secondary focus:border-transparent transition-all"
                    />
                    <button 
                      type="button"
                      onClick={handleSendInvoiceEmail}
                      disabled={emailSending}
                      className="px-4 py-2 bg-secondary text-white hover:bg-opacity-95 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {emailSending ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{t.chk_success_gmail_sending}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{t.chk_success_gmail_send_btn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={onNavigateToCatalog}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
              >
                {t.chk_success_back_btn}
              </button>
              <button 
                onClick={() => {
                  setOrderCompleted(null);
                  onNavigateToAdmin();
                }}
                className="flex-1 bg-primary text-white hover:bg-opacity-95 py-3.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
              >
                {t.chk_success_admin_btn}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Standard Unsubmitted checkout page grid mapping */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            
            {/* Left side actions (Forms and payment) */}
            <div className="lg:col-span-7 space-y-6">

              {/* Form Delivery Address */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100/40 relative">
                {/* Auto fill helper */}
                <button 
                  onClick={handleAutoFill}
                  className="absolute top-4 right-4 text-[10px] font-bold text-secondary bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  {t.chk_form_auto_fill}
                </button>

                <div className="flex items-center gap-2 mb-6 text-primary">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <h2 className="font-headline text-lg font-bold">{t.chk_form_title}</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                        {t.chk_form_label_name}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          placeholder={t.chk_form_placeholder_name} 
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className={`w-full bg-white border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-xl py-3 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
                        />
                      </div>
                      {errors.name && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.name}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                        {t.chk_form_label_phone}
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="tel" 
                          placeholder={t.chk_form_placeholder_phone} 
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
                      {t.chk_form_label_address}
                    </label>
                    <textarea 
                      placeholder={t.chk_form_placeholder_address} 
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
                    <h2 className="font-headline text-lg font-bold">{t.chk_items_summary}</h2>
                  </div>
                  <span className="text-xs bg-emerald-50 text-primary px-3 py-1 rounded-full font-bold">
                    {translatedCartItems.length} {t.chk_items_count}
                  </span>
                </div>

                {translatedCartItems.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm space-y-3">
                    <p>{t.chk_items_empty}</p>
                    <button 
                      onClick={onNavigateToCatalog}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-opacity-95"
                    >
                      {t.chk_items_shop_btn}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 divide-y divide-gray-50">
                    {translatedCartItems.map((item, index) => (
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
                            {currentLanguage === 'ID' ? 'Porsi' : 'Unit'} {item.product.unit}
                          </span>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
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
                              className="w-5 h-5 rounded hover:bg-white text-gray-500 font-bold flex items-center justify-center text-xs active:scale-95 transition-all text-center cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-gray-700 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="w-5 h-5 rounded hover:bg-white text-gray-500 font-bold flex items-center justify-center text-xs active:scale-95 transition-all text-center cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Direct remove click */}
                        <button 
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={currentLanguage === 'ID' ? "Hapus" : "Remove"}
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
                  <h2 className="font-headline text-lg font-bold">{t.chk_payment_title}</h2>
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
                    <span className="text-xs font-bold">{t.chk_payment_cod}</span>
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
                    <span className="text-xs font-bold">{t.chk_payment_qris}</span>
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
                          {t.chk_qris_header}
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
                          {t.chk_qris_disclaimer}
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
                      {t.chk_secure_footer_title}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      {t.chk_secure_footer_hash}
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
                      {t.chk_disc_progress}
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

                  <div className="flex flex-col sm:flex-row justify-between text-[10px] font-bold text-white/80 font-mono gap-1">
                    <span>{t.chk_disc_tier1}</span>
                    <span>{t.chk_disc_tier2}</span>
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
                  {t.chk_bill_title}
                </h3>

                <div className="space-y-3.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>{t.chk_bill_subtotal} ({translatedCartItems.length} {t.chk_bill_subtotal_units})</span>
                    <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 ? (
                    <div className="flex justify-between text-secondary font-bold bg-amber-50/50 p-2 rounded-lg leading-none items-center">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-[#ab3500]" />
                        {t.chk_bill_discount} {subtotal >= 150000 ? '2' : '1'}
                      </span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-gray-400 italic">
                      <span>{t.chk_bill_discount}</span>
                      <span>{t.chk_bill_discount_locked}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>{t.chk_bill_shipping}</span>
                    <span className="font-bold text-gray-900">
                      {shippingCharge > 0 ? formatPrice(shippingCharge) : 'Rp 0'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                  <span className="font-headline text-sm font-bold text-primary">{t.chk_bill_total}</span>
                  <div className="text-right">
                    <span className="font-headline text-2xl font-black text-[#052f0c]">
                      {formatPrice(totalBill)}
                    </span>
                    <p className="text-[9px] text-gray-400 mt-0.5">{t.chk_bill_ppn}</p>
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
                  disabled={isSubmitting || translatedCartItems.length === 0}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer ${
                    isSubmitting || translatedCartItems.length === 0 
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
                      <span>{t.chk_bill_submitting}</span>
                    </span>
                  ) : (
                    <>
                      <span>{t.chk_bill_submit}</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-gray-400 leading-relaxed pt-2">
                  {t.chk_bill_terms_disclaimer}
                </p>
              </section>

              {/* Promo recommendation helper badge to match mockup bottom look if under targets */}
              {subtotal < 150000 && (
                <div className="bg-orange-50 text-[#ab3500] p-4 rounded-2xl flex items-center gap-3 border border-orange-100 shadow-sm animate-fadeIn">
                  <Percent className="w-6 h-6 text-secondary flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">{t.chk_promo_save_more_title}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      {t.chk_promo_save_more_desc.replace('{gap}', (150000 - subtotal).toLocaleString(currentLanguage === 'ID' ? 'id-ID' : 'en-US'))}
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
