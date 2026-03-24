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
  LayoutDashboard, Wallet, Camera,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatCurrency, formatTimeAgo, ORDER_STATUS_LABELS } from '@/lib/utils'
import { getSocket, joinCourierRoom } from '@/lib/socket'

type OrderTab = 'PENDING' | 'ACTIVE' | 'DONE'

export default function KuryePanelPage() {
  const router = useRouter()
  const { user, clearAuth, accessToken, refreshToken, setAuth } = useAuthStore()
  const { isReady } = useRequireAuth({ roleRequired: 'COURIER', roleRedirect: '/dashboard' })
  const [orders, setOrders] = useState<any[]>([])
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<OrderTab>('PENDING')
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    rating: 0,
    totalDeliveries: 0,
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isReady) fetchData()
  }, [isReady])

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

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      toast.success('Durum güncellendi!')
      fetchData()
    } catch {
      toast.error('Durum güncellenemedi')
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.success) {
        const url = res.data.data.avatarUrl
        setAvatarUrl(url)
        // Store'daki user'ı güncelle
        if (user && accessToken && refreshToken) {
          setAuth({ ...user, avatar: url }, accessToken, refreshToken)
        }
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

  if (!isReady || !user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f0ede8', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid rgba(200,134,10,0.12)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, background: '#c8860a', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={15} color="#1c0800" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' }}>
                VIN<span style={{ color: '#c8860a' }}>KURYE</span>
              </span>
            </Link>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Kurye Paneli
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/kurye/kazanc" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(200,134,10,0.12)', color: '#c8860a', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(200,134,10,0.2)' }}>
              <TrendingUp size={13} />
              Kazançlarım
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px', borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Profil fotoğrafını değiştir"
                style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, position: 'relative' }}
              >
                {avatarUrl ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${avatarUrl}`}
                    alt="Avatar"
                    width={28}
                    height={28}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: '#fff' }}>
                    {uploadingAvatar ? '...' : initials}
                  </div>
                )}
              </button>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                {user.fullName.split(' ')[0]}
              </span>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', padding: '8px', display: 'flex', borderRadius: 8 }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 100px' }}>

        {/* Online/Offline Kartı */}
        <div style={{
          background: isOnline ? 'linear-gradient(135deg, #1c0800 0%, #3d1a00 100%)' : '#fff',
          border: `2px solid ${isOnline ? '#c8860a' : 'rgba(28,8,0,0.10)'}`,
          borderRadius: 16, padding: '20px 24px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
        }}>
          {isOnline && (
            <>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(200,134,10,0.08)' }} />
              <div style={{ position: 'absolute', right: 60, bottom: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(200,134,10,0.05)' }} />
            </>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{ width: 58, height: 58, borderRadius: 14, overflow: 'hidden', border: isOnline ? '2px solid rgba(200,134,10,0.4)' : '2px solid rgba(28,8,0,0.12)', cursor: 'pointer', padding: 0, background: 'none', display: 'block' }}
              >
                {avatarUrl ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${avatarUrl}`}
                    alt="Profil"
                    width={58}
                    height={58}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: isOnline ? 'rgba(200,134,10,0.15)' : '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: isOnline ? '#c8860a' : '#a89080' }}>
                    {initials}
                  </div>
                )}
              </button>
              <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#1c0800', border: '2px solid', borderColor: isOnline ? '#3d1a00' : '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={10} color={isOnline ? '#c8860a' : '#a89080'} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <p style={{ fontWeight: 800, fontSize: '1.05rem', color: isOnline ? '#fff' : '#1c0800' }}>
                  {isOnline ? 'Çevrimiçisiniz' : 'Çevrimdışısınız'}
                </p>
                {isOnline && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: isOnline ? 'rgba(255,255,255,0.5)' : '#a89080' }}>
                {isOnline ? 'Sipariş atamaya açıksınız' : 'Sipariş almıyorsunuz'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleOnline}
            style={{
              padding: '11px 22px', borderRadius: 9,
              border: 'none', cursor: 'pointer',
              fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '0.875rem',
              transition: 'all 0.2s', position: 'relative',
              background: isOnline ? '#c8860a' : '#1c0800',
              color: isOnline ? '#1c0800' : '#fff',
              boxShadow: isOnline ? '0 4px 12px rgba(200,134,10,0.35)' : '0 4px 12px rgba(28,8,0,0.2)',
            }}
          >
            {isOnline ? 'Durdur' : 'Başlat'}
          </button>
        </div>

        {/* İstatistik Kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Bugün Teslimat', value: stats.todayDeliveries, icon: Package, accent: '#c8860a', bg: '#fef8ed' },
            { label: 'Bugün Kazanç', value: formatCurrency(stats.todayEarnings), icon: Wallet, accent: '#16a34a', bg: '#f0fdf4' },
            { label: 'Puanım', value: stats.rating > 0 ? `${stats.rating.toFixed(1)}` : '—', icon: Star, accent: '#f59e0b', bg: '#fffbeb', suffix: stats.rating > 0 ? '★' : '' },
            { label: 'Toplam Teslimat', value: stats.totalDeliveries, icon: CheckCircle, accent: '#2563eb', bg: '#eff6ff' },
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
                  {stat.value}{stat.suffix && <span style={{ fontSize: '1rem', marginLeft: 3 }}>{stat.suffix}</span>}
                </p>
              </div>
            )
          })}
        </div>

        {/* Sipariş Sekmeleri */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
          {/* Sekme Başlıkları */}
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
                  fontWeight: 700, fontSize: '0.82rem',
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

          {/* Yenile Butonu */}
          <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(28,8,0,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0ede8', border: 'none', cursor: 'pointer', color: '#7a6050', padding: '6px 12px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>
              <RefreshCw size={12} />
              Yenile
            </button>
          </div>

          {/* Sipariş İçeriği */}
          {isLoading ? (
            <div style={{ padding: 52, textAlign: 'center', color: '#a89080' }}>
              <RefreshCw size={22} style={{ margin: '0 auto 10px', display: 'block', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '0.85rem' }}>Yükleniyor...</p>
            </div>
          ) : tabOrders.length === 0 ? (
            <div style={{ padding: 52, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Package size={28} color="rgba(28,8,0,0.15)" />
              </div>
              <p style={{ fontWeight: 700, color: '#4a3020', marginBottom: 5 }}>
                {tab === 'PENDING' ? 'Bekleyen sipariş yok' : tab === 'ACTIVE' ? 'Aktif sipariş yok' : 'Tamamlanan sipariş yok'}
              </p>
              <p style={{ fontSize: '0.82rem', color: '#a89080' }}>
                {tab === 'PENDING' && !isOnline ? 'Sipariş almak için çevrimiçi olun' : 'Henüz kayıt yok'}
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
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Alt Navigasyon */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid rgba(28,8,0,0.10)', zIndex: 40, display: 'flex', boxShadow: '0 -4px 20px rgba(28,8,0,0.08)' }}>
        <Link href="/kurye" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0', textDecoration: 'none', background: '#fef8ed', borderTop: '2px solid #c8860a' }}>
          <LayoutDashboard size={18} color="#c8860a" />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#c8860a' }}>Panel</span>
        </Link>
        <Link href="/kurye/kazanc" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0', textDecoration: 'none', borderTop: '2px solid transparent' }}>
          <TrendingUp size={18} color="#a89080" />
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#a89080' }}>Kazançlar</span>
        </Link>
        <button onClick={toggleOnline} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', borderTop: '2px solid transparent' }}>
          {isOnline
            ? <Wifi size={18} color="#16a34a" />
            : <WifiOff size={18} color="#a89080" />
          }
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: isOnline ? '#16a34a' : '#a89080' }}>
            {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
          </span>
        </button>
        <button onClick={handleLogout} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', borderTop: '2px solid transparent' }}>
          <LogOut size={18} color="#a89080" />
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#a89080' }}>Çıkış</span>
        </button>
      </nav>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}

// =====================
// SİPARİŞ KARTI
// =====================
function OrderCard({ order, onAccept, onReject, onUpdateStatus }: {
  order: any
  onAccept: () => void
  onReject: () => void
  onUpdateStatus: (status: string) => void
}) {
  const isDone = ['DELIVERED', 'CANCELLED', 'FAILED'].includes(order.status)

  return (
    <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(28,8,0,0.06)' }}>

      {/* Üst Satır: Alıcı + Fiyat */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1c0800' }}>
              {order.recipientName}
            </p>
            <span style={{ fontSize: '0.67rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: getStatusBg(order.status), color: getStatusColor(order.status) }}>
              {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#a89080', fontFamily: 'monospace' }}>
            {order.trackingCode} · {formatTimeAgo(order.createdAt)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 800, fontSize: '1.15rem', color: '#c8860a', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
            {formatCurrency(order.price)}
          </p>
        </div>
      </div>

      {/* Adres Bilgileri */}
      {!isDone && (
        <div style={{ background: '#faf9f6', borderRadius: 10, padding: '12px 14px', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c8860a', marginTop: 5, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.67rem', color: '#a89080', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>Alınacak</p>
              <p style={{ fontSize: '0.82rem', color: '#4a3020', lineHeight: 1.45 }}>{order.senderAddress}</p>
            </div>
          </div>
          <div style={{ borderLeft: '1px dashed rgba(28,8,0,0.12)', height: 10, marginLeft: 3 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <MapPin size={8} color="#1c0800" style={{ marginTop: 5, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.67rem', color: '#a89080', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>Teslim Edilecek</p>
              <p style={{ fontSize: '0.82rem', color: '#4a3020', lineHeight: 1.45 }}>{order.recipientAddress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Telefon + Yol Tarifi */}
      {!isDone && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <a href={`tel:${order.recipientPhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: '#f0ede8', color: '#1c0800', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700 }}>
            <Phone size={13} />
            {order.recipientPhone}
          </a>
          <a href={getCourierNavigationUrl(order)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: '#1c0800', color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700 }}>
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
              <button onClick={onAccept} style={{ flex: 2, padding: '12px 0', background: '#c8860a', color: '#1c0800', border: 'none', borderRadius: 9, fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(200,134,10,0.3)' }}>
                Kabul Et
              </button>
              <button onClick={onReject} style={{ flex: 1, padding: '12px 0', background: '#f0ede8', color: '#7a6050', border: 'none', borderRadius: 9, fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                Reddet
              </button>
            </>
          )}
          {order.status === 'PICKING_UP' && (
            <button onClick={() => onUpdateStatus('IN_TRANSIT')} style={{ flex: 1, padding: '12px 0', background: '#1c0800', color: '#fff', border: 'none', borderRadius: 9, fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Package size={15} />
              Paketi Aldım, Yoldayım
            </button>
          )}
          {order.status === 'IN_TRANSIT' && (
            <label style={{ flex: 1, padding: '12px 0', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 9, fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              📷 Teslim Fotoğrafı Çek
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const formData = new FormData()
                  formData.append('proof', file)
                  try {
                    await api.post(`/orders/${order.id}/proof`, formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    })
                    toast.success('Teslim onaylandı!')
                    onUpdateStatus('DELIVERED')
                  } catch {
                    toast.error('Fotoğraf yüklenemedi')
                  }
                }}
              />
            </label>
          )}
        </div>
      )}

      {/* Tamamlanan sipariş özeti */}
      {isDone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {order.status === 'DELIVERED'
            ? <CheckCircle size={15} color="#16a34a" />
            : <XCircle size={15} color="#dc2626" />
          }
          <span style={{ fontSize: '0.8rem', color: order.status === 'DELIVERED' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
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
