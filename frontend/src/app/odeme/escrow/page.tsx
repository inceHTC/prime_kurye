'use client'

import { useEffect, useState, Suspense } from 'react' // Suspense eklendi
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Shield, Loader2, CheckCircle, Bike } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

// Mevcut tüm kodun buraya taşındı
function EscrowOdemeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const { accessToken } = useAuthStore()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    if (!accessToken) { router.push('/giris'); return }
    if (!orderId) { router.push('/dashboard'); return }
    fetchOrder()
  }, [accessToken, orderId])

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`)
      if (res.data.success) setOrder(res.data.data)
    } catch {
      toast.error('Sipariş bulunamadı')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePay = async () => {
    setIsPaying(true)
    try {
      const res = await api.post('/escrow/initiate', { orderId })
      if (res.data.success) {
        toast.success('Ödeme alındı! Kurye yola çıktı.')
        router.push(`/takip/${order.trackingCode}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ödeme başarısız')
    } finally {
      setIsPaying(false)
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
    <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Barlow', sans-serif" }}>

      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 36, height: 36, background: '#c8860a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="#1c0800" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: '#1c0800' }}>
          PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
        </span>
      </Link>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 32px', maxWidth: 480, width: '100%', boxShadow: '0 4px 20px rgba(28,8,0,0.08)' }}>

        {/* Kurye ikonu */}
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Bike size={36} color="#c8860a" />
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c0800', marginBottom: 8, textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif" }}>
          Kurye Paketi Aldı!
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#7a6050', textAlign: 'center', lineHeight: 1.65, marginBottom: 28 }}>
          Motokuryeniz paketi teslim aldı ve yola çıkmaya hazır. Ödemenizi yaparak teslimatı başlatın.
        </p>

        {/* Sipariş özeti */}
        {order && (
          <div style={{ background: '#faf9f7', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Takip Kodu', value: order.trackingCode },
                { label: 'Alıcı', value: order.recipientName },
                { label: 'Teslimat Adresi', value: order.recipientAddress },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '0.875rem' }}>
                  <span style={{ color: '#a89080' }}>{item.label}</span>
                  <span style={{ color: '#1c0800', fontWeight: 500, textAlign: 'right', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(28,8,0,0.08)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#1c0800' }}>Ödenecek Tutar</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#c8860a', lineHeight: 1 }}>
                  {formatCurrency(order.price)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Güvenlik notu */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, marginBottom: 24, border: '1px solid rgba(22,163,74,0.15)' }}>
          <Shield size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.6 }}>
            Ödemeniz güvende. Para, teslimat onaylanana kadar sistemde tutulur. Sorun olursa iade edilir.
          </p>
        </div>

        {/* Ödeme butonu */}
        <button
          onClick={handlePay}
          disabled={isPaying}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '15px 24px', background: '#c8860a', color: '#1c0800',
            border: 'none', borderRadius: 10, cursor: isPaying ? 'not-allowed' : 'pointer',
            fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1rem',
            opacity: isPaying ? 0.7 : 1, boxShadow: '0 4px 16px rgba(200,134,10,0.30)',
          }}
        >
          {isPaying
            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> İşleniyor...</>
            : <><CheckCircle size={18} /> Ödemeyi Onayla — {order && formatCurrency(order.price)}</>
          }
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Ana Export sarmalayıcısı
export default function EscrowOdemePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #c8860a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <EscrowOdemeContent />
    </Suspense>
  )
}