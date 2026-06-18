import React, { useState, Suspense, startTransition } from 'react';
import { 
  QueryClient, 
  QueryClientProvider, 
  useQuery 
} from '@tanstack/react-query';
import { 
  Cpu, 
  Zap, 
  Sparkles, 
  RefreshCw, 
  Globe, 
  Database,
  ArrowRight,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';

// Create a self-contained query client for the Optimization view
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

// Lazy loaded heavy component
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Fetch function matching user instruction/screeshot
const fetchData = async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
  if (!res.ok) {
    throw new Error('Gagal mengambil data optimasi API');
  }
  return res.json();
};

export default function OptimizationDemo() {
  return (
    <QueryClientProvider client={queryClient}>
      <OptimizationPanelContent />
    </QueryClientProvider>
  );
}

function OptimizationPanelContent() {
  const [showHeavy, setShowHeavy] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // useQuery matching screenshot: key is ['post']
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['post', refetchTrigger],
    queryFn: fetchData,
  });

  const handleRefetch = () => {
    // Increment trigger to force cache check / refetch demo
    setRefetchTrigger(prev => prev + 1);
  };

  return (
    <div id="optimization-demo-view" className="space-y-8 animate-fadeIn">
      {/* Hero Banner Header */}
      <div className="bg-gradient-to-br from-[#052f0c] to-[#0a4214] text-white p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-emerald-850">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-secondary/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white/10 text-secondary border border-white/15 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Zap className="w-3 h-3 text-secondary fill-secondary animate-pulse" />
              <span>Optimasi Web & Caching Demo</span>
            </span>
            <h1 className="font-headline font-black text-2xl md:text-3.5xl tracking-tight leading-none text-white">
              Sistem Caching & Lazy Loading Terpadu
            </h1>
            <p className="text-emerald-100/90 text-xs md:text-sm max-w-xl">
              Eksperimen performa modern untuk memangkas waktu muat halaman, efisiensi transfer data, 
              serta visualisasi dinamis hemat kuota.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4.5 min-w-[120px] text-center">
              <p className="text-[9px] text-emerald-200/80 font-mono tracking-wider uppercase mb-0.5">SSR HYDRATION</p>
              <p className="font-headline text-lg font-black text-white">Ready</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4.5 min-w-[120px] text-center">
              <p className="text-[9px] text-emerald-200/80 font-mono tracking-wider uppercase mb-0.5">BUNDLE OPTIMIZED</p>
              <p className="font-headline text-lg font-black text-secondary">Yes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout of Optimizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Caching with React Query */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-primary rounded-2xl">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-headline font-black text-base text-[#052f0c]">
                  Client Cache Controller
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">POWERED BY@TANSTACK/REACT-QUERY</p>
              </div>
            </div>

            <button
              onClick={handleRefetch}
              disabled={isLoading || isFetching}
              className="p-2 bg-gray-50 hover:bg-emerald-100 border border-gray-200 text-primary rounded-xl transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
              title="Paksa Refetch Data"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-secondary' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Menghindari panggilan API duplikat dengan menyimpan data secara instan di memori cache lokal. 
            Jika query dieksekusi kembali, sistem akan langsung menyajikan data dari cache dalam waktu <strong>0ms</strong> sembari memverifikasi kesegaran data di latar belakang.
          </p>

          {/* Simulated Monitor Board */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>Status Cache Query</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                isFetching ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isFetching ? '🔄 FETCHING / STALE-REVALIDATE' : '● FRESH (CHACHED)'}
              </span>
            </div>

            {/* Displaying fetched dummy post in UI */}
            {isLoading ? (
              <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center space-y-2">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400 font-mono animate-pulse">Menghubungi jsonplaceholder.typicode.com ...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 font-medium">
                Gagal memuat demo API: {(error as Error).message}
              </div>
            ) : (
              <div className="relative">
                <div className="p-4.5 bg-gray-950 text-emerald-400 font-mono text-xs rounded-2xl shadow-inner border border-gray-900 overflow-x-auto max-h-[180px] leading-relaxed">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
                    <span className="text-[10px] text-gray-500">RESPONSE JSON (API CACHED)</span>
                    <span className="text-[9px] text-[#fe6a34] font-bold">200 OK</span>
                  </div>
                  <pre className="text-[11px] whitespace-pre-wrap">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#052f0c]">Detail Caching Klien</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Metode pengambilan data ini secara luring menyimpan response di memori terenkripsi. 
                Sangat tangguh untuk aplikasi katalog yang sering melakukan transisi halaman tanpa membebani server database berulang-ulang!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Code Splitting & Lazy Loading */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Cpu className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-headline font-black text-base text-gray-850">
                  Lazy Load Module
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">REACT.LAZY + SUSPENSE BUNDLE</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Memisahkan kode berat (seperti visualisasi bagan, grafik, dashboard admin yang masif) agar tidak diunduh langsung pada pemuatan pertama situs.
              KODE baru akan diunduh secara dinamis dari server hanya ketika pengguna menekan tombol "Muat Komponen" di bawah ini!
            </p>

            {/* Interactive Control Trigger */}
            <div className="pt-2 text-center md:text-left">
              <button
                onClick={() => {
                  // Use transition to avoid freezing main thread
                  startTransition(() => {
                    setShowHeavy(prev => !prev);
                  });
                }}
                className={`w-full md:w-auto px-5 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  showHeavy 
                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                    : 'bg-primary text-white hover:bg-[#0c4015]'
                }`}
              >
                <span>{showHeavy ? 'Hapus Komponen Berat' : 'Muat Komponen Berat (Lazy)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lazy Load Component Display Area */}
            <div className="pt-2">
              {showHeavy ? (
                <Suspense fallback={
                  <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400 font-mono flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span>Mengunduh kode modul secara dinamis...</span>
                  </div>
                }>
                  <HeavyComponent />
                </Suspense>
              ) : (
                <div className="p-6 bg-gray-50/40 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400 leading-relaxed">
                  Komponen berat belum dimuat. Klik tombol di atas untuk mensimulasikan Dynamic Imports luring!
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-gray-400 text-[10px] font-mono">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-500" />
              OPTIMIZATION HUB ACTIVE
            </span>
            <span>Vite v6 + React 19</span>
          </div>
        </div>
      </div>
    </div>
  );
}
