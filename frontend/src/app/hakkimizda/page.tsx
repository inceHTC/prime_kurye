'use client'

import Link from 'next/link'
import { Target, Heart, Shield, TrendingUp, Bike, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const values = [
  { icon: Target, title: 'Hız', desc: 'Her dakika önemli. Ortalama 60-90 dakikada teslim etmeyi taahhüt ediyoruz.' },
  { icon: Shield, title: 'Güvenilirlik', desc: '%99.9 teslimat başarı oranı ile İstanbul\'un en güvenilir kurye platformuyuz.' },
  { icon: Heart, title: 'Müşteri Odaklılık', desc: 'Her kararımızda müşteri memnuniyetini merkeze alıyoruz.' },
  { icon: TrendingUp, title: 'Şeffaflık', desc: 'Fiyatlandırma, takip ve ödeme süreçlerinde tam şeffaflık.' },
]

const stats = [
  { value: '1.000+', label: 'Aktif Motokurye' },
  { value: '5.000+', label: 'Mutlu İşletme' },
  { value: '%99.9', label: 'Teslimat Başarısı' },
  { value: '39', label: 'İlçede Hizmet' },
]

export default function HakkimizdaPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <div style={{ background: '#1c0800', padding: '72px 24px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', marginBottom: 20, lineHeight: 1.1 }}>
            İstanbul'un En Hızlı<br />
            <span style={{ color: '#c8860a' }}>Motokurye Platformu</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto' }}>
            2024 yılında kurulan Prime Kurye, bireylerin ve işletmelerin paketlerini güvenli, hızlı ve şeffaf bir şekilde ulaştırma misyonuyla yola çıktı.
          </p>
        </div>
      </div>

      <div style={{ background: '#c8860a', padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="stats-grid">
          {stats.map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#1c0800', lineHeight: 1, marginBottom: 4 }}>{stat.value}</p>
              <p style={{ fontSize: '0.82rem', color: 'rgba(28,8,0,0.65)', fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 80px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 72, alignItems: 'center' }} className="story-grid">
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#1c0800', marginBottom: 16 }}>Hikayemiz</h2>
            <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.85, marginBottom: 14 }}>
              İstanbul'da her gün milyonlarca paket taşınıyor. Ama pek çok kişi güvenilir, hızlı ve şeffaf bir kurye hizmetine ulaşmakta zorlanıyordu. Biz bu sorunu çözmek için Prime Kurye'yi kurduk.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.85, marginBottom: 14 }}>
              Gerçek zamanlı takip, güvenli escrow ödeme sistemi ve kaliteli motokuryelerden oluşan ağımızla sektörde fark yaratıyoruz.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.85 }}>
              Bugün İstanbul'un 39 ilçesinde 1.000'den fazla aktif motokuryemizle her gün binlerce teslimat gerçekleştiriyoruz.
            </p>
          </div>
          <div style={{ background: '#1c0800', borderRadius: 16, padding: '36px 28px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(200,134,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Bike size={28} color="#c8860a" />
            </div>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#fff', marginBottom: 12 }}>Misyonumuz</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.60)', lineHeight: 1.75 }}>
              İstanbul'daki her bireyin ve işletmenin paketlerini güvenli, hızlı ve şeffaf bir şekilde ulaştırmak. Hem müşterilerimizi hem de kuryelerimizi değer gören bir platform olmak.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#1c0800', textAlign: 'center', marginBottom: 40 }}>Değerlerimiz</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {values.map(v => {
              const Icon = v.icon
              return (
                <div key={v.title} style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px 22px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon size={22} color="#c8860a" />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800', marginBottom: 8 }}>{v.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#7a6050', lineHeight: 1.65 }}>{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: '#1c0800', borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#fff', marginBottom: 12 }}>Ekibimize Katılmak İster misiniz?</h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', marginBottom: 24 }}>Motokurye olarak çalışmak veya ofis pozisyonları için başvurabilirsiniz.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/kurye-ol" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: '#c8860a', color: '#1c0800', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              Kurye Ol <ChevronRight size={16} />
            </Link>
            <Link href="/iletisim" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: 'rgba(255,255,255,0.10)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              İletişime Geç
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .story-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}