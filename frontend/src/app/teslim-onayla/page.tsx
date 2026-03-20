export const dynamic = 'force-dynamic'

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, CheckCircle, Loader2, Star, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function TeslimOnayPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const { accessToken } = useAuthStore()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [rating, setRating] = useState(5)

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

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      const res = await api.post('/escrow/confirm', { orderId, rating })
      if (res.data.success) {
        setConfirmed(true)
        toast.success('Teslimat onaylandı!')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Onay başarısız')
    } finally {
      setIsConfirming(false)
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

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 32px', maxWidth: 480, width: '100%', boxShadow: '0 4px 20px rgba(28,8,0,0.08)', textAlign: 'center' }}>

        {confirmed ? (
          // Onay sonrası
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={40} color="#16a34a" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c0800', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
              Teslimat Onaylandı!
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#7a6050', marginBottom: 32, lineHeight: 1.65 }}>
              Teşekkürler! Ödeme kuryeye aktarıldı. Değerlendirmeniz için teşekkür ederiz.
            </p>
            <Link href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 28px', background: '#c8860a', color: '#1c0800',
              borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            }}>
              Dashboard'a Dön
            </Link>
          </>
        ) : (
          // Onay formu
          <>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Package size={36} color="#c8860a" />
            </div>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c0800', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
              Paketi Teslim Aldınız mı?
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#7a6050', marginBottom: 28, lineHeight: 1.65 }}>
              Paketi eksiksiz teslim aldıysanız onaylayın. Ödeme kuryeye aktarılacak.
            </p>

            {/* Sipariş bilgisi */}
            {order && (
              <div style={{ background: '#faf9f7', borderRadius: 10, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                  <span style={{ color: '#a89080' }}>Takip Kodu</span>
                  <span style={{ color: '#1c0800', fontWeight: 600, fontFamily: 'monospace' }}>{order.trackingCode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#a89080' }}>Kurye</span>
                  <span style={{ color: '#1c0800', fontWeight: 600 }}>{order.courier?.user?.fullName || '—'}</span>
                </div>
              </div>
            )}

            {/* Yıldız puanı */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: '0.875rem', color: '#4a3020', fontWeight: 600, marginBottom: 12 }}>
                Kurye Değerlendirmesi
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '2rem', lineHeight: 1,
                      color: star <= rating ? '#c8860a' : '#e4e0d8',
                      transition: 'color 0.15s',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/dashboard" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '13px 0', background: '#f5f3ef', color: '#4a3020',
                borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              }}>
                Sonra
              </Link>
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                style={{
                  flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 0', background: '#c8860a', color: '#1c0800',
                  border: 'none', borderRadius: 8, cursor: isConfirming ? 'not-allowed' : 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                  opacity: isConfirming ? 0.7 : 1,
                }}
              >
                {isConfirming
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Onaylanıyor...</>
                  : <><CheckCircle size={16} /> Evet, Teslim Aldım</>
                }
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}