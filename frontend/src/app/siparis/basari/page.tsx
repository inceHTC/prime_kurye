

'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Copy, ArrowRight, Zap } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SiparisBasariPage() {
  const searchParams = useSearchParams()
  const trackingCode = searchParams.get('code') || ''
  const orderId = searchParams.get('orderId') || ''
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingCode)
    setCopied(true)
    toast.success('Takip kodu kopyalandı!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Barlow', sans-serif" }}>

      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 36, height: 36, background: '#c8860a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="#1c0800" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: '#1c0800' }}>
          PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
        </span>
      </Link>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 32px', maxWidth: 480, width: '100%', boxShadow: '0 4px 20px rgba(28,8,0,0.08)', textAlign: 'center' }}>

        {/* Başarı ikonu */}
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} color="#16a34a" />
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c0800', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
          Sipariş Oluşturuldu!
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#7a6050', marginBottom: 32, lineHeight: 1.65 }}>
          Siparişiniz alındı. En yakın motokurye atanıyor, kısa sürede yola çıkacak.
        </p>

        {/* Takip kodu */}
        <div style={{ background: '#fef8ed', borderRadius: 12, padding: '20px 24px', marginBottom: 28, border: '1px solid rgba(200,134,10,0.20)' }}>
          <p style={{ fontSize: '0.78rem', color: '#a89080', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Takip Kodunuz
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 800, color: '#c8860a', letterSpacing: '0.1em' }}>
              {trackingCode}
            </span>
            <button
              onClick={handleCopy}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#16a34a' : '#a89080', padding: 4 }}
            >
              <Copy size={18} />
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#a89080', marginTop: 8 }}>
            Bu kodu saklayın, gönderinizi takip etmek için kullanacaksınız
          </p>
        </div>

        {/* Butonlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href={`/takip/${trackingCode}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 24px', background: '#c8860a', color: '#1c0800',
              borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            }}
          >
            Siparişi Takip Et <ArrowRight size={16} />
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 24px', background: '#f5f3ef', color: '#4a3020',
              borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            Dashboard'a Dön
          </Link>
        </div>
      </div>
    </div>
  )
}