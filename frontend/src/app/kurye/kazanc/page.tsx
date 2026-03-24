'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, ArrowLeft, TrendingUp, Clock, CheckCircle, Loader2, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function KuryeKazancPage() {
  const router = useRouter()
  const { user, accessToken, _hasHydrated } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!accessToken) { router.push('/giris'); return }
    if (user?.role !== 'COURIER') { router.push('/dashboard'); return }
    fetchEarnings()
  }, [_hasHydrated, accessToken])

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/escrow/courier/earnings')
      if (res.data.success) setData(res.data.data)
    } catch {
      toast.error('Kazanç bilgisi yüklenemedi')
    } finally {
      setIsLoading(false)
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
      <header style={{ background: '#1c0800', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 40 }}>
        <Link href="/kurye" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', padding: 6 }}>
          <ArrowLeft size={20} />
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#1c0800" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff' }}>
            VIN<span style={{ color: '#c8860a' }}>KURYE</span>
          </span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginLeft: 4 }}>Kazançlarım</span>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Özet kartlar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Bu Hafta', value: formatCurrency(data?.weeklyEarnings || 0), icon: TrendingUp, color: '#c8860a', bg: '#fef8ed' },
            { label: 'Bekleyen Ödeme', value: formatCurrency(data?.pendingPayout || 0), icon: Clock, color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Toplam Kazanç', value: formatCurrency(data?.totalEarnings || 0), icon: Wallet, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Geçmiş Ödemeler', value: `${data?.recentPayouts?.length || 0} ödeme`, icon: CheckCircle, color: '#7c3aed', bg: '#f5f3ff' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontSize: '0.78rem', color: '#a89080', fontWeight: 500 }}>{stat.label}</p>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={stat.color} />
                  </div>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
                  {stat.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bekleyen ödeme uyarısı */}
        {data?.pendingPayout > 0 && (
          <div style={{ background: '#fef8ed', border: '1px solid rgba(200,134,10,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Wallet size={20} color="#c8860a" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800', marginBottom: 2 }}>
                {formatCurrency(data.pendingPayout)} ödeme bekliyor
              </p>
              <p style={{ fontSize: '0.8rem', color: '#a89080' }}>
                Her Pazartesi hesabınıza aktarılır
              </p>
            </div>
          </div>
        )}

        {/* Bu haftaki teslimatlar */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800' }}>Bu Haftaki Teslimatlar</h2>
          </div>
          {!data?.recentDeliveries?.length ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#a89080', fontSize: '0.875rem' }}>
              Bu hafta henüz teslimat yok
            </div>
          ) : (
            <div>
              {data.recentDeliveries.map((delivery: any) => (
                <div key={delivery.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800', marginBottom: 2 }}>{delivery.recipientName}</p>
                    <p style={{ fontSize: '0.75rem', color: '#a89080', fontFamily: 'monospace' }}>{delivery.trackingCode}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#16a34a' }}>
                      +{formatCurrency(delivery.courierAmount || 0)}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#a89080', marginTop: 1 }}>
                      {delivery.deliveredAt ? formatDate(delivery.deliveredAt) : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Geçmiş ödemeler */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800' }}>Geçmiş Ödemeler</h2>
          </div>
          {!data?.recentPayouts?.length ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#a89080', fontSize: '0.875rem' }}>
              Henüz ödeme yok
            </div>
          ) : (
            <div>
              {data.recentPayouts.map((payout: any) => (
                <div key={payout.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800', marginBottom: 2 }}>
                      Haftalık Ödeme
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#a89080' }}>
                      {formatDate(payout.weekStart)} — {formatDate(payout.weekEnd)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800' }}>
                      {formatCurrency(payout.netAmount)}
                    </p>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: payout.status === 'PAID' ? '#dcfce7' : '#fef9c3',
                      color: payout.status === 'PAID' ? '#166534' : '#854d0e',
                    }}>
                      {payout.status === 'PAID' ? 'Ödendi' : 'Bekliyor'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}