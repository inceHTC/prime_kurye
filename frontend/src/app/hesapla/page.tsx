'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import OrderCalculator from '@/components/layout/OrderCalculator'
import { Calculator, MapPin, ShieldCheck, Globe } from 'lucide-react'

export default function CalculatePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fcfaf5] selection:bg-[#c8860a]/20">
      <Navbar />

      <main className="relative pt-24 pb-20 overflow-hidden">
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#f3eee2] to-transparent -z-10" />
        
        <section className="max-w-[1200px] mx-auto px-6">
          
          {/* Üst Başlık Alanı */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e8e2d5] shadow-sm">
              <Calculator size={14} className="text-[#c8860a]" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#4a3020]">
                Akıllı Fiyatlandırma
              </span>
            </div>
            
            {/* ANA BAŞLIK: MODERN, TİTİZ VE GÜÇLÜ */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#1c0800] tracking-tighter leading-[1.1] font-sans">
              Gönderini <span className="text-[#c8860a]">Hesapla.</span>
            </h1>
            
            <p className="max-w-[650px] mx-auto text-[#665345] text-lg md:text-xl leading-relaxed font-medium opacity-80">
              İstanbul genelinde şeffaf fiyatlandırma ile tanışın. İlçeleri seçin ve saniyeler içinde teklifinizi alın.
            </p>
          </div>

          {/* Hesaplama Aracı Konteynırı */}
          <div className="relative max-w-[1100px] mx-auto">
            <div className="relative bg-white border border-[#e8e2d5] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(28,8,0,0.06)] overflow-hidden p-2 md:p-6">
              
              {/* HESAPLAMA VE SONUÇ KARTI BAŞLIKLARINA MÜDAHALE:
                Bileşen içindeki tüm küçük-büyük başlıkları (span, h2, h3) 
                senin istediğin o modern Sans-Serif fonta çekiyoruz.
              */}
              <div className="
                [&_h2]:font-extrabold [&_h2]:text-[#1c0800] [&_h2]:tracking-tighter [&_h2]:text-3xl [&_h2]:mb-2 [&_h2]:font-sans
                [&_h3]:font-extrabold [&_h3]:text-[#1c0800] [&_h3]:tracking-tighter [&_h3]:text-2xl [&_h3]:font-sans
                [&_.card-title]:font-extrabold [&_.card-title]:tracking-tighter [&_.card-title]:font-sans
                [&_span]:font-bold [&_span]:tracking-tight
              ">
                <OrderCalculator />
              </div>

            </div>
          </div>

          {/* Alt Bilgi Bölümü */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24 border-t border-[#e8e2d5]/60 pt-16">
            {[
              { icon: MapPin, title: "Hassas Mesafe", desc: "Noktadan noktaya gerçek zamanlı rota analizi." },
              { icon: ShieldCheck, title: "Sabit Ücret", desc: "Ekranınızda ne görüyorsanız o." },
              { icon: Globe, title: "Tüm İstanbul", desc: "39 ilçenin tamamında aktif hizmet." }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#e8e2d5] flex items-center justify-center text-[#c8860a] transition-transform group-hover:scale-110">
                  <item.icon size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#1c0800] tracking-tighter font-sans">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#665345] leading-relaxed mt-1 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}