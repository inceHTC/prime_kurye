'use client'

import Link from 'next/link'
import { Search, Package, CreditCard, Bike, Phone, ChevronRight, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const categories = [
  { icon: Package, label: 'Sipariş', href: '/sss#siparis', desc: 'Sipariş oluşturma, iptal, değişiklik' },
  { icon: CreditCard, label: 'Ödeme', href: '/sss#odeme', desc: 'Fiyatlar, ödeme yöntemleri, iade' },
  { icon: Bike, label: 'Teslimat', href: '/sss#takip', desc: 'Takip, süre, sorunlar' },
  { icon: HelpCircle, label: 'Hesap', href: '/sss#genel', desc: 'Kayıt, giriş, profil' },
]

export default function YardimPage() {
  const [search, setSearch] = useState('')

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <div style={{ background: '#1c0800', padding: '56px 24px 64px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#fff', marginBottom: 16 }}>
          Yardım Merkezi
        </h1>
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <Search size={18} color="#a89080" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sorunuzu yazın..."
            style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: 10, border: 'none', outline: 'none', fontFamily: "'Barlow', sans-serif", fontSize: '0.95rem', background: '#fff', color: '#1c0800', boxSizing: 'border-box' }}
          />
        </div>
        {search && (
          <div style={{ marginTop: 12 }}>
            <Link href={`/sss`} style={{ fontSize: '0.875rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
              SSS sayfasında ara → "{search}"
            </Link>
          </div>
        )}
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>

        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: '#1c0800', marginBottom: 20 }}>
          Konular
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 48 }}>
          {categories.map(c => {
            const Icon = c.icon
            return (
              <Link key={c.label} href={c.href} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,134,10,0.30)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,8,0,0.08)' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#c8860a" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800', marginBottom: 2 }}>{c.label}</p>
                  <p style={{ fontSize: '0.78rem', color: '#a89080' }}>{c.desc}</p>
                </div>
                <ChevronRight size={14} color="#a89080" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </Link>
            )
          })}
        </div>

        {/* Hızlı çözümler */}
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: '#1c0800', marginBottom: 20 }}>
          Hızlı Çözümler
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
          {[
            { q: 'Siparişimi nasıl iptal ederim?', a: 'Dashboard\'unuza giriş yapın, sipariş listesinden ilgili siparişin yanındaki "İptal et" butonuna tıklayın. Kurye paketi almadan önce iptal yapılabilir.', href: '/dashboard' },
            { q: 'Takip kodum nerede?', a: 'Sipariş oluşturduktan sonra ekranda gösterilir. Dashboard\'unuzdan da ulaşabilirsiniz.', href: '/dashboard' },
            { q: 'Ödeme iade süresi ne kadar?', a: 'İptal işlemlerinde ödeme 3-5 iş günü içinde kartınıza iade edilir.', href: '/sss' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '18px 20px' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800', marginBottom: 8 }}>❓ {item.q}</p>
              <p style={{ fontSize: '0.85rem', color: '#7a6050', lineHeight: 1.65, marginBottom: 10 }}>{item.a}</p>
              <Link href={item.href} style={{ fontSize: '0.78rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
                Daha fazla bilgi →
              </Link>
            </div>
          ))}
        </div>

        {/* Destek */}
        <div style={{ background: '#1c0800', borderRadius: 14, padding: '28px 32px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>
            Hala yardıma mı ihtiyacınız var?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.50)', marginBottom: 20 }}>
            Destek ekibimiz size yardımcı olmaktan mutluluk duyar
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/iletisim" style={{ padding: '11px 22px', background: '#c8860a', color: '#1c0800', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
              İletişime Geç
            </Link>
            <Link href="/sss" style={{ padding: '11px 22px', background: 'rgba(255,255,255,0.10)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              SSS'e Git
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}