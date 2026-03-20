'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer'; 
import OrderCalculator from '@/components/layout/OrderCalculator'; 
export default function CalculatePage() {
  return (
    <>
      <Navbar />
      
      {/* Sayfa Başlığı (Hero Section) */}
      <section style={{ 
        background: '#1c0800', 
        padding: '80px 20px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dekoratif Altın Çizgi */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          height: '4px', 
          background: 'linear-gradient(90deg, transparent, #c8860a, transparent)' 
        }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontFamily: "'Barlow Condensed', sans-serif", 
            fontSize: '3.5rem', 
            color: '#fff', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '15px'
          }}>
            Fiyat <span style={{ color: '#c8860a' }}>Hesapla</span>
          </h1>
          <p style={{ 
            fontFamily: "'Barlow', sans-serif",
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '1.1rem',
            lineHeight: 1.6
          }}>
            Gönderinizin detaylarını girerek anında net fiyat bilgisi alabilir, 
            isterseniz hemen bir kurye çağırabilirsiniz.
          </p>
        </div>
      </section>

      {/* Ana Hesaplama Alanı */}
      <main style={{ 
        background: '#faf9f7', 
        padding: '60px 0',
        minHeight: '600px'
      }}>
        <OrderCalculator />
        
        {/* Alt Bilgi Kartları */}
        <div style={{ 
          maxWidth: 1100, 
          margin: '60px auto 0 auto', 
          padding: '0 20px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          <InfoBox 
            title="Mesafe Bazlı Ücretlendirme" 
            text="Fiyatlarımız başlangıç ve varış noktası arasındaki kuş uçuşu değil, gerçek yol mesafesine göre hesaplanır."
          />
          <InfoBox 
            title="Operasyonel Verimlilik" 
            text="Kurye ağımızı trafik ve yoğunluk durumuna göre optimize ediyor, size en yakın kuryeyi en doğru zamanda yönlendiriyoruz."
          />
          <InfoBox 
            title="Sigortalı Taşımacılık" 
            text="Tüm gönderileriniz teslimat süresince Prime Kurye güvencesiyle koruma altındadır."
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

// Küçük Bilgi Kutucuğu Bileşeni
function InfoBox({ title, text }: { title: string, text: string }) {
  return (
    <div style={{ 
      background: '#fff', 
      padding: '30px', 
      borderRadius: '20px', 
      border: '1px solid rgba(28,8,0,0.06)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
    }}>
      <h3 style={{ 
        fontFamily: "'Barlow', sans-serif", 
        fontWeight: 700, 
        fontSize: '1.1rem', 
        color: '#1c0800',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ width: '8px', height: '8px', background: '#c8860a', borderRadius: '50%' }} />
        {title}
      </h3>
      <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}