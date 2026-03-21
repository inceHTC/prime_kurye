'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, Package, Clock, CheckCircle, XCircle,
  LogOut, Plus, ChevronRight, MapPin, RefreshCw, User
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency, formatTimeAgo, ORDER_STATUS_LABELS } from '@/lib/utils'

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PICKING_UP: Package,
  IN_TRANSIT: Package,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  FAILED: XCircle,
}

export default function BireyselDashboardPage() {
  const router = useRouter()
  const { user, clearAuth, accessToken } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, active: 0, delivered: 0, totalSpent: 0 })

  useEffect(() => {
    if (!accessToken) { router.push('/giris'); return }
    if (user?.role !== 'INDIVIDUAL') {
      if (user?.role === 'BUSINESS') router.push('/dashboard')
      else if (user?.role === 'COURIER') router.push('/kurye')
      else if (user?.role === 'ADMIN') router.push('/admin')
      return
    }
    fetchOrders()
  }, [accessToken])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/orders')
      if (res.data.success) {
        const orderList = res.data.data.orders
        setOrders(orderList)
        setStats({
          total: res.data.data.total,
          active: orderList.filter((o: any) => ['PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT'].includes(o.status)).length,
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

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#1c0800" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff' }}>
              VIN<span style={{ color: '#c8860a' }}>KURYE</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/profil" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.70)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>
              <User size={14} />
              {user.fullName.split(' ')[0]}
            </Link>
            <button onClick={() => { clearAuth(); router.push('/') }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: 8, display: 'flex' }}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Karşılama */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1c0800', marginBottom: 2 }}>
              Merhaba, {user.fullName.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#a89080' }}>Gönderilerinizi buradan yönetin</p>
          </div>
          <Link href="/siparis" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', background: '#c8860a', color: '#1c0800',
            borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
            boxShadow: '0 4px 14px rgba(200,134,10,0.28)',
          }}>
            <Plus size={15} /> Kurye Çağır
          </Link>
        </div>

        {/* İstatistikler */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Toplam Sipariş', value: stats.total, icon: Package, color: '#c8860a', bg: '#fef8ed' },
            { label: 'Aktif', value: stats.active, icon: Clock, color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Teslim Edildi', value: stats.delivered, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Toplam Harcama', value: formatCurrency(stats.totalSpent), icon: ChevronRight, color: '#7c3aed', bg: '#f5f3ff' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ fontSize: '0.75rem', color: '#a89080', fontWeight: 500 }}>{stat.label}</p>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={13} color={stat.color} />
                  </div>
                </div>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
                  {stat.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Sipariş listesi */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(28,8,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800' }}>Siparişlerim</h2>
            <button onClick={fetchOrders} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a89080', padding: 4, display: 'flex' }}>
              <RefreshCw size={14} />
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#a89080' }}>
              <RefreshCw size={20} style={{ margin: '0 auto 8px', display: 'block', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '0.82rem' }}>Yükleniyor...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Package size={36} color="rgba(28,8,0,0.10)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontWeight: 600, color: '#4a3020', marginBottom: 4 }}>Henüz sipariş yok</p>
              <p style={{ fontSize: '0.82rem', color: '#a89080', marginBottom: 18 }}>İlk siparişinize %20 indirim kazanın</p>
              <Link href="/siparis" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#c8860a', color: '#1c0800', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                <Plus size={14} /> Kurye Çağır
              </Link>
            </div>
          ) : (
            <div>
              {orders.map((order: any) => {
                const StatusIcon = statusIcons[order.status] || Clock
                return (
                  <div key={order.id} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(28,8,0,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: order.status === 'DELIVERED' ? '#f0fdf4' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef8ed',
                    }}>
                      <StatusIcon size={16} color={order.status === 'DELIVERED' ? '#16a34a' : order.status === 'CANCELLED' ? '#dc2626' : '#c8860a'} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800' }}>{order.recipientName}</p>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: 3, ...getStatusStyle(order.status) }}>
                          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#a89080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />
                        {order.recipientAddress}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#c8a880', marginTop: 2, fontFamily: 'monospace' }}>
                        {order.trackingCode} · {formatTimeAgo(order.createdAt)}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800' }}>{formatCurrency(order.price)}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, alignItems: 'flex-end' }}>
                        <Link href={`/takip/${order.trackingCode}`} style={{ fontSize: '0.7rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>Takip Et</Link>
                        {['PENDING', 'CONFIRMED'].includes(order.status) && (
                          <button onClick={() => setCancelOrderId(order.id)} style={{ fontSize: '0.7rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
                            İptal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* İptal modal */}
      {cancelOrderId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(28,8,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(28,8,0,0.20)', fontFamily: "'Barlow', sans-serif", textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <XCircle size={26} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1c0800', marginBottom: 8 }}>Siparişi İptal Et</h3>
            <p style={{ fontSize: '0.875rem', color: '#7a6050', marginBottom: 24, lineHeight: 1.65 }}>Bu siparişi iptal etmek istediğinize emin misiniz?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCancelOrderId(null)} style={{ flex: 1, padding: '12px 0', borderRadius: 8, border: '1.5px solid rgba(28,8,0,0.15)', background: '#fff', cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.9rem', color: '#4a3020' }}>
                Vazgeç
              </button>
              <button onClick={handleCancel} style={{ flex: 1, padding: '12px 0', borderRadius: 8, border: 'none', background: '#dc2626', cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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