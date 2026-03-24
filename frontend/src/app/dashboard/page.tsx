'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, Package, Clock, CheckCircle, XCircle,
  LogOut, Plus, TrendingUp, Bike, MapPin,
  RefreshCw, User, BarChart2, Building2,
  Wallet, FileText, LayoutDashboard,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { orderService } from '@/lib/orderService'
import { formatCurrency, formatTimeAgo, ORDER_STATUS_LABELS } from '@/lib/utils'

type FilterType = 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT']

function getStatusStyle(status: string) {
  const map: Record<string, { background: string; color: string }> = {
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

export default function DashboardPage() {
  const router = useRouter()
  const { user, clearAuth, accessToken, _hasHydrated } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, delivered: 0, totalSpent: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!accessToken) { router.push('/giris'); return }
    if (user?.role === 'INDIVIDUAL') { router.push('/dashboard/bireysel'); return }
    if (user?.role === 'COURIER') { router.push('/kurye'); return }
    if (user?.role === 'ADMIN') { router.push('/admin'); return }
    fetchOrders()
  }, [_hasHydrated, accessToken])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const res = await orderService.getOrders(1)
      if (res.success) {
        const orderList = res.data.orders
        setOrders(orderList)
        setStats({
          total: res.data.total,
          active: orderList.filter((o: any) => ACTIVE_STATUSES.includes(o.status)).length,
          delivered: orderList.filter((o: any) => o.status === 'DELIVERED').length,
          totalSpent: orderList
            .filter((o: any) => !['CANCELLED', 'FAILED'].includes(o.status))
            .reduce((sum: number, o: any) => sum + o.price, 0),
        })
      }
    } catch {
      toast.error('Siparişler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelOrderId) return
    try {
      await api.patch(`/orders/${cancelOrderId}/cancel`)
      toast.success('Sipariş iptal edildi')
      setCancelOrderId(null)
      fetchOrders()
    } catch {
      toast.error('İptal edilemedi')
      setCancelOrderId(null)
    }
  }

  const filteredOrders = orders.filter(o => {
    if (filter === 'ACTIVE') return ACTIVE_STATUSES.includes(o.status)
    if (filter === 'DELIVERED') return o.status === 'DELIVERED'
    if (filter === 'CANCELLED') return ['CANCELLED', 'FAILED'].includes(o.status)
    return true
  })

  const cancelledCount = orders.filter(o => ['CANCELLED', 'FAILED'].includes(o.status)).length
  const companyName = (user as any)?.business?.companyName || user?.fullName || ''
  const initials = companyName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'K'

  if (!_hasHydrated || !user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f0ede8', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid rgba(200,134,10,0.12)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, background: '#c8860a', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={15} color="#1c0800" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' }}>
                VIN<span style={{ color: '#c8860a' }}>KURYE</span>
              </span>
            </Link>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.12)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Kurumsal Panel
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/profil" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 12px 6px 6px', borderRadius: 30, background: 'rgba(255,255,255,0.06)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #c8860a, #e8a020)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: '#1c0800' }}>
                {initials}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
                {user.fullName.split(' ')[0]}
              </span>
            </Link>
            <button onClick={() => { clearAuth(); toast.success('Çıkış yapıldı'); router.push('/') }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: '8px', display: 'flex', borderRadius: 8 }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="kurumsal-main" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* Sidebar */}
        <aside className="kurumsal-sidebar">
          {/* Şirket Kartı */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px 20px', marginBottom: 10, textAlign: 'center' }}>
            <div style={{ width: 68, height: 68, borderRadius: 16, background: 'linear-gradient(135deg, #1c0800, #3a1500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '3px solid #c8860a' }}>
              <Building2 size={28} color="#c8860a" />
            </div>
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1c0800', marginBottom: 3 }}>{companyName || user.fullName}</p>
            <p style={{ fontSize: '0.72rem', color: '#a89080', marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#fef8ed', color: '#c8860a', fontSize: '0.7rem', fontWeight: 700 }}>
              <Building2 size={10} />
              Kurumsal Üye
            </span>
          </div>

          {/* Navigasyon */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', background: '#1c0800', borderLeft: '3px solid #c8860a' }}>
              <LayoutDashboard size={15} color="#c8860a" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c8860a' }}>Siparişlerim</span>
            </div>
            <Link href="/siparis" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', textDecoration: 'none', borderLeft: '3px solid transparent', borderTop: '1px solid rgba(28,8,0,0.06)' }}>
              <Plus size={15} color="#7a6050" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a3020' }}>Kurye Çağır</span>
            </Link>
            <Link href="/raporlar" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', textDecoration: 'none', borderLeft: '3px solid transparent', borderTop: '1px solid rgba(28,8,0,0.06)' }}>
              <BarChart2 size={15} color="#7a6050" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a3020' }}>Raporlar</span>
            </Link>
            <Link href="/entegrasyon/api-dokumantasyon" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', textDecoration: 'none', borderLeft: '3px solid transparent', borderTop: '1px solid rgba(28,8,0,0.06)' }}>
              <FileText size={15} color="#7a6050" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a3020' }}>API Entegrasyon</span>
            </Link>
            <Link href="/profil" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', textDecoration: 'none', borderLeft: '3px solid transparent', borderTop: '1px solid rgba(28,8,0,0.06)' }}>
              <User size={15} color="#7a6050" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a3020' }}>Profilim</span>
            </Link>
          </div>

          {/* CTA */}
          <Link href="/siparis" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: '#c8860a', color: '#1c0800', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: '0.875rem', boxShadow: '0 4px 14px rgba(200,134,10,0.25)' }}>
            <Plus size={15} />
            Yeni Sipariş Ver
          </Link>
        </aside>

        {/* Ana İçerik */}
        <div>
          {/* Hoş Geldin Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1c0800 0%, #3d1a00 100%)', borderRadius: 14, padding: '22px 28px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(200,134,10,0.07)' }} />
            <div style={{ position: 'absolute', right: 60, bottom: -50, width: 120, height: 120, borderRadius: '50%', background: 'rgba(200,134,10,0.04)' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Hoş geldiniz
              </p>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: 5, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.1 }}>
                {companyName || user.fullName} 👋
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                {stats.active > 0
                  ? `${stats.active} aktif gönderiniz devam ediyor`
                  : 'Tüm gönderilerinizi buradan kolayca yönetin'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, position: 'relative' }} className="banner-actions">
              <Link href="/raporlar" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', borderRadius: 9, textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.12)' }}>
                <BarChart2 size={14} />
                Raporlar
              </Link>
              <Link href="/siparis" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', background: '#c8860a', color: '#1c0800', borderRadius: 9, textDecoration: 'none', fontWeight: 800, fontSize: '0.875rem', boxShadow: '0 4px 16px rgba(200,134,10,0.35)' }}>
                <Plus size={15} />
                Kurye Çağır
              </Link>
            </div>
          </div>

          {/* İstatistik Kartları */}
          <div className="stats-grid" style={{ marginBottom: 18 }}>
            {[
              { label: 'Toplam Sipariş', value: stats.total, icon: Package, accent: '#c8860a', bg: '#fef8ed' },
              { label: 'Aktif Gönderi', value: stats.active, icon: Bike, accent: '#2563eb', bg: '#eff6ff' },
              { label: 'Teslim Edildi', value: stats.delivered, icon: CheckCircle, accent: '#16a34a', bg: '#f0fdf4' },
              { label: 'Toplam Harcama', value: formatCurrency(stats.totalSpent), icon: Wallet, accent: '#7c3aed', bg: '#f5f3ff' },
            ].map(stat => {
              const Icon = stat.icon
              return (
                <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '18px 16px', borderTop: `3px solid ${stat.accent}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <p style={{ fontSize: '0.7rem', color: '#a89080', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={15} color={stat.accent} />
                    </div>
                  </div>
                  <p style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
                    {stat.value}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Hızlı Erişim Kartları */}
          <div className="quick-grid" style={{ marginBottom: 18 }}>
            <Link href="/raporlar" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', textDecoration: 'none', transition: 'all 0.15s' }} className="quick-card">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={18} color="#7c3aed" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c0800', marginBottom: 2 }}>Raporlar</p>
                <p style={{ fontSize: '0.75rem', color: '#a89080' }}>Detaylı sipariş analizi</p>
              </div>
            </Link>
            <Link href="/entegrasyon" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', textDecoration: 'none', transition: 'all 0.15s' }} className="quick-card">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={18} color="#2563eb" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c0800', marginBottom: 2 }}>API Entegrasyon</p>
                <p style={{ fontSize: '0.75rem', color: '#a89080' }}>Sisteminize entegre edin</p>
              </div>
            </Link>
          </div>

          {/* Sipariş Listesi */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>

            {/* Başlık + Filtreler */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1c0800' }}>Siparişlerim</h2>
                <button onClick={fetchOrders} style={{ background: '#f4f2ef', border: 'none', cursor: 'pointer', color: '#7a6050', padding: '6px', display: 'flex', borderRadius: 7 }}>
                  <RefreshCw size={13} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {([
                  { key: 'ALL' as FilterType, label: 'Tümü', count: orders.length },
                  { key: 'ACTIVE' as FilterType, label: 'Aktif', count: stats.active },
                  { key: 'DELIVERED' as FilterType, label: 'Teslim Edildi', count: stats.delivered },
                  { key: 'CANCELLED' as FilterType, label: 'İptal / Başarısız', count: cancelledCount },
                ]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8,
                      border: filter === tab.key ? 'none' : '1px solid rgba(28,8,0,0.10)',
                      background: filter === tab.key ? '#1c0800' : 'transparent',
                      color: filter === tab.key ? '#fff' : '#4a3020',
                      cursor: 'pointer', fontFamily: "'Barlow', sans-serif",
                      fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.15s',
                    }}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 9, padding: '0 4px', background: filter === tab.key ? 'rgba(200,134,10,0.25)' : 'rgba(28,8,0,0.07)', fontSize: '0.65rem', fontWeight: 800, color: filter === tab.key ? '#c8860a' : '#7a6050' }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div style={{ padding: 52, textAlign: 'center', color: '#a89080' }}>
                <RefreshCw size={22} style={{ margin: '0 auto 10px', display: 'block', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '0.85rem' }}>Yükleniyor...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ padding: 56, textAlign: 'center' }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Package size={30} color="rgba(28,8,0,0.15)" />
                </div>
                <p style={{ fontWeight: 800, color: '#1c0800', marginBottom: 6, fontSize: '1rem' }}>
                  {filter === 'ALL' ? 'Henüz sipariş yok' : 'Bu filtrede sipariş yok'}
                </p>
                <p style={{ fontSize: '0.82rem', color: '#a89080', marginBottom: 22 }}>
                  {filter === 'ALL' ? 'İlk siparişinize özel kurumsal avantajlarla başlayın' : 'Farklı bir filtre seçin'}
                </p>
                {filter === 'ALL' && (
                  <Link href="/siparis" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 24px', background: '#c8860a', color: '#1c0800', borderRadius: 9, textDecoration: 'none', fontWeight: 800, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(200,134,10,0.25)' }}>
                    <Plus size={14} /> Kurye Çağır
                  </Link>
                )}
              </div>
            ) : (
              <div>
                {filteredOrders.map((order: any) => (
                  <OrderRow key={order.id} order={order} onCancel={() => setCancelOrderId(order.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* İptal Modal */}
      {cancelOrderId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(28,8,0,0.65)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '36px 32px', maxWidth: 400, width: '100%', boxShadow: '0 40px 100px rgba(28,8,0,0.30)', textAlign: 'center' }}>
            <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <XCircle size={28} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1c0800', marginBottom: 8 }}>Siparişi İptal Et</h3>
            <p style={{ fontSize: '0.875rem', color: '#7a6050', marginBottom: 28, lineHeight: 1.7 }}>
              Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCancelOrderId(null)} style={{ flex: 1, padding: '12px 0', borderRadius: 9, border: '1.5px solid rgba(28,8,0,0.12)', background: '#fff', cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#4a3020' }}>
                Vazgeç
              </button>
              <button onClick={handleCancel} style={{ flex: 1, padding: '12px 0', borderRadius: 9, border: 'none', background: '#dc2626', cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .kurumsal-main { display: grid; grid-template-columns: 230px 1fr; gap: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .quick-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .kurumsal-sidebar { display: flex; flex-direction: column; gap: 0; }
        .quick-card:hover { border-color: rgba(28,8,0,0.15) !important; background: #faf9f6 !important; }
        .order-row:hover { background: #faf9f6; }
        @media (max-width: 900px) {
          .kurumsal-main { grid-template-columns: 1fr !important; }
          .kurumsal-sidebar { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .banner-actions { display: none !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .quick-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}

function OrderRow({ order, onCancel }: { order: any; onCancel: () => void }) {
  const statusStyle = getStatusStyle(order.status)
  const isActive = ACTIVE_STATUSES.includes(order.status)

  return (
    <Link
      href={`/takip/${order.trackingCode}`}
      style={{ padding: '15px 20px', borderBottom: '1px solid rgba(28,8,0,0.05)', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}
      className="order-row"
    >
      {/* İkon */}
      <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: statusStyle.background }}>
        {order.status === 'DELIVERED'
          ? <CheckCircle size={19} color={statusStyle.color} />
          : order.status === 'CANCELLED' || order.status === 'FAILED'
          ? <XCircle size={19} color={statusStyle.color} />
          : ['PICKING_UP', 'IN_TRANSIT'].includes(order.status)
          ? <Bike size={19} color={statusStyle.color} />
          : <Package size={19} color={statusStyle.color} />
        }
      </div>

      {/* Bilgi */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800' }}>{order.recipientName}</p>
          <span style={{ fontSize: '0.67rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, ...statusStyle }}>
            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
          </span>
          {isActive && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite', flexShrink: 0 }} />
          )}
        </div>
        <p style={{ fontSize: '0.77rem', color: '#a89080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
          <MapPin size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
          {order.recipientAddress}
        </p>
        <p style={{ fontSize: '0.69rem', color: '#c8a880', fontFamily: 'monospace' }}>
          {order.trackingCode} · {formatTimeAgo(order.createdAt)}
        </p>
      </div>

      {/* Fiyat + Aksiyonlar */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1c0800', marginBottom: 7, fontFamily: "'Barlow Condensed', sans-serif" }}>
          {formatCurrency(order.price)}
        </p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, background: '#fef8ed', color: '#c8860a', fontSize: '0.72rem', fontWeight: 700 }}>
            Takip Et
          </span>
          {['PENDING', 'CONFIRMED'].includes(order.status) && (
            <button
              onClick={(e) => { e.preventDefault(); onCancel() }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontSize: '0.72rem', fontWeight: 700 }}
            >
              İptal
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
