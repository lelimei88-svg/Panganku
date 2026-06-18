import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  RefreshCw, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink,
  Lock,
  ChevronRight,
  Sparkles,
  Inbox
} from 'lucide-react';

import { TRANSLATIONS } from '../translations';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
}

interface GmailManagerProps {
  googleAccessToken: string | null;
  loginWithGoogle: () => Promise<string | null>;
  currentLanguage?: 'ID' | 'EN';
}

export default function GmailManager({ googleAccessToken, loginWithGoogle, currentLanguage = 'ID' }: GmailManagerProps) {
  const t = TRANSLATIONS[currentLanguage];
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  
  // Compose email state
  const [toInput, setToInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Load emails
  const fetchGmailMessages = async () => {
    if (!googleAccessToken) return;
    setLoading(true);
    setError(null);
    try {
      // Step 1: List the latest 8 messages from the user's Inbox
      const listResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8&q=label:INBOX', {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          Accept: 'application/json'
        }
      });

      if (!listResponse.ok) {
        throw new Error(`Gmail API returned status ${listResponse.status}`);
      }

      const listData = await listResponse.json();
      
      if (!listData.messages || listData.messages.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Step 2: Fetch details of each message in parallel
      const detailedMessages = await Promise.all(
        listData.messages.map(async (msg: { id: string; threadId: string }) => {
          try {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
              headers: {
                Authorization: `Bearer ${googleAccessToken}`,
                Accept: 'application/json'
              }
            });
            if (!detailRes.ok) return null;
            const detailData = await detailRes.json();
            
            const headers = detailData.payload?.headers || [];
            const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
            const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
            const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || 'Unknown Date';

            return {
              id: detailData.id,
              threadId: detailData.threadId,
              snippet: detailData.snippet || '',
              subject,
              from,
              date
            } as GmailMessage;
          } catch (e) {
            console.error(`Failed to load details for message ${msg.id}:`, e);
            return null;
          }
        })
      );

      // Filter out failed entries
      setMessages(detailedMessages.filter((m): m is GmailMessage => m !== null));
    } catch (e: any) {
      console.error('Error listing Gmail messages:', e);
      setError(e.message || 'Gagal memuat pesan Gmail. Pastikan token masih berlaku.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (googleAccessToken) {
      fetchGmailMessages();
    }
  }, [googleAccessToken]);

  // Encode text as RFC 2822 URL-safe base64 MIME
  const buildMimeMessage = (to: string, subject: string, body: string) => {
    const cleanTo = to.trim();
    const cleanSubject = subject.trim();
    const base64Utf8Subject = btoa(unescape(encodeURIComponent(cleanSubject)));
    
    const emailLines = [
      `To: ${cleanTo}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: =?utf-8?B?${base64Utf8Subject}?=`,
      '',
      body.replace(/\n/g, '<br />')
    ];
    
    const mime = emailLines.join('\r\n');
    return btoa(unescape(encodeURIComponent(mime)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toInput || !bodyInput) {
      alert('Tolong lengkapi penerima dan isi pesan email.');
      return;
    }

    // MANDATORY USER CONFIRMATION per Workspace SKILL instructions!
    const confirmed = window.confirm(
      `Konfirmasi Pengiriman Email:\n\nKepada: ${toInput}\nSubjek: ${subjectInput || '(No Subject)'}\n\nKirim email ini sekarang via Gmail?`
    );
    if (!confirmed) return;

    setSending(true);
    setSendSuccess(false);

    try {
      const base64Raw = buildMimeMessage(toInput, subjectInput || '(No Subject)', bodyInput);
      
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
        throw new Error(`Gmail Send API returned code ${res.status}`);
      }

      setSendSuccess(true);
      setBodyInput('');
      setSubjectInput('');
      // Keep recipient to let them do secondary correspondence easily or empty
    } catch (err: any) {
      console.error('Failed to send email:', err);
      alert(`Gagal mengirim email: ${err.message || 'Unknown network error'}`);
    } finally {
      setSending(false);
    }
  };

  const selectMessageAndPrepareReply = (msg: GmailMessage) => {
    setSelectedMessage(msg);
    // Extrapolate email address from Header string like "John Doe <john@example.com>"
    const emailMatch = msg.from.match(/<([^>]+)>/);
    const replyTo = emailMatch ? emailMatch[1] : msg.from;
    setToInput(replyTo);
    setSubjectInput(msg.subject.toLowerCase().startsWith('re:') ? msg.subject : `Re: ${msg.subject}`);
    setSendSuccess(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
      
      {/* Header section with brand info */}
      <div className="p-6 border-b border-gray-100 bg-[#052f0c]/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-headline text-lg font-extrabold text-primary flex items-center gap-2">
            <Mail className="w-5 h-5 text-secondary animate-pulse" />
            <span>Gmail Customer Support Hub</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Integrasi Google Workspace Nyata untuk Korespondensi Logistik & Masukan Pelanggan.</p>
        </div>

        {googleAccessToken && (
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchGmailMessages}
              disabled={loading}
              className="p-2 hover:bg-emerald-50 rounded-xl text-primary border border-emerald-100 flex items-center gap-1.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh Kotak Masuk"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        )}
      </div>

      {!googleAccessToken ? (
        <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#fe6a34]/10 rounded-full flex items-center justify-center">
            <Inbox className="w-8 h-8 text-[#fe6a34]" />
          </div>
          <div className="space-y-2">
            <h4 className="font-headline text-base font-bold text-gray-900">Hubungkan Akun Gmail Anda</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Aktifkan fungsi logistik lanjutan untuk membaca korespondensi email logistik pelanggan dan mengirim email konfirmasi penanganan pesanan secara real-time dari panel PanganKu ini.
            </p>
          </div>

          {/* GSI Compliant Sign in button with markup precisely as specified */}
          <button 
            type="button"
            onClick={() => loginWithGoogle().catch(() => {})}
            className="gsi-material-button"
            style={{
              backgroundColor: 'white',
              border: '1px solid #747775',
              borderRadius: '4px',
              boxSizing: 'border-box',
              color: '#1f1f1f',
              cursor: 'pointer',
              fontFamily: '"Roboto", arial, sans-serif',
              fontSize: '14px',
              height: '40px',
              letterSpacing: '0.25px',
              outline: 'none',
              overflow: 'hidden',
              padding: '0 12px',
              position: 'relative',
              textAlign: 'center',
              transition: 'background-color .218s, border-color .218s, box-shadow .218s',
              verticalAlign: 'middle',
              whiteSpace: 'nowrap',
              width: 'auto',
              maxWidth: '280px',
              minWidth: '200px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'
            }}
          >
            <div className="gsi-material-button-state" style={{ transition: 'opacity .21s', borderRadius: '4px', bottom: '0', left: '0', opacity: '0', position: 'absolute', right: '0', top: '0', backgroundColor: '#1f1f1f' }}></div>
            <div className="gsi-material-button-content-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: '100%', width: '100%', gap: '10px' }}>
              <div className="gsi-material-button-icon" style={{ display: 'block', height: '20px', width: '20px' }}>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents" style={{ WebkitFontSmoothing: 'antialiased', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '13.5px', fontWeight: '500', textOverflow: 'ellipsis', overflow: 'hidden' }}>Hubungkan Google Gmail</span>
            </div>
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 justify-center">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Kredensial OAuth aman & disimpan dalam memory browser</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 flex-grow min-h-[450px]">
          
          {/* Email Messages Inbox Queue (Left 5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-gray-50/40">
            <div className="p-4 bg-white/70 border-b border-gray-100 flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <span>Kotak Masuk Lapangan</span>
                <span className="bg-[#fe6a34]/15 text-[#fe6a34] px-1.5 py-0.5 rounded text-[9px] font-bold font-mono">
                  {messages.length} INBOX
                </span>
              </span>
            </div>

            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center p-10 space-y-3">
                <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                <span className="text-xs text-gray-400 font-medium">Melakukan query real-time kepada Gmail...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="text-xs text-red-500 font-bold">{error}</p>
                <button 
                  onClick={fetchGmailMessages}
                  className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-xs text-primary font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-gray-450 italic space-y-2">
                <Inbox className="w-8 h-8 text-gray-300" />
                <p className="text-xs">Tidak ditemukan pesan baru di kotak masuk utama Anda.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-y-auto max-h-[480px]">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => selectMessageAndPrepareReply(msg)}
                    className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 border-l-3 cursor-pointer ${
                      selectedMessage?.id === msg.id 
                        ? 'bg-emerald-50/40 border-[#fe6a34]' 
                        : 'bg-white border-transparent hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-gray-900 text-xs truncate max-w-[170px]" title={msg.from}>
                        {msg.from.split('<')[0] || msg.from}
                      </span>
                      <span className="text-[9.5px] text-gray-400 font-mono flex items-center gap-0.5 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {msg.date.split(',').slice(-1)[0]?.trim() || 'Baru'}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-800 text-[11.5px] line-clamp-1">
                      {msg.subject}
                    </span>
                    <p className="text-[10.5px] text-gray-400 line-clamp-2 leading-relaxed">
                      {msg.snippet}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Email View & Quick Reply Form (Right 7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-white">
            {selectedMessage ? (
              <div className="p-6 space-y-6 flex-grow flex flex-col justify-between">
                
                {/* Active message display */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <button 
                      onClick={() => setSelectedMessage(null)}
                      className="lg:hidden text-gray-400 hover:text-primary flex items-center gap-1 text-xs font-bold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali ke Inbox</span>
                    </button>
                    <span className="text-[10px] bg-emerald-100 text-[#052f0c] font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider ml-auto">
                      ID MENS: {selectedMessage.id.substring(0, 8)}...
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-450 uppercase font-black tracking-widest block">Subjek Email</span>
                    <h4 className="font-headline text-base font-extrabold text-primary leading-tight">
                      {selectedMessage.subject}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100/65 text-xs">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 font-black text-white flex items-center justify-center text-xs">
                      {selectedMessage.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-900 truncate">Dari: {selectedMessage.from}</p>
                      <p className="text-[10px] text-gray-400 truncate">{selectedMessage.date}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-450 uppercase font-black tracking-widest block">Ringkasan Badan Email</span>
                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 text-xs text-gray-700 leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {selectedMessage.snippet}
                      <span className="text-gray-400 italic block mt-3 text-[10px]">
                        *Badan email di atas disingkat langsung dari server Gmail demi efisiensi visual.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Reply Form */}
                <form onSubmit={handleSendEmail} className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 space-y-4 mt-6">
                  <div className="flex items-center gap-2 text-primary border-b border-emerald-200/50 pb-2.5">
                    <Send className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-black uppercase tracking-wider">Kirim Balasan Korespondensi</span>
                  </div>

                  {sendSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Email berhasil terkirim melalui API resmi Gmail!</span>
                    </div>
                  )}

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Penerima (To:)</label>
                      <input 
                        type="email" 
                        required
                        value={toInput}
                        onChange={(e) => setToInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#fe6a34] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Subjek (Subject:)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Subjek email balasan"
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#fe6a34] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Isi Pesan Balasan (Body:)</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="Tulis balasan Anda kepada pembeli PanganKu di sini..."
                        value={bodyInput}
                        onChange={(e) => setBodyInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#fe6a34] focus:outline-none"
                      ></textarea>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={sending}
                    style={{ cursor: 'pointer' }}
                    className="w-full py-2.5 bg-secondary hover:bg-opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim Email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Balasan Resmi</span>
                      </>
                    )}
                  </button>
                </form>

              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center space-y-4 text-gray-400 min-h-[400px]">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="text-xs font-bold text-gray-700">Pilih Pesan dari Kotak Masuk</p>
                  <p className="text-[11px] leading-relaxed">
                    Klik salah satu pesan masuk di panel sebelah kiri untuk membaca detail kendala pengiriman atau membalas pesan logistik langsung menggunakan Gmail API.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
