export const dynamic = 'force-dynamic'

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, ArrowLeft, Shield, Lock, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export default function OdemePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { accessToken } = useAuthStore()

  const [order, setOrder] = useState<any>(null)
  const [checkoutForm, setCheckoutForm] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    if (!accessToken) { router.push('/giris'); return }
    if (!orderId) { router.push('/dashboard'); return }
    fetchOrder()
  }, [accessToken, orderId])

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`)
      if (res.data.success) {
        setOrder(res.data.data)
        if (res.data.data.isPaid) {
          toast.success('Bu sipariş zaten ödendi')
          router.push('/dashboard')
        }
      }
    } catch {
      toast.error('Sipariş bulunamadı')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const initializePayment = async () => {
    setIsInitializing(true)
    try {
      const res = await api.post('/payments/initialize', { orderId })
      if (res.data.success) {
        setCheckoutForm(res.data.data.checkoutFormContent)
        // iyzico form'u DOM'a enjekte et
        setTimeout(() => {
          const script = document.createElement('script')
          script.src = 'https://sandbox-static.iyzipay.com/checkoutform/v2/bundle.js?random=' + new Date().getTime()
          document.head.appendChild(script)
        }, 100)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ödeme başlatılamadı')
    } finally {
      setIsInitializing(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="#c8860a" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'none', display: 'flex', padding: 6 }}>
            <ArrowLeft size={20} />
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#1c0800" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff' }}>
              PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
            </span>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.50)', fontSize: '0.82rem' }}>
          <Lock size={14} />
          Güvenli Ödeme
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c0800', marginBottom: 24, fontFamily: "'Barlow', sans-serif" }}>
          Ödeme
        </h1>

        {order && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }} className="order-grid">

            {/* Sipariş özeti */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px', gridColumn: '1 / -1' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c0800', marginBottom: 16, fontFamily: "'Barlow', sans-serif" }}>
                Sipariş Özeti
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Takip Kodu', value: order.trackingCode },
                  { label: 'Alım Adresi', value: order.senderAddress },
                  { label: 'Teslimat Adresi', value: order.recipientAddress },
                  { label: 'Alıcı', value: `${order.recipientName} — ${order.recipientPhone}` },
                  { label: 'Teslimat Tipi', value: order.deliveryType === 'EXPRESS' ? 'Ekspres' : order.deliveryType === 'SAME_DAY' ? 'Aynı Gün' : 'Planlanmış' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: '0.875rem' }}>
                    <span style={{ color: '#a89080', flexShrink: 0 }}>{item.label}</span>
                    <span style={{ color: '#1c0800', fontWeight: 500, textAlign: 'right' }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(28,8,0,0.08)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1c0800' }}>Toplam</span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#c8860a' }}>
                    {formatCurrency(order.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* İyzico ödeme formu */}
        {!checkoutForm ? (
          <div>
            {/* Güvenlik bilgisi */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: '14px 18px', background: '#f0fdf4', borderRadius: 10, border: '1px solid rgba(22,163,74,0.15)' }}>
              <Shield size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.6 }}>
                Ödemeniz 256-bit SSL şifreleme ile güvence altında. Kart bilgileriniz sistemimizde saklanmaz.
              </p>
            </div>

            <button
              onClick={initializePayment}
              disabled={isInitializing}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '16px 32px', background: '#c8860a', color: '#1c0800',
                border: 'none', borderRadius: 10, cursor: isInitializing ? 'not-allowed' : 'pointer',
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1rem',
                opacity: isInitializing ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(200,134,10,0.35)',
              }}
            >
              {isInitializing
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Ödeme Hazırlanıyor...</>
                : <><Lock size={18} /> Ödemeye Geç — {order && formatCurrency(order.price)}</>
              }
            </button>
          </div>
        ) : (
          <div>
            <div
              dangerouslySetInnerHTML={{ __html: checkoutForm }}
              style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}
            />
          </div>
        )}

      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 500px) {
          .order-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}