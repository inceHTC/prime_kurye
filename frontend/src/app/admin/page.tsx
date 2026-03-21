'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, LogOut, Package, Users, Bike, TrendingUp, DollarSign,
  Settings, RefreshCw, Search, ChevronRight, CheckCircle,
  XCircle, Clock, AlertCircle, Eye, Ban, Shield,
  Wallet, BarChart2, ArrowUpRight, ArrowDownRight,
  Filter, Download, Bell, Menu, X, ChevronDown,
  CreditCard, Building2, MapPin, Star, Hash
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency, formatTimeAgo } from '@/lib/utils'

type Tab = 'dashboard' | 'orders' | 'users' | 'couriers' | 'businesses' | 'finance' | 'payouts' | 'escrow' | 'settings'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede', CONFIRMED: 'Onaylandı', PICKING_UP: 'Kurye Yolda',
  IN_TRANSIT: 'Teslimatta', DELIVERED: 'Teslim Edildi', CANCELLED: 'İptal', FAILED: 'Başarısız',
}

const STATUS_STYLES: Record<string, any> = {
  PENDING: { background: '#fef9c3', color: '#854d0e' },
  CONFIRMED: { background: '#dbeafe', color: '#1e40af' },
  PICKING_UP: { background: '#ede9fe', color: '#5b21b6' },
  IN_TRANSIT: { background: '#ffedd5', color: '#9a3412' },
  DELIVERED: { background: '#dcfce7', color: '#166534' },
  CANCELLED: { background: '#f3f4f6', color: '#4b5563' },
  FAILED: { background: '#fee2e2', color: '#991b1b' },
}

export default function AdminPage() {
  const router = useRouter()
  const { user, clearAuth, accessToken } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [payoutSummary, setPayoutSummary] = useState<any>(null)
  const [escrow, setEscrow] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('ALL')
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (!accessToken || (user && user.role !== 'ADMIN')) {
      router.push('/admin/giris')
    }
  }, [accessToken, router, user])

  if (!accessToken || !user || user.role !== 'ADMIN') {
    return null
  }

  useEffect(() => {
    if (activeTab === 'dashboard') {
      void fetchDashboardData()
      return
    }

    void fetchTabData()
  }, [activeTab])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      if (res.data.success) setStats(res.data.data)
    } catch { toast.error('İstatistikler yüklenemedi') }
    finally { setIsLoading(false) }
  }

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, ordersRes, couriersRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/orders?status=ALL'),
        api.get('/admin/couriers'),
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) setStats(statsRes.value.data.data)
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data.success) setOrders(ordersRes.value.data.data.orders)
      if (couriersRes.status === 'fulfilled' && couriersRes.value.data.success) setCouriers(couriersRes.value.data.data.couriers)
    } catch {
      toast.error('Genel bakış verileri yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTabData = async () => {
    setIsLoading(true)
    try {
      switch (activeTab) {
        case 'orders': {
          const res = await api.get(`/admin/orders?status=${orderFilter}&search=${search}`)
          if (res.data.success) setOrders(res.data.data.orders)
          break
        }
        case 'users': {
          const res = await api.get(`/admin/users?role=INDIVIDUAL&search=${search}`)
          if (res.data.success) setUsers(res.data.data.users)
          break
        }
        case 'couriers': {
          const res = await api.get('/admin/couriers')
          if (res.data.success) setCouriers(res.data.data.couriers)
          break
        }
        case 'businesses': {
          const res = await api.get(`/admin/businesses?search=${search}`)
          if (res.data.success) setBusinesses(res.data.data.businesses)
          break
        }
        case 'payouts': {
          const res = await api.get('/admin/payouts')
          if (res.data.success) {
            setPayouts(res.data.data.payouts)
            setPayoutSummary(res.data.data.summary)
          }
          break
        }
        case 'escrow': {
          const res = await api.get('/admin/escrow')
          if (res.data.success) setEscrow(res.data.data)
          break
        }
        case 'settings': {
          const res = await api.get('/admin/settings')
          if (res.data.success) setSettings(res.data.data)
          break
        }
      }
    } catch { toast.error('Veri yüklenemedi') }
    finally { setIsLoading(false) }
  }

  const handleApproveCourier = async (courierId: string, approve: boolean) => {
    try {
      await api.patch(`/admin/couriers/${courierId}/approve`, { isApproved: approve })
      toast.success(approve ? 'Kurye onaylandı' : 'Kurye reddedildi')
      fetchTabData()
    } catch { toast.error('İşlem başarısız') }
  }

  const handleToggleUser = async (userId: string) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle`)
      toast.success(res.data.message)
      fetchTabData()
    } catch { toast.error('İşlem başarısız') }
  }

  const handleCalculatePayouts = async () => {
    setIsCalculating(true)
    try {
      const res = await api.post('/admin/payouts/calculate')
      toast.success(res.data.message)
      fetchTabData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hesaplama başarısız')
    } finally { setIsCalculating(false) }
  }

  const handleCompletePayout = async (payoutId: string) => {
    try {
      await api.patch(`/admin/payouts/${payoutId}/complete`, { note: 'Manuel ödeme tamamlandı' })
      toast.success('Ödeme tamamlandı!')
      fetchTabData()
    } catch { toast.error('İşlem başarısız') }
  }

  const handleSaveSettings = async () => {
    try {
      await api.patch('/admin/settings', settings)
      toast.success('Ayarlar kaydedildi!')
    } catch { toast.error('Kayıt başarısız') }
  }

  const navItems = [
    { id: 'dashboard', label: 'Genel Bakış', icon: BarChart2 },
    { id: 'orders', label: 'Siparişler', icon: Package },
    { id: 'users', label: 'Üyeler', icon: Users },
    { id: 'couriers', label: 'Kuryeler', icon: Bike },
    { id: 'businesses', label: 'İşletmeler', icon: Building2 },
    { id: 'finance', label: 'Finans', icon: DollarSign, children: [
      { id: 'escrow', label: 'Havuz (Escrow)', icon: Wallet },
      { id: 'payouts', label: 'Hakedişler', icon: CreditCard },
    ]},
    { id: 'settings', label: 'Sistem Ayarları', icon: Settings },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: "'Barlow', sans-serif", display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: '#1c0800',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50, transition: 'width 0.2s',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarOpen && (
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={14} color="#1c0800" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff', whiteSpace: 'nowrap' }}>
                PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginLeft: 6 }}>ADMIN</span>
              </span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: 4, flexShrink: 0 }}>
            <Menu size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id || item.children?.some(c => c.id === activeTab)
            return (
              <div key={item.id}>
                <button
                  onClick={() => !item.children && setActiveTab(item.id as Tab)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 8, border: 'none',
                    cursor: 'pointer', marginBottom: 2,
                    background: isActive ? 'rgba(200,134,10,0.20)' : 'transparent',
                    color: isActive ? '#c8860a' : 'rgba(255,255,255,0.55)',
                    transition: 'all 0.15s', fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600, fontSize: '0.85rem', textAlign: 'left',
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                </button>
                {item.children && sidebarOpen && (
                  <div style={{ paddingLeft: 16, marginBottom: 4 }}>
                    {item.children.map(child => {
                      const ChildIcon = child.icon
                      const isChildActive = activeTab === child.id
                      return (
                        <button key={child.id} onClick={() => setActiveTab(child.id as Tab)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                            padding: '7px 10px', borderRadius: 6, border: 'none',
                            cursor: 'pointer', marginBottom: 1,
                            background: isChildActive ? 'rgba(200,134,10,0.15)' : 'transparent',
                            color: isChildActive ? '#c8860a' : 'rgba(255,255,255,0.40)',
                            fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '0.8rem',
                          }}
                        >
                          <ChildIcon size={14} />
                          <span>{child.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(200,134,10,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, color: '#c8860a' }}>
              {user.fullName?.[0]?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName}</p>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Admin</p>
              </div>
            )}
            <button onClick={() => { clearAuth(); router.push('/') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4, flexShrink: 0 }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: sidebarOpen ? 240 : 64, flex: 1, minHeight: '100vh', transition: 'margin-left 0.2s' }}>

        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid rgba(28,8,0,0.08)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#1c0800' }}>
            {navItems.find(n => n.id === activeTab)?.label ||
             navItems.flatMap(n => n.children || []).find(c => c.id === activeTab)?.label ||
             'Admin Panel'}
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { if (activeTab === 'dashboard') void fetchDashboardData(); else void fetchTabData() }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f5f3ef', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.8rem', color: '#4a3020' }}>
              <RefreshCw size={13} /> Yenile
            </button>
          </div>
        </header>

        <div style={{ padding: '24px' }}>

          {/* =================== DASHBOARD =================== */}
          {activeTab === 'dashboard' && stats && (
            <div>
              {/* Stat kartları */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Toplam Sipariş', value: stats.orders.total, sub: `Bugün +${stats.orders.today}`, icon: Package, color: '#c8860a', bg: '#fef8ed', trend: '+' },
                  { label: 'Aktif Sipariş', value: stats.orders.active, sub: 'Devam ediyor', icon: Clock, color: '#1d4ed8', bg: '#eff6ff', trend: '' },
                  { label: 'Teslim Edildi', value: stats.orders.delivered, sub: `Bu hafta +${stats.orders.week}`, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4', trend: '+' },
                  { label: 'Toplam Üye', value: stats.users.total, sub: `${stats.users.businesses} işletme`, icon: Users, color: '#7c3aed', bg: '#f5f3ff', trend: '' },
                  { label: 'Aktif Kurye', value: stats.users.activeCouriers, sub: `${stats.users.couriers} toplam`, icon: Bike, color: '#0891b2', bg: '#ecfeff', trend: '' },
                  { label: 'Havuzdaki Para', value: formatCurrency(stats.finance.escrowHeld), sub: 'Escrow', icon: Wallet, color: '#c8860a', bg: '#fef8ed', trend: '' },
                  { label: 'Bugün Ciro', value: formatCurrency(stats.finance.todayRevenue), sub: `Hafta: ${formatCurrency(stats.finance.weekRevenue)}`, icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4', trend: '+' },
                  { label: 'Bekleyen Hakediş', value: formatCurrency(stats.finance.pendingPayouts), sub: 'Kuryelere ödenecek', icon: CreditCard, color: '#dc2626', bg: '#fee2e2', trend: '' },
                ].map(stat => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '18px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <p style={{ fontSize: '0.72rem', color: '#a89080', fontWeight: 600 }}>{stat.label}</p>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={14} color={stat.color} />
                        </div>
                      </div>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1, marginBottom: 4 }}>
                        {stat.value}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: '#a89080' }}>{stat.sub}</p>
                    </div>
                  )
                })}
              </div>

              {/* Son siparişler */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800' }}>Son Siparişler</h2>
                  <button onClick={() => setActiveTab('orders')} style={{ fontSize: '0.8rem', color: '#c8860a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Tümü <ChevronRight size={13} />
                  </button>
                </div>
                <OrderTable orders={orders.slice(0, 6)} couriers={couriers} onAssign={() => {}} compact />
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && !stats && !isLoading && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '32px', color: '#7a6050' }}>
              Genel bakış verileri yüklenemedi. `Yenile` butonuna basarak tekrar deneyin.
            </div>
          )}

          {/* =================== SİPARİŞLER =================== */}
          {activeTab === 'orders' && (
            <div>
              {/* Filtreler */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(28,8,0,0.12)', borderRadius: 8, padding: '8px 14px', flex: 1, maxWidth: 320 }}>
                  <Search size={14} color="#a89080" />
                  <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchTabData()} placeholder="Takip kodu, isim..." style={{ border: 'none', outline: 'none', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', color: '#1c0800', width: '100%', background: 'transparent' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['ALL', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map(s => (
                    <button key={s} onClick={() => { setOrderFilter(s); fetchTabData() }}
                      style={{ padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.75rem', background: orderFilter === s ? '#1c0800' : '#fff', color: orderFilter === s ? '#fff' : '#4a3020', border: orderFilter === s ? 'none' : '1px solid rgba(28,8,0,0.12)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                      {s === 'ALL' ? 'Tümü' : STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                <OrderTable orders={orders} couriers={couriers} onAssign={async (orderId, courierId) => {
                  await api.patch(`/admin/orders/${orderId}/assign`, { courierId })
                  toast.success('Kurye atandı!')
                  fetchTabData()
                }} />
              </div>
            </div>
          )}

          {/* =================== ÜYELER =================== */}
          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(28,8,0,0.12)', borderRadius: 8, padding: '8px 14px', flex: 1, maxWidth: 320 }}>
                  <Search size={14} color="#a89080" />
                  <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchTabData()} placeholder="İsim, e-posta, telefon..." style={{ border: 'none', outline: 'none', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', color: '#1c0800', width: '100%', background: 'transparent' }} />
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
                    <thead>
                      <tr style={{ background: '#faf9f7', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
                        {['ÜYE', 'ROL', 'TELEFON', 'SİPARİŞ', 'DURUM', 'KAYIT', 'İŞLEM'].map(h => (
                          <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#a89080' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800' }}>{u.fullName}</p>
                            <p style={{ fontSize: '0.72rem', color: '#a89080' }}>{u.email}</p>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: u.role === 'BUSINESS' ? '#fef8ed' : u.role === 'INDIVIDUAL' ? '#eff6ff' : '#f0fdf4', color: u.role === 'BUSINESS' ? '#c8860a' : u.role === 'INDIVIDUAL' ? '#1d4ed8' : '#16a34a' }}>
                              {u.role === 'BUSINESS' ? 'Kurumsal' : u.role === 'INDIVIDUAL' ? 'Bireysel' : u.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#4a3020' }}>{u.phone}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#1c0800' }}>
                            {u.business?._count?.orders ?? 0}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#166534' : '#991b1b' }}>
                              {u.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#a89080' }}>
                            {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => handleToggleUser(u.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.72rem', background: u.isActive ? '#fee2e2' : '#dcfce7', color: u.isActive ? '#991b1b' : '#166534' }}>
                              {u.isActive ? <Ban size={11} /> : <CheckCircle size={11} />}
                              {u.isActive ? 'Askıya Al' : 'Aktif Et'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================== KURYELER =================== */}
          {activeTab === 'couriers' && (
            <div>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
                    <thead>
                      <tr style={{ background: '#faf9f7', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
                        {['KURYE', 'DURUM', 'TESLİMAT', 'PUAN', 'BEKLEYEN HAKEDİŞ', 'BELGELER', 'ONAY'].map(h => (
                          <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#a89080' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {couriers.map((c: any) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800' }}>{c.user?.fullName}</p>
                            <p style={{ fontSize: '0.72rem', color: '#a89080' }}>{c.user?.phone}</p>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: c.isOnline ? '#f0fdf4' : '#f3f4f6', color: c.isOnline ? '#16a34a' : '#6b7280' }}>
                              {c.isOnline ? '● Çevrimiçi' : '○ Çevrimdışı'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#1c0800' }}>{c.totalDeliveries}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#c8860a', fontWeight: 600 }}>
                            {c.rating > 0 ? `★ ${c.rating.toFixed(1)}` : '—'}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 700, color: c.pendingPayout > 0 ? '#c8860a' : '#a89080' }}>
                            {formatCurrency(c.pendingPayout)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: c.documentsSubmitted ? '#dbeafe' : '#f3f4f6', color: c.documentsSubmitted ? '#1e40af' : '#6b7280' }}>
                              {c.documentsSubmitted ? 'Yüklendi' : 'Eksik'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {c.isApproved ? (
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#dcfce7', color: '#166534' }}>Onaylı ✓</span>
                                <button onClick={() => handleApproveCourier(c.id, false)}
                                  style={{ padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.68rem', background: '#fee2e2', color: '#991b1b' }}>
                                  İptal
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => handleApproveCourier(c.id, true)}
                                  style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.72rem', background: '#16a34a', color: '#fff' }}>
                                  Onayla
                                </button>
                                <button onClick={() => handleApproveCourier(c.id, false)}
                                  style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.72rem', background: '#fee2e2', color: '#991b1b' }}>
                                  Reddet
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================== İŞLETMELER =================== */}
          {activeTab === 'businesses' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
                  <thead>
                    <tr style={{ background: '#faf9f7', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
                      {['İŞLETME', 'TİP', 'E-POSTA', 'TELEFON', 'SİPARİŞ', 'BAKİYE', 'KAYIT'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#a89080' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((b: any) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800' }}>{b.companyName}</p>
                          <p style={{ fontSize: '0.72rem', color: '#a89080' }}>{b.user?.fullName}</p>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: b.user?.role === 'BUSINESS' ? '#fef8ed' : '#eff6ff', color: b.user?.role === 'BUSINESS' ? '#c8860a' : '#1d4ed8' }}>
                            {b.user?.role === 'BUSINESS' ? 'Kurumsal' : 'Bireysel'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#4a3020' }}>{b.user?.email}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#4a3020' }}>{b.user?.phone}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#1c0800' }}>{b._count?.orders ?? 0}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#1c0800' }}>{formatCurrency(b.balance)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#a89080' }}>{new Date(b.user?.createdAt).toLocaleDateString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================== ESCROW =================== */}
          {activeTab === 'escrow' && escrow && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Havuzdaki Para', value: formatCurrency(escrow.held.amount), sub: `${escrow.held.count} sipariş`, color: '#c8860a', bg: '#fef8ed', icon: Wallet },
                  { label: 'Aktarılan', value: formatCurrency(escrow.released.amount), sub: `${escrow.released.count} sipariş`, color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
                  { label: 'İade Edilen', value: formatCurrency(escrow.refunded.amount), sub: `${escrow.refunded.count} sipariş`, color: '#dc2626', bg: '#fee2e2', icon: XCircle },
                ].map(s => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <p style={{ fontSize: '0.75rem', color: '#a89080', fontWeight: 600 }}>{s.label}</p>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={15} color={s.color} />
                        </div>
                      </div>
                      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                      <p style={{ fontSize: '0.72rem', color: '#a89080' }}>{s.sub}</p>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)' }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800' }}>Onay Bekleyen Teslimatlar</h2>
                </div>
                {escrow.pendingConfirm.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#a89080', fontSize: '0.875rem' }}>Onay bekleyen teslimat yok</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
                      <thead>
                        <tr style={{ background: '#faf9f7', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
                          {['TAKİP KODU', 'MÜŞTERİ', 'KURYE', 'TUTAR', 'TESLİM TARİHİ', 'OTO.ONAY'].map(h => (
                            <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#a89080' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {escrow.pendingConfirm.map((o: any) => (
                          <tr key={o.id} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}>
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#c8860a', fontWeight: 600 }}>{o.trackingCode}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#1c0800' }}>{o.business?.user?.fullName}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#1c0800' }}>{o.courier?.user?.fullName || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 700, color: '#1c0800' }}>{formatCurrency(o.escrowAmount || 0)}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#a89080' }}>{o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString('tr-TR') : '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#a89080' }}>
                              {o.autoConfirmedAt ? new Date(o.autoConfirmedAt).toLocaleString('tr-TR') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================== HAKEDİŞLER =================== */}
          {activeTab === 'payouts' && (
            <div>
              {payoutSummary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                  {[
                    { label: 'Bekleyen Kurye', value: payoutSummary.pendingCount, icon: Bike, color: '#c8860a', bg: '#fef8ed' },
                    { label: 'Ödenecek Toplam', value: formatCurrency(payoutSummary.pendingTotal), icon: Wallet, color: '#dc2626', bg: '#fee2e2' },
                    { label: 'Toplam Brüt', value: formatCurrency(payoutSummary.totalGross), icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Komisyon', value: formatCurrency(payoutSummary.totalCommission), icon: DollarSign, color: '#7c3aed', bg: '#f5f3ff' },
                    { label: 'Vergi', value: formatCurrency(payoutSummary.totalTax), icon: Hash, color: '#1d4ed8', bg: '#eff6ff' },
                  ].map(s => {
                    const Icon = s.icon
                    return (
                      <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <p style={{ fontSize: '0.72rem', color: '#a89080', fontWeight: 600 }}>{s.label}</p>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={13} color={s.color} />
                          </div>
                        </div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{s.value}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button onClick={handleCalculatePayouts} disabled={isCalculating}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#c8860a', color: '#1c0800', border: 'none', borderRadius: 8, cursor: isCalculating ? 'not-allowed' : 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.875rem', opacity: isCalculating ? 0.7 : 1 }}>
                  {isCalculating ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <TrendingUp size={14} />}
                  Haftalık Hakediş Hesapla
                </button>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
                    <thead>
                      <tr style={{ background: '#faf9f7', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
                        {['KURYE', 'HAFTA', 'BRÜT', 'KOMİSYON', 'VERGİ', 'NET', 'IBAN', 'DURUM', 'İŞLEM'].map(h => (
                          <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#a89080' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p: any) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800' }}>{p.courier?.user?.fullName}</p>
                            <p style={{ fontSize: '0.72rem', color: '#a89080' }}>{p.courier?.user?.phone}</p>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#7a6050' }}>
                            {new Date(p.weekStart).toLocaleDateString('tr-TR')}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#1c0800' }}>{formatCurrency(p.amount)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#16a34a' }}>{formatCurrency(p.commission)}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#7c3aed' }}>{formatCurrency(p.tax)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#c8860a', fontFamily: "'Barlow Condensed', sans-serif" }}>
                              {formatCurrency(p.netAmount)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {p.iban ? (
                              <div>
                                <p style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#1c0800' }}>{p.iban}</p>
                                <p style={{ fontSize: '0.68rem', color: '#a89080' }}>{p.bankName}</p>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>IBAN Yok!</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: p.status === 'PAID' ? '#dcfce7' : '#fef9c3', color: p.status === 'PAID' ? '#166534' : '#854d0e' }}>
                              {p.status === 'PAID' ? 'Ödendi' : 'Bekliyor'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {p.status === 'PENDING' && p.iban && (
                              <button onClick={() => handleCompletePayout(p.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#1c0800', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.75rem' }}>
                                <CheckCircle size={11} /> Ödendi İşaretle
                              </button>
                            )}
                            {p.status === 'PENDING' && !p.iban && (
                              <span style={{ fontSize: '0.72rem', color: '#dc2626' }}>IBAN girilmeli</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================== SİSTEM AYARLARI =================== */}
          {activeTab === 'settings' && settings && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="settings-grid">

              {/* Fiyatlandırma */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c0800', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={16} color="#c8860a" /> Fiyatlandırma
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { key: 'basePriceExpress', label: 'Ekspres Taban Fiyat (₺)' },
                    { key: 'basePriceSameDay', label: 'Aynı Gün Taban Fiyat (₺)' },
                    { key: 'basePriceScheduled', label: 'Planlanmış Taban Fiyat (₺)' },
                    { key: 'pricePerKmMoto', label: 'Motosiklet km Ücreti (₺)' },
                    { key: 'pricePerKmCar', label: 'Araba km Ücreti (₺)' },
                    { key: 'pricePerKmBike', label: 'Bisiklet km Ücreti (₺)' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a3020', marginBottom: 5 }}>{f.label}</label>
                      <input type="number" step="0.01" value={settings[f.key]} onChange={e => setSettings((s: any) => ({ ...s, [f.key]: parseFloat(e.target.value) }))}
                        className="input" style={{ fontFamily: 'monospace' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Komisyon & Operasyon */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c0800', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={16} color="#c8860a" /> Komisyon & Vergi
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { key: 'commissionRate', label: 'Sistem Komisyonu (%)', max: 1, step: 0.01 },
                      { key: 'taxRate', label: 'Vergi Oranı (%)', max: 1, step: 0.01 },
                      { key: 'courierPayRate', label: 'Kurye Pay Oranı (%)', max: 1, step: 0.01 },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a3020', marginBottom: 5 }}>{f.label}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="number" step={f.step} min={0} max={f.max} value={settings[f.key]} onChange={e => setSettings((s: any) => ({ ...s, [f.key]: parseFloat(e.target.value) }))} className="input" style={{ fontFamily: 'monospace' }} />
                          <span style={{ fontSize: '0.875rem', color: '#c8860a', fontWeight: 700, minWidth: 40 }}>%{Math.round(settings[f.key] * 100)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c0800', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Settings size={16} color="#c8860a" /> Operasyon
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { key: 'maxDeliveryRadius', label: 'Max Teslimat Yarıçapı (km)' },
                      { key: 'pickupTimeoutMin', label: 'Kurye Zaman Aşımı (dk)' },
                      { key: 'autoConfirmHours', label: 'Otomatik Onay (saat)' },
                      { key: 'minPayoutAmount', label: 'Min Ödeme Tutarı (₺)' },
                      { key: 'maxInsuranceAmount', label: 'Max Sigorta Tutarı (₺)' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a3020', marginBottom: 5 }}>{f.label}</label>
                        <input type="number" value={settings[f.key]} onChange={e => setSettings((s: any) => ({ ...s, [f.key]: parseFloat(e.target.value) }))} className="input" />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c0800', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} color="#c8860a" /> Çalışma Saatleri
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { key: 'weekdayStart', label: 'Hf. içi başlangıç' },
                      { key: 'weekdayEnd', label: 'Hf. içi bitiş' },
                      { key: 'weekendStart', label: 'Hf. sonu başlangıç' },
                      { key: 'weekendEnd', label: 'Hf. sonu bitiş' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4a3020', marginBottom: 4 }}>{f.label}</label>
                        <input type="time" value={settings[f.key]} onChange={e => setSettings((s: any) => ({ ...s, [f.key]: e.target.value }))} className="input" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kaydet butonu */}
              <div style={{ gridColumn: '1 / -1' }}>
                <button onClick={handleSaveSettings}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: '#c8860a', color: '#1c0800', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(200,134,10,0.25)' }}>
                  <CheckCircle size={16} /> Ayarları Kaydet
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ================================
// SİPARİŞ TABLOSU
// ================================
function OrderTable({ orders, couriers, onAssign, compact = false }: {
  orders: any[], couriers: any[],
  onAssign: (orderId: string, courierId: string) => void,
  compact?: boolean
}) {
  if (orders.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#a89080', fontSize: '0.875rem' }}>Sipariş bulunamadı</div>
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
        <thead>
          <tr style={{ background: '#faf9f7', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
            {['TAKİP KODU', 'ALICI', 'DURUM', ...(compact ? [] : ['KURYE', 'ESCROW']), 'TUTAR', 'TARİH'].map(h => (
              <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#a89080' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o: any) => (
            <tr key={o.id} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <td style={{ padding: '12px 16px' }}>
                <Link href={`/takip/${o.trackingCode}`} style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
                  {o.trackingCode}
                </Link>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1c0800' }}>{o.recipientName}</p>
                <p style={{ fontSize: '0.7rem', color: '#a89080' }}>{o.recipientPhone}</p>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, ...STATUS_STYLES[o.status] }}>
                  {STATUS_LABELS[o.status]}
                </span>
              </td>
              {!compact && (
                <>
                  <td style={{ padding: '12px 16px' }}>
                    {o.courier ? (
                      <p style={{ fontSize: '0.82rem', color: '#4a3020', fontWeight: 500 }}>{o.courier.user?.fullName}</p>
                    ) : o.status === 'CONFIRMED' ? (
                      <select onChange={e => e.target.value && onAssign(o.id, e.target.value)}
                        style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.75rem', border: '1px solid rgba(28,8,0,0.15)', borderRadius: 5, padding: '4px 8px', color: '#1c0800', background: '#fff', cursor: 'pointer' }}>
                        <option value="">Kurye Ata</option>
                        {couriers.filter((c: any) => c.isOnline && c.isApproved).map((c: any) => (
                          <option key={c.id} value={c.id}>{c.user?.fullName}</option>
                        ))}
                      </select>
                    ) : <span style={{ fontSize: '0.75rem', color: '#a89080' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                      background: o.escrowStatus === 'HELD' ? '#fef9c3' : o.escrowStatus === 'RELEASED' ? '#dcfce7' : '#f3f4f6',
                      color: o.escrowStatus === 'HELD' ? '#854d0e' : o.escrowStatus === 'RELEASED' ? '#166534' : '#6b7280' }}>
                      {o.escrowStatus}
                    </span>
                  </td>
                </>
              )}
              <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 700, color: '#1c0800' }}>
                {formatCurrency(o.price)}
              </td>
              <td style={{ padding: '12px 16px', fontSize: '0.72rem', color: '#a89080' }}>
                {new Date(o.createdAt).toLocaleDateString('tr-TR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
