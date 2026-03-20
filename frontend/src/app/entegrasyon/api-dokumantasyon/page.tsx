'use client'

import Link from 'next/link'
import { ArrowLeft, BriefcaseBusiness, ShieldCheck } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ApiDokumantasyonBilgiPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <main style={{ padding: '72px 20px 96px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Link
            href="/entegrasyon"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              color: '#7a6050',
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            <ArrowLeft size={16} />
            Entegrasyon sayfasına dön
          </Link>

          <section
            style={{
              background: '#fff',
              borderRadius: 20,
              border: '1px solid rgba(28,8,0,0.08)',
              boxShadow: '0 20px 50px rgba(28,8,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <div style={{ background: '#1c0800', padding: '28px 28px 24px' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(200,134,10,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <BriefcaseBusiness size={24} color="#c8860a" />
              </div>
              <p style={{ margin: 0, color: '#c8860a', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Kurumsal Erişim Bilgilendirmesi
              </p>
              <h1 style={{ margin: '12px 0 0', color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05 }}>
                API dokümantasyonu kurumsal müşterilerimiz içindir.
              </h1>
            </div>

            <div style={{ padding: 28 }}>
              <p style={{ margin: '0 0 18px', color: '#4a3020', fontSize: '1rem', lineHeight: 1.8 }}>
                Prime Kurye API erişimi ve detaylı teknik dokümantasyon, aktif kurumsal müşteri hesabı bulunan iş ortaklarımızla paylaşılmaktadır.
                Bu yapı; güvenlik, operasyonel doğrulama ve entegrasyon desteğinin sağlıklı yürütülmesi için uygulanır.
              </p>

              <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
                {[
                  'API anahtarı ve erişim bilgileri, onaylı kurumsal hesaplara özel olarak iletilir.',
                  'Entegrasyon sürecinde teknik ekip desteği ve test ortamı yönlendirmesi sağlanır.',
                  'Kurumsal başvuru süreci tamamlandıktan sonra dokümantasyon erişimi açılır.',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 14, background: '#f8f3eb', border: '1px solid rgba(28,8,0,0.06)' }}>
                    <ShieldCheck size={18} color="#c8860a" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0, color: '#5f4637', lineHeight: 1.7, fontSize: '0.94rem' }}>{item}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link
                  href="/iletisim"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '13px 20px',
                    background: '#c8860a',
                    color: '#1c0800',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 700,
                  }}
                >
                  Kurumsal başvuru için iletişime geçin
                </Link>

                <Link
                  href="/entegrasyon"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '13px 20px',
                    background: '#fff',
                    color: '#1c0800',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 700,
                    border: '1px solid rgba(28,8,0,0.12)',
                  }}
                >
                  Entegrasyon sayfasına dön
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
