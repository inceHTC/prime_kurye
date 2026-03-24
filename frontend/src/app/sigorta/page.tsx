// ================================
// SİGORTA SAYFASI
// src/app/sigorta/page.tsx
// ================================
'use client'

import Link from 'next/link'
import { Shield, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function SigortaPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <div style={{ background: '#1c0800', padding: '56px 24px 64px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(200,134,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Shield size={28} color="#c8860a" />
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#fff', marginBottom: 12 }}>
          Paket Sigortası
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.50)', maxWidth: 480, margin: '0 auto' }}>
          Tüm gönderileriniz 10.000₺'ye kadar sigorta güvencesi altında.
        </p>
      </div>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Ana kart */}
        <div style={{ background: '#fff', borderRadius: 16, border: '2px solid rgba(200,134,10,0.25)', padding: '32px 28px', marginBottom: 24, textAlign: 'center' }}>
          <p style={{ fontSize: '0.82rem', color: '#a89080', marginBottom: 8, fontWeight: 600 }}>SİGORTA LİMİTİ</p>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '3rem', color: '#c8860a', lineHeight: 1, marginBottom: 8 }}>10.000₺</p>
          <p style={{ fontSize: '0.875rem', color: '#7a6050' }}>Her teslimat için otomatik sigorta</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }} className="ins-grid">
          <div style={{ background: '#f0fdf4', borderRadius: 12, border: '1px solid rgba(22,163,74,0.20)', padding: '20px 22px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#166534', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} /> Sigorta Kapsamı
            </h3>
            <ul style={{ paddingLeft: 18, fontSize: '0.875rem', color: '#4a3020', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Kargo kayıpları</li>
              <li>Nakliye sırasında oluşan hasarlar</li>
              <li>Yanlış teslimat nedeniyle oluşan kayıplar</li>
              <li>Hırsızlık vakaları</li>
            </ul>
          </div>
          <div style={{ background: '#fee2e2', borderRadius: 12, border: '1px solid rgba(220,38,38,0.15)', padding: '20px 22px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#991b1b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={16} /> Kapsam Dışı
            </h3>
            <ul style={{ paddingLeft: 18, fontSize: '0.875rem', color: '#4a3020', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Yanlış/eksik adres beyanı</li>
              <li>Yasak madde gönderimleri</li>
              <li>Yetersiz ambalaj kaynaklı hasarlar</li>
              <li>Doğal afet ve mücbir sebepler</li>
            </ul>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px 22px', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c0800', marginBottom: 14 }}>Hasar/Kayıp Bildirimi</h3>
          <ol style={{ paddingLeft: 20, fontSize: '0.875rem', color: '#4a3020', display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.7 }}>
            <li>Teslimat tamamlandıktan sonra <strong>24 saat içinde</strong> bildirim yapılmalıdır.</li>
            <li>destek@vinkurye.com adresine sipariş numarası ve hasar fotoğraflarını gönderin.</li>
            <li>Ekibimiz 2 iş günü içinde size dönüş yapar.</li>
            <li>Onaylanan talepler için 5-10 iş günü içinde iade yapılır.</li>
          </ol>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/siparis" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: '#c8860a', color: '#1c0800', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
            Hemen Gönderim Yap <ChevronRight size={16} />
          </Link>
        </div>
      </main>

      <Footer />
      <style>{`@media (max-width: 540px) { .ins-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}