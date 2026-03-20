

'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react'
import api from '@/lib/api'

export default function OdemeSonucPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!token) { router.push('/dashboard'); return }
    checkResult()
  }, [token])

  const checkResult = async () => {
    try {
      const res = await api.post('/payments/result', { token })
      if (res.data.success) {
        setStatus('success')
        setData(res.data.data)
      } else {
        setStatus('failed')
      }
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, background: '#c8860a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#1c0800" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: '#1c0800' }}>
            PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
          </span>
        </Link>

        {status === 'loading' && (
          <div>
            <Loader2 size={48} color="#c8860a" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: '1rem', color: '#4a3020', fontWeight: 500 }}>Ödeme sonucu kontrol ediliyor...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 32px', boxShadow: '0 4px 20px rgba(28,8,0,0.08)' }}>
            <div style={{ width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={36} color="#16a34a" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
              Ödeme Başarılı!
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#7a6050', marginBottom: 28, lineHeight: 1.65 }}>
              Ödemeniz alındı. Siparişiniz onaylandı ve en yakın motokurye atanıyor.
            </p>
            {data?.paidPrice && (
              <div style={{ background: '#fef8ed', borderRadius: 10, padding: '16px 20px', marginBottom: 28 }}>
                <p style={{ fontSize: '0.82rem', color: '#a89080', marginBottom: 4 }}>Ödenen tutar</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#c8860a', lineHeight: 1 }}>
                  {parseFloat(data.paidPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link href="/dashboard" style={{
                padding: '12px 24px', background: '#c8860a', color: '#1c0800',
                borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
              }}>
                Siparişleri Görüntüle
              </Link>
              {data?.orderId && (
                <Link href={`/takip/${data.orderId}`} style={{
                  padding: '12px 24px', background: '#f5f3ef', color: '#1c0800',
                  borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                }}>
                  Takip Et
                </Link>
              )}
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 32px', boxShadow: '0 4px 20px rgba(28,8,0,0.08)' }}>
            <div style={{ width: 72, height: 72, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <XCircle size={36} color="#dc2626" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
              Ödeme Başarısız
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#7a6050', marginBottom: 28, lineHeight: 1.65 }}>
              Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin veya farklı bir kart kullanın.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => router.back()} style={{
                padding: '12px 24px', background: '#c8860a', color: '#1c0800',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.9rem',
              }}>
                Tekrar Dene
              </button>
              <Link href="/dashboard" style={{
                padding: '12px 24px', background: '#f5f3ef', color: '#1c0800',
                borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              }}>
                Dashboard'a Dön
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}