'use client'

import Link from 'next/link'
import { Code2, Zap, Shield, Clock, ChevronRight, ExternalLink } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const docsNoticeHref = '/entegrasyon/api-dokumantasyon'

const features = [
  {
    icon: Zap,
    title: 'Hızlı Entegrasyon',
    desc: 'REST API ile dakikalar içinde entegre olun. Kapsamlı dokümantasyon ve örnek kodlar hazır.',
  },
  {
    icon: Shield,
    title: 'Güvenli',
    desc: 'JWT kimlik doğrulama ve HTTPS şifreleme ile güvenli veri iletimi sağlanır.',
  },
  {
    icon: Clock,
    title: 'Gerçek Zamanlı',
    desc: 'Webhook desteği ile sipariş durum güncellemelerini anında sisteminize alın.',
  },
  {
    icon: Code2,
    title: 'Esnek',
    desc: 'JSON tabanlı API yapısı farklı yazılım dilleri ve platformlarla uyumludur.',
  },
]

const codeExample = `// Sipariş oluştur
const response = await fetch('https://api.primekurye.com/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    senderName: 'Ahmet Yılmaz',
    senderPhone: '05001234567',
    senderAddress: 'Kadıköy, İstanbul',
    senderLat: 40.9907,
    senderLng: 29.0237,
    recipientName: 'Mehmet Demir',
    recipientPhone: '05009876543',
    recipientAddress: 'Beşiktaş, İstanbul',
    recipientLat: 41.0429,
    recipientLng: 29.0086,
    packageDesc: 'Belge',
    deliveryType: 'EXPRESS',
    vehicle: 'MOTORCYCLE'
  })
})

const order = await response.json()
console.log(order.data.trackingCode) // PK1A2B3C`

export default function EntegrasyonPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <div style={{ background: '#1c0800', padding: '72px 24px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(200,134,10,0.15)', borderRadius: 4, marginBottom: 20 }}>
            <Code2 size={14} color="#c8860a" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c8860a' }}>API Entegrasyonu</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', marginBottom: 20, lineHeight: 1.1 }}>
            Vın Kurye'yi
            <br />
            <span style={{ color: '#c8860a' }}>Sisteminize Entegre Edin</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 32px' }}>
            E-ticaret sitenize, muhasebe yazılımınıza veya özel operasyon panelinize REST API ile kurye hizmetimizi entegre edin.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={docsNoticeHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#c8860a', color: '#1c0800', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: '0.95rem' }}>
              API Dokümantasyonu <ExternalLink size={16} />
            </Link>
            <Link href="/iletisim" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', background: 'rgba(255,255,255,0.10)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
              Bize Ulaşın
            </Link>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 56 }}>
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '22px 20px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={18} color="#c8860a" />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800', marginBottom: 6 }}>{feature.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#7a6050', lineHeight: 1.65 }}>{feature.desc}</p>
              </div>
            )
          })}
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#1c0800', marginBottom: 20 }}>
            Örnek Kullanım
          </h2>
          <div style={{ background: '#1c0800', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.30)', marginLeft: 8 }}>JavaScript</span>
            </div>
            <pre style={{ margin: 0, padding: '20px', fontSize: '0.78rem', color: '#c8860a', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.7 }}>
              {codeExample}
            </pre>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#1c0800', marginBottom: 20 }}>
            3 Adımda Başlayın
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { num: '1', title: 'Hesap Oluşturun', desc: 'İşletme hesabı açın ve API erişimi için bizimle iletişime geçin.', href: '/kayit', btn: 'Kayıt Ol' },
              { num: '2', title: 'Dokümantasyonu İnceleyin', desc: 'API erişimi kurumsal müşterilerimize özel olarak paylaşılır.', href: docsNoticeHref, btn: 'Bilgilendirme' },
              { num: '3', title: 'Entegre Edin', desc: 'Teknik ekibinizle birlikte canlı ortam kurulumunu tamamlayın.', href: '/iletisim', btn: 'Destek Al' },
            ].map((step) => (
              <div key={step.num} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#c8860a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#1c0800' }}>{step.num}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800', marginBottom: 4 }}>{step.title}</p>
                  <p style={{ fontSize: '0.85rem', color: '#7a6050' }}>{step.desc}</p>
                </div>
                <Link href={step.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fef8ed', color: '#c8860a', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
                  {step.btn} <ChevronRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
