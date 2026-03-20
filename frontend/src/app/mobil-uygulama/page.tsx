import Link from 'next/link'
import { Smartphone, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function MobileAppPage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: 'calc(100vh - 140px)',
          background: '#1c0800',
          padding: '48px 20px 80px',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <section
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 28,
              padding: '44px 32px',
              color: '#fff',
              textAlign: 'center',
              boxShadow: '0 30px 80px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 24,
                background: 'rgba(200,134,10,0.18)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(200,134,10,0.35)',
              }}
            >
              <Smartphone size={34} color="#fdbd4a" />
            </div>

            <p style={{ color: '#c8860a', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Mobil Uygulama
            </p>

            <h1 style={{ color: '#fff', fontSize: 'clamp(1.3rem, 6vw, 2.5rem)', marginBottom: 16 }}>
              Mobil uygulamamız çok yakında yayında
            </h1>

            <p style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 36, color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.7 }}>
              iOS ve Android uygulamalarımız test sürecinin hemen ardından mağaza sayfalarında yerini alacak.
              Bu sırada tüm siparişlerinizi web üzerinden oluşturmaya devam edebilirsiniz.
            </p>
          </section>

          <section
            style={{
              marginTop: 24,
              background: '#fff',
              borderRadius: 24,
              padding: '28px 24px',
              border: '1px solid rgba(28,8,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>
                Beklerken webden devam edin
              </h2>
              <p style={{ color: '#7a6050' }}>
                Fiyat hesaplayabilir, manuel adresle sipariş oluşturabilir ve ödeme adımına geçebilirsiniz.
              </p>
            </div>

            <Link href="/hesapla" className="btn-primary">
              Fiyat Hesapla
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}