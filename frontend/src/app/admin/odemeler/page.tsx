'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, ArrowLeft, TrendingUp, Users, DollarSign, RefreshCw, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminOdemelerPage() {
  const router = useRouter()
  const { user, accessToken } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) { router.push('/giris'); return }
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return }
    fetchPayouts()
  }, [accessToken])

  const fetchPayouts = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/escrow/admin/payouts')
      if (res.data.success) setData(res.data.data)
    } catch {
      toast.error('Ödeme listesi yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculate = async () => {
    setIsCalculating(true)
    try {
      const res = await api.post('/escrow/admin/calculate')
      if (res.data.success) {
        toast.success(`${res.data.data.payouts.length} ödeme hesaplandı!`)
        fetchPayouts()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hesaplama başarısız')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleComplete = async (payoutId: string, courierName: string) => {
    setCompletingId(payoutId)
    try {
      const res = await api.patch(`/escrow/admin/payouts/${payoutId}/complete`, {
        note: 'Manuel ödeme tamamlandı'
      })
      if (res.data.success) {
        toast.success(`${courierName} ödemesi tamamlandı!`)
        fetchPayouts()
      }
    } catch {
      toast.error('İşlem başarısız')
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 40 }}>
        <Link href="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', padding: 6 }}>
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
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginLeft: 4 }}>Ödeme Yönetimi</span>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Üst başlık */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1c0800' }}>Kurye Ödemeleri</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={fetchPayouts} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#fff', border: '1px solid rgba(28,8,0,0.12)', borderRadius: 8, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: '#4a3020' }}>
              <RefreshCw size={14} /> Yenile
            </button>
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#c8860a', color: '#1c0800', border: 'none', borderRadius: 8, cursor: isCalculating ? 'not-allowed' : 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.85rem', opacity: isCalculating ? 0.7 : 1 }}
            >
              {isCalculating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <TrendingUp size={14} />}
              Haftalık Hesapla
            </button>
          </div>
        </div>

        {/* Özet */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Bekleyen Ödeme', value: formatCurrency(data.totalPending || 0), icon: DollarSign, color: '#c8860a', bg: '#fef8ed' },
              { label: 'Toplam Komisyon', value: formatCurrency(data.totalCommission || 0), icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Toplam Vergi', value: formatCurrency(data.totalTax || 0), icon: DollarSign, color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Kurye Sayısı', value: `${data.payouts?.filter((p: any) => p.status === 'PENDING').length || 0} bekliyor`, icon: Users, color: '#1d4ed8', bg: '#eff6ff' },
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
        )}

        {/* Ödeme listesi */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800' }}>Ödeme Listesi</h2>
          </div>

          {isLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#a89080' }}>
              <Loader2 size={24} style={{ margin: '0 auto 8px', display: 'block', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '0.875rem' }}>Yükleniyor...</p>
            </div>
          ) : !data?.payouts?.length ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#a89080', fontSize: '0.875rem' }}>
              Henüz ödeme yok. "Haftalık Hesapla" butonuna tıklayın.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
                <thead>
                  <tr style={{ background: '#faf9f7', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
                    {['Kurye', 'Hafta', 'Brüt', 'Komisyon', 'Vergi', 'Net', 'Durum', 'İşlem'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#a89080' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.payouts.map((payout: any) => (
                    <tr key={payout.id} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800' }}>{payout.courier?.user?.fullName}</p>
                        <p style={{ fontSize: '0.72rem', color: '#a89080', marginTop: 1 }}>{payout.courier?.user?.phone}</p>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#7a6050' }}>
                        {formatDate(payout.weekStart)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#1c0800' }}>
                        {formatCurrency(payout.amount)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#16a34a' }}>
                        {formatCurrency(payout.commission)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#7c3aed' }}>
                        {formatCurrency(payout.tax)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#c8860a', fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {formatCurrency(payout.netAmount)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 4,
                          fontSize: '0.72rem', fontWeight: 700,
                          background: payout.status === 'PAID' ? '#dcfce7' : '#fef9c3',
                          color: payout.status === 'PAID' ? '#166534' : '#854d0e',
                        }}>
                          {payout.status === 'PAID' ? 'Ödendi' : 'Bekliyor'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {payout.status === 'PENDING' && (
                          <button
                            onClick={() => handleComplete(payout.id, payout.courier?.user?.fullName)}
                            disabled={completingId === payout.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '7px 14px', background: '#1c0800', color: '#fff',
                              border: 'none', borderRadius: 6, cursor: 'pointer',
                              fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.78rem',
                              opacity: completingId === payout.id ? 0.6 : 1,
                            }}
                          >
                            {completingId === payout.id
                              ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                              : <CheckCircle size={12} />
                            }
                            Ödendi
                          </button>
                        )}
                        {payout.status === 'PAID' && (
                          <span style={{ fontSize: '0.75rem', color: '#a89080' }}>
                            {payout.paidAt ? formatDate(payout.paidAt) : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}