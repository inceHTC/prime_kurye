'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, ArrowLeft, TrendingUp, Package, CheckCircle,
  XCircle, Clock, DollarSign, RefreshCw, Loader2,
  BarChart2, MapPin, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const PERIODS = [
  { label: 'Son 7 Gün', value: '7' },
  { label: 'Son 30 Gün', value: '30' },
  { label: 'Son 90 Gün', value: '90' },
]

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  PICKING_UP: 'Kurye Yolda',
  IN_TRANSIT: 'Teslimatta',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal',
  FAILED: 'Başarısız',
}

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  EXPRESS: 'Ekspres',
  SAME_DAY: 'Aynı Gün',
  SCHEDULED: 'Planlanmış',
}

export default function RaporlarPage() {
  const router = useRouter()
  const { user, accessToken } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    if (!accessToken) { router.push('/giris'); return }
    fetchReport()
  }, [accessToken, period])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/reports/business?period=${period}`)
      if (res.data.success) setData(res.data.data)
    } catch {
      toast.error('Rapor yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const maxDailyOrders = data?.dailyStats?.length
    ? Math.max(...data.dailyStats.map((d: any) => d.orders), 1)
    : 1

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 40 }}>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', padding: 6 }}>
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
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>· Raporlar</span>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Başlık + filtre */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1c0800' }}>Sipariş Raporları</h1>
          <div style={{ display: 'flex', gap: 6 }}>
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                style={{
                  padding: '8px 16px', borderRadius: 8, 
                  border: 'none',
                  cursor: 'pointer', fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600, fontSize: '0.82rem',
                  background: period === p.value ? '#1c0800' : '#fff',
                  color: period === p.value ? '#fff' : '#4a3020',
                  transition: 'all 0.15s',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
            <Loader2 size={32} color="#c8860a" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : data && (
          <>
            {/* Özet kartlar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Toplam Sipariş', value: data.summary.totalOrders, icon: Package, color: '#c8860a', bg: '#fef8ed' },
                { label: 'Teslim Edildi', value: data.summary.deliveredOrders, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
                { label: 'İptal Edildi', value: data.summary.cancelledOrders, icon: XCircle, color: '#dc2626', bg: '#fee2e2' },
                { label: 'Aktif', value: data.summary.activeOrders, icon: Clock, color: '#1d4ed8', bg: '#eff6ff' },
                { label: 'Toplam Harcama', value: formatCurrency(data.summary.totalSpent), icon: DollarSign, color: '#7c3aed', bg: '#f5f3ff' },
                { label: 'Ortalama Sipariş', value: formatCurrency(data.summary.avgOrderValue), icon: TrendingUp, color: '#c8860a', bg: '#fef8ed' },
                { label: 'Başarı Oranı', value: `%${data.summary.successRate}`, icon: BarChart2, color: '#16a34a', bg: '#f0fdf4' },
              ].map(stat => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '16px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <p style={{ fontSize: '0.72rem', color: '#a89080', fontWeight: 500 }}>{stat.label}</p>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={13} color={stat.color} />
                      </div>
                    </div>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
                      {stat.value}
                    </p>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="report-grid">

              {/* Günlük sipariş grafiği */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} color="#c8860a" /> Günlük Sipariş
                </h2>
                {data.dailyStats.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: '#a89080', textAlign: 'center', padding: '20px 0' }}>Veri yok</p>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
                    {data.dailyStats.slice(-14).map((day: any) => (
                      <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: '100%', borderRadius: 4,
                          background: day.orders > 0 ? '#c8860a' : 'rgba(28,8,0,0.08)',
                          height: `${Math.max((day.orders / maxDailyOrders) * 100, 4)}px`,
                          minHeight: 4,
                          transition: 'height 0.3s',
                        }} title={`${day.date}: ${day.orders} sipariş`} />
                        <p style={{ fontSize: '0.55rem', color: '#a89080', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                          {day.date.slice(5)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Teslimat tipi dağılımı */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Package size={15} color="#c8860a" /> Teslimat Tipi
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(data.deliveryTypeStats).map(([type, count]: [string, any]) => {
                    const total = Object.values(data.deliveryTypeStats).reduce((a: any, b: any) => a + b, 0) as number
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: '#4a3020' }}>{DELIVERY_TYPE_LABELS[type]}</span>
                          <span style={{ color: '#a89080' }}>{count} sipariş ({pct}%)</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: '#f5f3ef', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 4, background: '#c8860a', width: `${pct}%`, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Durum dağılımı */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BarChart2 size={15} color="#c8860a" /> Durum Dağılımı
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(data.statusStats)
                    .filter(([_, count]: any) => count > 0)
                    .map(([status, count]: [string, any]) => (
                      <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#4a3020', fontWeight: 500 }}>{STATUS_LABELS[status]}</span>
                        <span style={{ fontWeight: 700, color: '#1c0800', background: '#f5f3ef', padding: '2px 10px', borderRadius: 4 }}>{count}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* En çok teslimat yapılan adresler */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} color="#c8860a" /> Sık Teslimat Noktaları
                </h2>
                {data.topAddresses.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: '#a89080' }}>Veri yok</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.topAddresses.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c8860a' }}>{i + 1}</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#4a3020', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.address}
                        </p>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a89080', flexShrink: 0 }}>{item.count}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Son siparişler tablosu */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800' }}>Son Siparişler</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
                  <thead>
                    <tr style={{ background: '#faf9f7', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
                      {['TAKİP KODU', 'ALICI', 'TESLİMAT TİPİ', 'DURUM', 'TUTAR', 'TARİH'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#a89080' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order: any) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <Link href={`/takip/${order.trackingCode}`} style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
                            {order.trackingCode}
                          </Link>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#1c0800', fontWeight: 500 }}>{order.recipientName}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#7a6050' }}>{DELIVERY_TYPE_LABELS[order.deliveryType]}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, ...getStatusStyle(order.status) }}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 700, color: '#1c0800' }}>
                          {formatCurrency(order.price)}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#a89080' }}>
                          {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .report-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function getStatusStyle(status: string) {
  const map: Record<string, any> = {
    PENDING:    { background: '#fef9c3', color: '#854d0e' },
    CONFIRMED:  { background: '#dbeafe', color: '#1e40af' },
    PICKING_UP: { background: '#ede9fe', color: '#5b21b6' },
    IN_TRANSIT: { background: '#ffedd5', color: '#9a3412' },
    DELIVERED:  { background: '#dcfce7', color: '#166534' },
    CANCELLED:  { background: '#f3f4f6', color: '#4b5563' },
    FAILED:     { background: '#fee2e2', color: '#991b1b' },
  }
  return map[status] || { background: '#f3f4f6', color: '#4b5563' }
}