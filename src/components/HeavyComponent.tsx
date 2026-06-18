import React from 'react';

export default function HeavyComponent() {
  return (
    <div id="heavy-optimization-component" className="p-6 mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm text-left">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
        <h4 className="font-headline text-md font-extrabold text-primary">Komponen Berat (Lazy Loaded)</h4>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        Komponen ini dimuat secara asinkron hanya ketika dibutuhkan (lazy load di sisi klien). 
        Ini mengurangi ukuran bundel JavaScript utama, mempercepat First Contentful Paint (FCP) secara signifikan!
      </p>
      <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-100/60 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] text-gray-400 font-mono">STATUS LOAD</p>
          <p className="text-xs font-bold text-primary">Sukses Dimuat Dinamis</p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-100/80 text-primary text-[10px] font-bold rounded-lg border border-emerald-200">
          Client-Side Only
        </span>
      </div>
    </div>
  );
}
