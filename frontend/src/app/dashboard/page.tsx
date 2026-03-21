'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, Package, Clock, CheckCircle, XCircle,
  LogOut, Plus, ChevronRight, TrendingUp,
  Bike, MapPin, RefreshCw, User, BarChart2
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { orderService } from '@/lib/orderService'
import { formatCurrency, formatTimeAgo, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PICKING_UP: Bike,
  IN_TRANSIT: Bike,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  FAILED: XCircle,
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, clearAuth, accessToken, refreshToken } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0, active: 0, delivered: 0, totalSpent: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) { router.push('/giris'); return }
    if (user?.role === 'INDIVIDUAL') { router.push('/dashboard/bireysel'); return }
    if (user?.role === 'COURIER') { router.push('/kurye'); return }
    if (user?.role === 'ADMIN') { router.push('/admin'); return }
    fetchOrders()
  }, [accessToken])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const res = await orderService.getOrders(1)
      if (res.success) {
        const orderList = res.data.orders
        setOrders(orderList)
        setStats({
          total: res.data.total,
          active: orderList.filter((o: any) =>
            ['PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT'].includes(o.status)
          ).length,
          delivered: orderList.filter((o: any) => o.status === 'DELIVERED').length,
          totalSpent: orderList
            .filter((o: any) => !['CANCELLED', 'FAILED'].includes(o.status))
            .reduce((sum: number, o: any) => sum + o.price, 0),
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Siparişler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    toast.success('Çıkış yapıldı')
    router.push('/')
  }

  const filteredOrders = activeFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === activeFilter)

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{
        background: '#1c0800', position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#1c0800" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' }}>
              VIN<span style={{ color: '#c8860a' }}>KURYE</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/profil" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.70)',
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
            }}>
              <User size={15} />
              <span className="hidden md:inline">{user.fullName}</span>
            </Link>
            <button onClick={handleLogout} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.45)', padding: 8, borderRadius: 8,
              display: 'flex', alignItems: 'center',
            }}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Üst başlık */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1c0800', marginBottom: 2 }}>
              Merhaba, {user.fullName.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#a89080' }}>Gönderilerinizi buradan yönetin</p>
          </div>
          <Link href="/siparis" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 22px', background: '#c8860a', color: '#1c0800',
            borderRadius: 8, textDecoration: 'none', fontWeight: 700,
            fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(200,134,10,0.30)',
          }}>
            <Plus size={16} />
            Kurye Çağır
          </Link>
          <Link href="/raporlar" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '11px 18px', background: '#f5f3ef', color: '#4a3020',
            borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
          }}>
            <BarChart2 size={15} />
            Raporlar
          </Link>
        </div>

        {/* İstatistik kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }} className="stats-grid">
          {[
            { label: 'Toplam Sipariş', value: stats.total, icon: Package, color: '#c8860a', bg: '#fef8ed' },
            { label: 'Aktif', value: stats.active, icon: Clock, color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Teslim Edildi', value: stats.delivered, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Toplam Harcama', value: formatCurrency(stats.totalSpent), icon: TrendingUp, color: '#7c3aed', bg: '#f5f3ff' },
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
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
                  {stat.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Sipariş listesi */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>

          {/* Liste başlığı */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1c0800' }}>Siparişlerim</h2>
            <button onClick={fetchOrders} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a89080', padding: 6, borderRadius: 6, display: 'flex' }}>
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Filtreler */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(28,8,0,0.06)', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[
              { value: 'ALL', label: 'Tümü' },
              { value: 'PENDING', label: 'Bekleyen' },
              { value: 'IN_TRANSIT', label: 'Yolda' },
              { value: 'DELIVERED', label: 'Teslim' },
              { value: 'CANCELLED', label: 'İptal' },
            ].map(f => (
              <button key={f.value} onClick={() => setActiveFilter(f.value)} style={{
                padding: '5px 14px', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontFamily: "'Barlow', sans-serif",
                fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap',
                background: activeFilter === f.value ? '#1c0800' : '#f5f3ef',
                color: activeFilter === f.value ? '#fff' : '#7a6050',
                transition: 'all 0.15s',
              }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Liste */}
          {isLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#a89080' }}>
              <RefreshCw size={24} style={{ margin: '0 auto 8px', display: 'block', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '0.875rem' }}>Yükleniyor...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <Package size={40} color="rgba(28,8,0,0.10)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontWeight: 600, color: '#4a3020', marginBottom: 4 }}>Henüz sipariş yok</p>
              <p style={{ fontSize: '0.85rem', color: '#a89080', marginBottom: 20 }}>İlk siparişinize %20 indirim kazanın</p>
              <Link href="/siparis" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', background: '#c8860a', color: '#1c0800',
                borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
              }}>
                <Plus size={14} /> Kurye Çağır
              </Link>
            </div>
          ) : (
            <div>
              {filteredOrders.map((order: any) => {
                const StatusIcon = statusIcons[order.status] || Clock
                return (
                  <Link key={order.id} href={`/takip/${order.trackingCode}`} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px', textDecoration: 'none',
                    borderBottom: '1px solid rgba(28,8,0,0.05)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    {/* Status ikon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: order.status === 'DELIVERED' ? '#f0fdf4' :
                        order.status === 'CANCELLED' || order.status === 'FAILED' ? '#fee2e2' :
                          order.status === 'IN_TRANSIT' || order.status === 'PICKING_UP' ? '#eff6ff' : '#fef8ed',
                    }}>
                      <StatusIcon size={18} color={
                        order.status === 'DELIVERED' ? '#16a34a' :
                          order.status === 'CANCELLED' || order.status === 'FAILED' ? '#dc2626' :
                            order.status === 'IN_TRANSIT' || order.status === 'PICKING_UP' ? '#1d4ed8' : '#c8860a'
                      } />
                    </div>

                    {/* Bilgiler */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1c0800' }}>{order.recipientName}</p>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4,
                          fontSize: '0.7rem', fontWeight: 700,
                          ...getStatusStyle(order.status),
                        }}>
                          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} color="#a89080" />
                        <p style={{ fontSize: '0.78rem', color: '#a89080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.recipientAddress}
                        </p>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#c8a880', marginTop: 2, fontFamily: 'monospace' }}>
                        {order.trackingCode} · {formatTimeAgo(order.createdAt)}
                      </p>
                    </div>

                    {/* Fiyat + ok */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800' }}>{formatCurrency(order.price)}</p>
                      <ChevronRight size={14} color="#c8a880" style={{ marginTop: 4, marginLeft: 'auto', display: 'block' }} />
                      {['PENDING', 'CONFIRMED'].includes(order.status) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            setCancelOrderId(order.id)
                          }}
                          style={{
                            marginTop: 4, background: 'none', border: 'none',
                            cursor: 'pointer', fontSize: '0.72rem', color: '#dc2626',
                            fontFamily: "'Barlow', sans-serif", fontWeight: 600, padding: 0,
                          }}
                        >
                          İptal et
                        </button>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* İptal onay modal */}
        {cancelOrderId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(28,8,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <div style={{
              background: '#fff', borderRadius: 16, padding: '32px 28px',
              maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(28,8,0,0.20)',
              fontFamily: "'Barlow', sans-serif",
            }}>
              {/* İkon */}
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#fee2e2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1c0800', textAlign: 'center', marginBottom: 10 }}>
                Siparişi İptal Et
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#7a6050', textAlign: 'center', lineHeight: 1.65, marginBottom: 28 }}>
                Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setCancelOrderId(null)}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 8,
                    border: '1.5px solid rgba(28,8,0,0.15)',
                    background: '#fff', cursor: 'pointer',
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600, fontSize: '0.9rem', color: '#4a3020',
                  }}
                >
                  Vazgeç
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.patch(`/orders/${cancelOrderId}/cancel`)
                      toast.success('Sipariş iptal edildi')
                      setCancelOrderId(null)
                      fetchOrders()
                    } catch {
                      toast.error('İptal edilemedi')
                      setCancelOrderId(null)
                    }
                  }}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 8,
                    border: 'none', background: '#dc2626', cursor: 'pointer',
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 700, fontSize: '0.9rem', color: '#fff',
                  }}
                >
                  Evet, İptal Et
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

function getStatusStyle(status: string) {
  const map: Record<string, any> = {
    PENDING: { background: '#fef9c3', color: '#854d0e' },
    CONFIRMED: { background: '#dbeafe', color: '#1e40af' },
    PICKING_UP: { background: '#ede9fe', color: '#5b21b6' },
    IN_TRANSIT: { background: '#ffedd5', color: '#9a3412' },
    DELIVERED: { background: '#dcfce7', color: '#166534' },
    CANCELLED: { background: '#f3f4f6', color: '#4b5563' },
    FAILED: { background: '#fee2e2', color: '#991b1b' },
  }
  return map[status] || { background: '#f3f4f6', color: '#4b5563' }
}