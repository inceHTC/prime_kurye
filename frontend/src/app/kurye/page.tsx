'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import Image from 'next/image'
import {
  Zap, LogOut, MapPin, Phone, Package,
  CheckCircle, XCircle, Clock, Navigation,
  TrendingUp, Star, Wifi, WifiOff, RefreshCw,
  LayoutDashboard, Wallet, Camera, Menu, X,
  ChevronRight, ArrowLeft, ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency, formatTimeAgo, ORDER_STATUS_LABELS } from '@/lib/utils'
import { getSocket, joinCourierRoom } from '@/lib/socket'

type OrderTab = 'PENDING' | 'ACTIVE' | 'DONE'
type PageTab = 'orders' | 'earnings'

export default function KuryePanelPage() {
  const router = useRouter()
  const { user, clearAuth, accessToken, refreshToken, setAuth } = useAuthStore()
  const { isReady } = useRequireAuth({ roleRequired: 'COURIER', roleRedirect: '/dashboard' })
  const [orders, setOrders] = useState<any[]>([])
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<OrderTab>('PENDING')
  const [pageTab, setPageTab] = useState<PageTab>('orders')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({ todayDeliveries: 0, todayEarnings: 0, rating: 0, totalDeliveries: 0 })
  const [earnings, setEarnings] = useState<any>(null)
  const [earningsLoading, setEarningsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [uploadingProof, setUploadingProof] = useState(false)

  useEffect(() => {
    if (isReady) fetchData()
  }, [isReady])

  useEffect(() => {
    if (pageTab === 'earnings' && !earnings) fetchEarnings()
  }, [pageTab])

  // Socket.io: gerçek zamanlı yeni sipariş bildirimi
  useEffect(() => {
    if (!user?.courierId) return
    const socket = getSocket()
    joinCourierRoom(user.courierId)
    socket.on('order:new', (order: any) => {
      toast.success(`Yeni sipariş! #${order.trackingCode}`, { duration: 6000, icon: '🛵' })
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev
        return [order, ...prev]
      })
    })
    return () => { socket.off('order:new') }
  }, [user?.courierId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/courier/orders')
      if (res.data.success) {
        setOrders(res.data.data.orders || [])
        setStats(res.data.data.stats || stats)
        setIsOnline(res.data.data.isOnline || false)
      }
    } catch {
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEarnings = async () => {
    setEarningsLoading(true)
    try {
      const res = await api.get('/escrow/courier/earnings')
      if (res.data.success) setEarnings(res.data.data)
    } catch {
      toast.error('Kazanç bilgisi yüklenemedi')
    } finally {
      setEarningsLoading(false)
    }
  }

  const toggleOnline = async () => {
    try {
      await api.patch('/courier/status', { isOnline: !isOnline })
      setIsOnline(prev => !prev)
      toast.success(!isOnline ? 'Çevrimiçi oldunuz!' : 'Çevrimdışı oldunuz')
    } catch {
      setIsOnline(prev => !prev)
      toast.success(!isOnline ? 'Çevrimiçi oldunuz!' : 'Çevrimdışı oldunuz')
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/accept`)
      toast.success('Sipariş kabul edildi!')
      fetchData()
    } catch {
      toast.error('Sipariş kabul edilemedi')
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/reject`)
      toast.success('Sipariş reddedildi')
      fetchData()
    } catch {
      toast.error('İşlem başarısız')
    }
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/courier/orders/${orderId}/status`, { status })
      toast.success('Durum güncellendi!')
      fetchData()
    } catch {
      toast.error('Durum güncellenemedi')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (res.data.success) {
        const url = res.data.data.avatarUrl
        setAvatarUrl(url)
        if (user && accessToken && refreshToken) setAuth({ ...user, avatar: url }, accessToken, refreshToken)
        toast.success('Profil fotoğrafı güncellendi')
      }
    } catch {
      toast.error('Fotoğraf yüklenemedi')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const pendingOrders = orders.filter(o => o.status === 'CONFIRMED')
  const activeOrders = orders.filter(o => ['PICKING_UP', 'IN_TRANSIT'].includes(o.status))
  const doneOrders = orders.filter(o => ['DELIVERED', 'CANCELLED', 'FAILED'].includes(o.status))
  const tabOrders = tab === 'PENDING' ? pendingOrders : tab === 'ACTIVE' ? activeOrders : doneOrders
  const initials = user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'K'
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'

  if (!isReady || !user) return null

  const navItems: { key: PageTab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'orders', label: 'Siparişler', icon: Package, count: pendingOrders.length + activeOrders.length || undefined },
    { key: 'earnings', label: 'Kazançlarım', icon: TrendingUp },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0ede8', fontFamily: "'Barlow', sans-serif" }}>

      {/* Proof yükleniyor overlay */}
      {uploadingProof && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,8,0,0.75)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(200,134,10,0.3)', borderTopColor: '#c8860a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Teslim fotoğrafı yükleniyor...</p>
        </div>
      )}

      {/* Avatar input */}
      <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />

      {/* ── SOL SIDEBAR ─────────────────────────────────────── */}
      {/* Mobile overlay */}
      {!sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 48, display: 'none' }}
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        background: '#1c0800',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s, min-width 0.25s',
        overflow: 'hidden',
        borderRight: '1px solid rgba(200,134,10,0.12)',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: '#c8860a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={16} color="#1c0800" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1.1 }}>
                VIN<span style={{ color: '#c8860a' }}>KURYE</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Kurye Paneli</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, display: 'flex', borderRadius: 6 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Online/Offline Kartı */}
        <div style={{ margin: '16px 14px', borderRadius: 12, background: isOnline ? 'rgba(200,134,10,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isOnline ? 'rgba(200,134,10,0.3)' : 'rgba(255,255,255,0.08)'}`, padding: '14px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isOnline
                ? <Wifi size={14} color="#c8860a" />
                : <WifiOff size={14} color="rgba(255,255,255,0.3)" />
              }
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isOnline ? '#c8860a' : 'rgba(255,255,255,0.4)' }}>
                {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
              </span>
              {isOnline && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />}
            </div>
          </div>
          <button
            onClick={toggleOnline}
            style={{
              width: '100%', padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '0.82rem',
              background: isOnline ? '#c8860a' : 'rgba(255,255,255,0.08)',
              color: isOnline ? '#1c0800' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s',
            }}
          >
            {isOnline ? 'Durdur' : 'Başlat'}
          </button>
        </div>

        {/* Navigasyon */}
        <nav style={{ padding: '4px 10px', flex: 1 }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 8px 10px' }}>
            Menü
          </p>
          {navItems.map(item => {
            const Icon = item.icon
            const active = pageTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setPageTab(item.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: active ? 'rgba(200,134,10,0.15)' : 'transparent',
                  color: active ? '#c8860a' : 'rgba(255,255,255,0.5)',
                  fontFamily: "'Barlow', sans-serif", fontWeight: active ? 700 : 500,
                  fontSize: '0.88rem', marginBottom: 2,
                  transition: 'all 0.15s', textAlign: 'left',
                  borderLeft: active ? '3px solid #c8860a' : '3px solid transparent',
                }}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span style={{
                    minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px',
                    background: '#c8860a', color: '#1c0800',
                    fontSize: '0.68rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Alt: Profil + Çıkış */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', marginBottom: 8, textAlign: 'left' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 9, overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(200,134,10,0.3)' }}>
              {avatarUrl ? (
                <Image src={`${apiBase}${avatarUrl}`} alt="Avatar" width={36} height={36} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                  {uploadingAvatar ? '...' : initials}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.83rem', fontWeight: 700, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Fotoğrafı değiştir</p>
            </div>
            <Camera size={13} color="rgba(255,255,255,0.3)" />
          </button>

          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.82rem' }}
          >
            <LogOut size={15} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── ANA İÇERİK ─────────────────────────────────────── */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 0, transition: 'margin-left 0.25s', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Üst Bar */}
        <header style={{ background: '#fff', height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, borderBottom: '1px solid rgba(28,8,0,0.07)', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 8px rgba(28,8,0,0.05)' }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7a6050', display: 'flex', padding: 6, borderRadius: 8 }}>
              <Menu size={20} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#1c0800', lineHeight: 1 }}>
              {pageTab === 'orders' ? 'Siparişlerim' : 'Kazançlarım'}
            </h1>
            <p style={{ fontSize: '0.72rem', color: '#a89080', marginTop: 2 }}>
              {pageTab === 'orders'
                ? `${pendingOrders.length} bekleyen · ${activeOrders.length} aktif`
                : 'Gelir özeti ve ödeme geçmişi'
              }
            </p>
          </div>
          <button
            onClick={pageTab === 'orders' ? fetchData : fetchEarnings}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0ede8', border: 'none', cursor: 'pointer', color: '#7a6050', padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}
          >
            <RefreshCw size={13} />
            Yenile
          </button>
        </header>

        <main style={{ flex: 1, padding: '24px', maxWidth: 900, width: '100%' }}>

          {/* ── SİPARİŞLER ─── */}
          {pageTab === 'orders' && (
            <>
              {/* İstatistik Kartları */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
                {[
                  { label: 'Bugün Teslimat', value: stats.todayDeliveries, icon: Package, accent: '#c8860a', bg: '#fef8ed' },
                  { label: 'Bugün Kazanç', value: formatCurrency(stats.todayEarnings), icon: Wallet, accent: '#16a34a', bg: '#f0fdf4' },
                  { label: 'Puanım', value: stats.rating > 0 ? `${stats.rating.toFixed(1)} ★` : '—', icon: Star, accent: '#f59e0b', bg: '#fffbeb' },
                  { label: 'Toplam Teslimat', value: stats.totalDeliveries, icon: CheckCircle, accent: '#2563eb', bg: '#eff6ff' },
                ].map(stat => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '18px 16px', borderTop: `3px solid ${stat.accent}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <p style={{ fontSize: '0.68rem', color: '#a89080', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={14} color={stat.accent} />
                        </div>
                      </div>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
                        {stat.value}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Sipariş Tablosu */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                {/* Sekmeler */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>
                  {([
                    { key: 'PENDING' as OrderTab, label: 'Bekleyen', count: pendingOrders.length, color: '#c8860a' },
                    { key: 'ACTIVE' as OrderTab, label: 'Aktif', count: activeOrders.length, color: '#2563eb' },
                    { key: 'DONE' as OrderTab, label: 'Tamamlanan', count: doneOrders.length, color: '#16a34a' },
                  ]).map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      style={{
                        flex: 1, padding: '14px 8px',
                        background: 'transparent', border: 'none',
                        borderBottom: tab === t.key ? `2px solid ${t.color}` : '2px solid transparent',
                        cursor: 'pointer', fontFamily: "'Barlow', sans-serif",
                        fontWeight: 700, fontSize: '0.85rem',
                        color: tab === t.key ? '#1c0800' : '#a89080',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.15s',
                      }}
                    >
                      {t.label}
                      {t.count > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, borderRadius: 10, padding: '0 5px', background: tab === t.key ? t.color : 'rgba(28,8,0,0.07)', fontSize: '0.65rem', fontWeight: 800, color: tab === t.key ? '#fff' : '#7a6050' }}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* İçerik */}
                {isLoading ? (
                  <div style={{ padding: 60, textAlign: 'center', color: '#a89080' }}>
                    <RefreshCw size={22} style={{ margin: '0 auto 10px', display: 'block', animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: '0.85rem' }}>Yükleniyor...</p>
                  </div>
                ) : tabOrders.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Package size={28} color="rgba(28,8,0,0.15)" />
                    </div>
                    <p style={{ fontWeight: 700, color: '#4a3020', marginBottom: 5 }}>
                      {tab === 'PENDING' ? 'Bekleyen sipariş yok' : tab === 'ACTIVE' ? 'Aktif sipariş yok' : 'Tamamlanan sipariş yok'}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#a89080' }}>
                      {tab === 'PENDING' && !isOnline ? 'Sipariş almak için sol panelden çevrimiçi olun' : 'Henüz kayıt yok'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {tabOrders.map((order: any) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onAccept={() => handleAcceptOrder(order.id)}
                        onReject={() => handleRejectOrder(order.id)}
                        onUpdateStatus={(status) => handleUpdateStatus(order.id, status)}
                        onProofUpload={async (file) => {
                          setUploadingProof(true)
                          try {
                            const formData = new FormData()
                            formData.append('proof', file)
                            await api.post(`/orders/${order.id}/proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                            await api.patch(`/courier/orders/${order.id}/status`, { status: 'DELIVERED' })
                            toast.success('Teslimat fotoğraflandı ve teslim edildi olarak işaretlendi!', { icon: '✅' })
                            fetchData()
                          } catch {
                            toast.error('Fotoğraf yüklenemedi')
                          } finally {
                            setUploadingProof(false)
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── KAZANÇLAR ─── */}
          {pageTab === 'earnings' && (
            <>
              {earningsLoading ? (
                <div style={{ padding: 60, textAlign: 'center' }}>
                  <RefreshCw size={24} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite', color: '#c8860a' }} />
                </div>
              ) : (
                <>
                  {/* Özet Kartlar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
                    {[
                      { label: 'Bu Hafta', value: formatCurrency(earnings?.weeklyEarnings || 0), icon: TrendingUp, accent: '#c8860a', bg: '#fef8ed' },
                      { label: 'Bekleyen Ödeme', value: formatCurrency(earnings?.pendingPayout || 0), icon: Clock, accent: '#1d4ed8', bg: '#eff6ff' },
                      { label: 'Toplam Kazanç', value: formatCurrency(earnings?.totalEarnings || 0), icon: Wallet, accent: '#16a34a', bg: '#f0fdf4' },
                      { label: 'Geçmiş Ödeme', value: `${earnings?.recentPayouts?.length || 0} adet`, icon: CheckCircle, accent: '#7c3aed', bg: '#f5f3ff' },
                    ].map(stat => {
                      const Icon = stat.icon
                      return (
                        <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '18px 16px', borderTop: `3px solid ${stat.accent}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <p style={{ fontSize: '0.68rem', color: '#a89080', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={14} color={stat.accent} />
                            </div>
                          </div>
                          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
                            {stat.value}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Bekleyen ödeme uyarısı */}
                  {earnings?.pendingPayout > 0 && (
                    <div style={{ background: '#fef8ed', border: '1px solid rgba(200,134,10,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Wallet size={20} color="#c8860a" style={{ flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800', marginBottom: 2 }}>
                          {formatCurrency(earnings.pendingPayout)} ödeme bekliyor
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#a89080' }}>Her Pazartesi hesabınıza aktarılır</p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Bu Haftaki Teslimatlar */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)' }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800' }}>Bu Haftaki Teslimatlar</h2>
                      </div>
                      {!earnings?.recentDeliveries?.length ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#a89080', fontSize: '0.875rem' }}>Bu hafta henüz teslimat yok</div>
                      ) : (
                        <div>
                          {earnings.recentDeliveries.map((d: any) => (
                            <div key={d.id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(28,8,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800', marginBottom: 2 }}>{d.recipientName}</p>
                                <p style={{ fontSize: '0.72rem', color: '#a89080', fontFamily: 'monospace' }}>{d.trackingCode}</p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#16a34a' }}>+{formatCurrency(d.courierAmount || 0)}</p>
                                <p style={{ fontSize: '0.7rem', color: '#a89080', marginTop: 1 }}>{d.deliveredAt ? formatTimeAgo(d.deliveredAt) : '—'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Geçmiş Ödemeler */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(28,8,0,0.07)' }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c0800' }}>Geçmiş Ödemeler</h2>
                      </div>
                      {!earnings?.recentPayouts?.length ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#a89080', fontSize: '0.875rem' }}>Henüz ödeme yok</div>
                      ) : (
                        <div>
                          {earnings.recentPayouts.map((p: any) => (
                            <div key={p.id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(28,8,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c0800', marginBottom: 2 }}>Haftalık Ödeme</p>
                                <p style={{ fontSize: '0.72rem', color: '#a89080' }}>{formatTimeAgo(p.weekStart)}</p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800' }}>{formatCurrency(p.netAmount)}</p>
                                <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: p.status === 'PAID' ? '#dcfce7' : '#fef9c3', color: p.status === 'PAID' ? '#166534' : '#854d0e' }}>
                                  {p.status === 'PAID' ? 'Ödendi' : 'Bekliyor'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  )
}

// =====================
// SİPARİŞ KARTI
// =====================
function OrderCard({ order, onAccept, onReject, onUpdateStatus, onProofUpload }: {
  order: any
  onAccept: () => void
  onReject: () => void
  onUpdateStatus: (status: string) => void
  onProofUpload: (file: File) => void
}) {
  const isDone = ['DELIVERED', 'CANCELLED', 'FAILED'].includes(order.status)

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(28,8,0,0.06)' }}>
      {/* Üst Satır */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
            <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1c0800' }}>{order.recipientName}</p>
            <span style={{ fontSize: '0.67rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: getStatusBg(order.status), color: getStatusColor(order.status) }}>
              {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#a89080', fontFamily: 'monospace' }}>
            {order.trackingCode} · {formatTimeAgo(order.createdAt)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#c8860a', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
            {formatCurrency(order.price)}
          </p>
        </div>
      </div>

      {/* Adres Bilgileri */}
      {!isDone && (
        <div style={{ background: '#faf9f6', borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c8860a', marginTop: 5, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.65rem', color: '#a89080', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>Alınacak</p>
              <p style={{ fontSize: '0.85rem', color: '#4a3020', lineHeight: 1.45 }}>{order.senderAddress}</p>
            </div>
          </div>
          <div style={{ borderLeft: '1px dashed rgba(28,8,0,0.12)', height: 10, marginLeft: 3 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <MapPin size={8} color="#1c0800" style={{ marginTop: 5, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.65rem', color: '#a89080', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>Teslim Edilecek</p>
              <p style={{ fontSize: '0.85rem', color: '#4a3020', lineHeight: 1.45 }}>{order.recipientAddress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Telefon + Yol Tarifi */}
      {!isDone && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <a href={`tel:${order.recipientPhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#f0ede8', color: '#1c0800', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
            <Phone size={13} />
            {order.recipientPhone}
          </a>
          <a href={getCourierNavigationUrl(order)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#1c0800', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
            <Navigation size={13} />
            Yol Tarifi
          </a>
        </div>
      )}

      {/* Aksiyon Butonları */}
      {!isDone && (
        <div style={{ display: 'flex', gap: 8 }}>
          {order.status === 'CONFIRMED' && (
            <>
              <button onClick={onAccept} style={{ flex: 2, padding: '12px 0', background: '#c8860a', color: '#1c0800', border: 'none', borderRadius: 9, fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(200,134,10,0.3)' }}>
                Kabul Et
              </button>
              <button onClick={onReject} style={{ flex: 1, padding: '12px 0', background: '#f0ede8', color: '#7a6050', border: 'none', borderRadius: 9, fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                Reddet
              </button>
            </>
          )}
          {order.status === 'PICKING_UP' && (
            <button onClick={() => onUpdateStatus('IN_TRANSIT')} style={{ flex: 1, padding: '12px 0', background: '#1c0800', color: '#fff', border: 'none', borderRadius: 9, fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Package size={15} />
              Paketi Aldım, Yoldayım
            </button>
          )}
          {order.status === 'IN_TRANSIT' && (
            <label style={{ flex: 1, padding: '12px 0', background: '#16a34a', color: '#fff', borderRadius: 9, fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, userSelect: 'none' }}>
              <Camera size={15} />
              Teslim Fotoğrafı Çek
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onProofUpload(file)
                }}
              />
            </label>
          )}
        </div>
      )}

      {/* Tamamlanan özet */}
      {isDone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {order.status === 'DELIVERED'
            ? <CheckCircle size={15} color="#16a34a" />
            : <XCircle size={15} color="#dc2626" />
          }
          <span style={{ fontSize: '0.82rem', color: order.status === 'DELIVERED' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
            {order.status === 'DELIVERED' ? 'Başarıyla teslim edildi' : 'İptal / Başarısız'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#a89080', marginLeft: 4 }}>· {formatTimeAgo(order.updatedAt || order.createdAt)}</span>
        </div>
      )}
    </div>
  )
}

function getStatusBg(status: string) {
  const map: Record<string, string> = {
    PENDING: '#fef9c3', CONFIRMED: '#dbeafe', PICKING_UP: '#ede9fe',
    IN_TRANSIT: '#ffedd5', DELIVERED: '#dcfce7', CANCELLED: '#f3f4f6', FAILED: '#fee2e2',
  }
  return map[status] || '#f3f4f6'
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: '#854d0e', CONFIRMED: '#1e40af', PICKING_UP: '#5b21b6',
    IN_TRANSIT: '#9a3412', DELIVERED: '#166534', CANCELLED: '#4b5563', FAILED: '#991b1b',
  }
  return map[status] || '#4b5563'
}

function getCourierNavigationUrl(order: any) {
  const isPickup = order.status === 'PICKING_UP'
  const lat = isPickup ? order.senderLat : order.recipientLat
  const lng = isPickup ? order.senderLng : order.recipientLng
  const fallbackAddress = isPickup ? order.senderAddress : order.recipientAddress
  if (typeof lat === 'number' && typeof lng === 'number' && lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fallbackAddress)}`
}
