'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, LogOut, Package, Users, Bike,
  CheckCircle, Clock, XCircle, RefreshCw,
  TrendingUp, AlertCircle, ChevronRight,
  Search, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency, formatTimeAgo, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

type AdminTab = 'dashboard' | 'orders' | 'couriers' | 'businesses'

export default function AdminPage() {
  const router = useRouter()
  const { user, clearAuth, accessToken } = useAuthStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!accessToken) { router.push('/giris'); return }
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return }
    fetchAll()
  }, [accessToken])

  const fetchAll = async () => {
    setIsLoading(true)
    try {
      const [statsRes, ordersRes, couriersRes, businessesRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/orders'),
        api.get('/admin/couriers'),
        api.get('/admin/businesses'),
      ])

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data)
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data.data?.orders || [])
      if (couriersRes.status === 'fulfilled') setCouriers(couriersRes.value.data.data?.couriers || [])
      if (businessesRes.status === 'fulfilled') setBusinesses(businessesRes.value.data.data?.businesses || [])
    } catch {
      toast.error('Veriler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignCourier = async (orderId: string, courierId: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/assign`, { courierId })
      toast.success('Kurye atandı!')
      fetchAll()
    } catch {
      toast.error('Kurye atanamadı')
    }
  }

  const handleApproveCourier = async (courierId: string, approve: boolean) => {
    try {
      await api.patch(`/admin/couriers/${courierId}/approve`, { isApproved: approve })
      toast.success(approve ? 'Kurye onaylandı!' : 'Kurye reddedildi')
      fetchAll()
    } catch {
      toast.error('İşlem başarısız')
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  if (!user) return null

  const tabs = [
    { id: 'dashboard', label: 'Genel Bakış', icon: TrendingUp },
    { id: 'orders', label: 'Siparişler', icon: Package },
    { id: 'couriers', label: 'Kuryeler', icon: Bike },
    { id: 'businesses', label: 'İşletmeler', icon: Users },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{
        background: '#1c0800', padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#1c0800" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' }}>
              PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.40)', marginLeft: 8, fontFamily: "'Barlow', sans-serif", fontWeight: 500 }}>ADMIN</span>
            </span>
          </Link>

          {/* Desktop tabs */}
          <nav style={{ display: 'flex', gap: 2 }} className="hidden md:flex">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 6, border: 'none',
                    cursor: 'pointer', fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600, fontSize: '0.85rem',
                    background: activeTab === tab.id ? 'rgba(200,134,10,0.20)' : 'transparent',
                    color: activeTab === tab.id ? '#c8860a' : 'rgba(255,255,255,0.55)',
                    transition: 'all 0.15s',
                  }}>
                  <Icon size={14} />
                  {tab.label}
                </button>

              )
            })}
            <Link
              href="/admin/odemeler"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6,
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600, fontSize: '0.85rem',
                background: 'rgba(200,134,10,0.20)',
                color: '#c8860a', textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <TrendingUp size={14} />
              Ödemeler
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>{user.fullName}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: 6 }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(28,8,0,0.08)', padding: '0 16px', display: 'flex', gap: 0, overflowX: 'auto' }} className="md:hidden">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '12px 14px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontFamily: "'Barlow', sans-serif",
                fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap',
                color: activeTab === tab.id ? '#c8860a' : '#a89080',
                borderBottom: activeTab === tab.id ? '2px solid #c8860a' : '2px solid transparent',
              }}>
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
        <Link
          href="/admin/odemeler"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '12px 14px', fontFamily: "'Barlow', sans-serif",
            fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap',
            color: '#c8860a', textDecoration: 'none',
            borderBottom: '2px solid #c8860a',
          }}
        >
          <TrendingUp size={14} />
          Ödemeler
        </Link>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* GENEL BAKIŞ */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c0800' }}>Genel Bakış</h1>
              <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: '1px solid rgba(28,8,0,0.12)', borderRadius: 8, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.82rem', color: '#4a3020' }}>
                <RefreshCw size={14} />
                Yenile
              </button>
            </div>

            {/* İstatistik kartları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Toplam Sipariş', value: stats?.totalOrders ?? '—', icon: Package, color: '#c8860a', bg: '#fef8ed' },
                { label: 'Aktif Sipariş', value: stats?.activeOrders ?? '—', icon: Clock, color: '#1d4ed8', bg: '#eff6ff' },
                { label: 'Teslim Edildi', value: stats?.deliveredOrders ?? '—', icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Toplam Kurye', value: stats?.totalCouriers ?? '—', icon: Bike, color: '#7c3aed', bg: '#f5f3ff' },
                { label: 'Aktif İşletme', value: stats?.totalBusinesses ?? '—', icon: Users, color: '#1c0800', bg: '#f5f3ef' },
                { label: 'Bugün Ciro', value: stats?.todayRevenue ? formatCurrency(stats.todayRevenue) : '—', icon: TrendingUp, color: '#c8860a', bg: '#fef8ed' },
              ].map(stat => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <p style={{ fontSize: '0.78rem', color: '#a89080', fontWeight: 500 }}>{stat.label}</p>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color={stat.color} />
                      </div>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
                      {stat.value}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Son siparişler */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1c0800' }}>Son Siparişler</h2>
                <button onClick={() => setActiveTab('orders')} style={{ fontSize: '0.82rem', color: '#c8860a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Tümünü Gör <ChevronRight size={14} />
                </button>
              </div>
              <OrderTable orders={orders.slice(0, 8)} couriers={couriers} onAssign={handleAssignCourier} compact />
            </div>
          </div>
        )}

        {/* SİPARİŞLER */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c0800' }}>Siparişler</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(28,8,0,0.12)', borderRadius: 8, padding: '8px 14px' }}>
                  <Search size={14} color="#a89080" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Takip kodu veya isim..."
                    style={{ border: 'none', outline: 'none', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', color: '#1c0800', width: 200 }}
                  />
                </div>
                <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: '#fff', border: '1px solid rgba(28,8,0,0.12)', borderRadius: 8, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.82rem', color: '#4a3020' }}>
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
              <OrderTable
                orders={orders.filter(o =>
                  !search ||
                  o.trackingCode?.toLowerCase().includes(search.toLowerCase()) ||
                  o.recipientName?.toLowerCase().includes(search.toLowerCase())
                )}
                couriers={couriers}
                onAssign={handleAssignCourier}
              />
            </div>
          </div>
        )}

        {/* KURYELER */}
        {activeTab === 'couriers' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c0800' }}>Kuryeler</h1>
              <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: '1px solid rgba(28,8,0,0.12)', borderRadius: 8, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.82rem', color: '#4a3020' }}>
                <RefreshCw size={14} />
                Yenile
              </button>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
              {couriers.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#a89080' }}>
                  <Bike size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
                  <p>Henüz kurye yok</p>
                </div>
              ) : (
                <div>
                  {couriers.map((courier: any) => (
                    <div key={courier.id} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,8,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bike size={20} color="#c8860a" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800' }}>{courier.user?.fullName}</p>
                          <p style={{ fontSize: '0.78rem', color: '#a89080', marginTop: 2 }}>{courier.user?.phone} · {courier.totalDeliveries} teslimat · ★ {courier.rating || '—'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
                          background: courier.isOnline ? '#f0fdf4' : '#f3f4f6',
                          color: courier.isOnline ? '#16a34a' : '#6b7280',
                        }}>
                          {courier.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                        </span>
                        {!courier.isApproved ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleApproveCourier(courier.id, true)}
                              style={{ padding: '7px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.8rem' }}>
                              Onayla
                            </button>
                            <button onClick={() => handleApproveCourier(courier.id, false)}
                              style={{ padding: '7px 14px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.8rem' }}>
                              Reddet
                            </button>
                          </div>
                        ) : (
                          <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, background: '#f0fdf4', color: '#16a34a' }}>
                            Onaylı ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* İŞLETMELER */}
        {activeTab === 'businesses' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c0800' }}>İşletmeler</h1>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
              {businesses.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#a89080' }}>
                  <Users size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
                  <p>Henüz işletme yok</p>
                </div>
              ) : (
                <div>
                  {businesses.map((biz: any) => (
                    <div key={biz.id} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,8,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#1c0800' }}>
                          {biz.companyName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800' }}>{biz.companyName}</p>
                          <p style={{ fontSize: '0.78rem', color: '#a89080', marginTop: 2 }}>{biz.user?.email} · {biz.user?.phone}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800' }}>{biz._count?.orders ?? 0} sipariş</p>
                        <p style={{ fontSize: '0.78rem', color: '#a89080', marginTop: 2 }}>Bakiye: {formatCurrency(biz.balance)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

// ================================
// SİPARİŞ TABLOSU
// ================================
function OrderTable({ orders, couriers, onAssign, compact = false }: {
  orders: any[]
  couriers: any[]
  onAssign: (orderId: string, courierId: string) => void
  compact?: boolean
}) {
  if (orders.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#a89080' }}>
        <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
        <p>Sipariş bulunamadı</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
        <thead>
          <tr style={{ background: '#faf9f7', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#a89080' }}>TAKİP KODU</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#a89080' }}>ALICI</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#a89080' }}>DURUM</th>
            {!compact && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#a89080' }}>KURYE</th>}
            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#a89080' }}>TUTAR</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#a89080' }}>TARİH</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order.id} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <td style={{ padding: '14px 20px' }}>
                <Link href={`/takip/${order.trackingCode}`} style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
                  {order.trackingCode}
                </Link>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1c0800' }}>{order.recipientName}</p>
                <p style={{ fontSize: '0.75rem', color: '#a89080', marginTop: 1 }}>{order.recipientPhone}</p>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 4,
                  fontSize: '0.72rem', fontWeight: 700,
                  ...getStatusStyle(order.status),
                }}>
                  {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                </span>
              </td>
              {!compact && (
                <td style={{ padding: '14px 16px' }}>
                  {order.courier ? (
                    <p style={{ fontSize: '0.875rem', color: '#4a3020', fontWeight: 500 }}>
                      {order.courier.user?.fullName}
                    </p>
                  ) : order.status === 'CONFIRMED' ? (
                    <select
                      onChange={e => e.target.value && onAssign(order.id, e.target.value)}
                      style={{
                        fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem',
                        border: '1px solid rgba(28,8,0,0.15)', borderRadius: 6,
                        padding: '5px 10px', color: '#1c0800', background: '#fff', cursor: 'pointer',
                      }}
                    >
                      <option value="">Kurye Ata</option>
                      {couriers.filter((c: any) => c.isOnline && c.isApproved).map((c: any) => (
                        <option key={c.id} value={c.id}>{c.user?.fullName}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#a89080' }}>—</span>
                  )}
                </td>
              )}
              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c0800' }}>
                  {formatCurrency(order.price)}
                </span>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '0.78rem', color: '#a89080' }}>
                  {formatTimeAgo(order.createdAt)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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