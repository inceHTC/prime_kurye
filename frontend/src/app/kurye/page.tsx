'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, LogOut, MapPin, Phone, Package,
  CheckCircle, XCircle, Clock, Navigation,
  TrendingUp, Star, Wifi, WifiOff, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { cn, formatCurrency, formatTimeAgo, ORDER_STATUS_LABELS } from '@/lib/utils'

export default function KuryePanelPage() {
  const router = useRouter()
  const { user, clearAuth, accessToken } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    rating: 0,
    totalDeliveries: 0,
  })

  useEffect(() => {
    if (!accessToken) { router.push('/giris'); return }
    if (user?.role !== 'COURIER') { router.push('/dashboard'); return }
    fetchData()
  }, [accessToken])

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
      setIsOnline(!isOnline)
      toast.success(isOnline ? 'Çevrimdışı oldunuz' : 'Çevrimiçi oldunuz!')
    } catch {
      setIsOnline(!isOnline)
      toast.success(isOnline ? 'Çevrimdışı oldunuz' : 'Çevrimiçi oldunuz!')
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
  const handleLogout = () => {
    clearAuth()
    toast.success('Çıkış yapıldı')
    router.push('/')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{
        background: '#1c0800',
        padding: '0 20px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        {/* Sol — Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#1c0800" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' }}>
            VIN<span style={{ color: '#c8860a' }}>KURYE</span>
          </span>
        </Link>

        {/* Sağ — Kazançlarım + kullanıcı + çıkış */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/kurye/kazanc" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            background: 'rgba(200,134,10,0.15)',
            color: '#c8860a', textDecoration: 'none',
            fontSize: '0.82rem', fontWeight: 600,
            fontFamily: "'Barlow', sans-serif",
          }}>
            <TrendingUp size={14} />
            Kazançlarım
          </Link>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.50)', paddingLeft: 4 }}>
            {user.fullName}
          </span>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.50)', padding: 6, borderRadius: 6,
            display: 'flex', alignItems: 'center',
          }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 100px' }}>

        {/* Online/Offline toggle */}
        <div style={{
          background: isOnline ? '#1c0800' : '#fff',
          border: `2px solid ${isOnline ? '#c8860a' : 'rgba(28,8,0,0.12)'}`,
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: isOnline ? 'rgba(200,134,10,0.15)' : 'rgba(28,8,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isOnline
                ? <Wifi size={22} color="#c8860a" />
                : <WifiOff size={22} color="#a89080" />
              }
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: isOnline ? '#fff' : '#1c0800', marginBottom: 2 }}>
                {isOnline ? 'Çevrimiçisiniz' : 'Çevrimdışısınız'}
              </p>
              <p style={{ fontSize: '0.82rem', color: isOnline ? 'rgba(255,255,255,0.55)' : '#a89080' }}>
                {isOnline ? 'Sipariş atamaya açıksınız' : 'Sipariş almıyorsunuz'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleOnline}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              background: isOnline ? '#c8860a' : '#1c0800',
              color: isOnline ? '#1c0800' : '#fff',
            }}
          >
            {isOnline ? 'Kapat' : 'Aç'}
          </button>
        </div>

        {/* İstatistikler */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Bugün Teslimat', value: stats.todayDeliveries, icon: Package, color: '#c8860a' },
            { label: 'Bugün Kazanç', value: formatCurrency(stats.todayEarnings), icon: TrendingUp, color: '#16a34a' },
            { label: 'Puanım', value: stats.rating > 0 ? `${stats.rating.toFixed(1)} ★` : '—', icon: Star, color: '#c8860a' },
            { label: 'Toplam Teslimat', value: stats.totalDeliveries, icon: CheckCircle, color: '#1c0800' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid rgba(28,8,0,0.08)',
                padding: '16px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: '0.78rem', color: '#a89080', fontWeight: 500 }}>{stat.label}</p>
                  <Icon size={16} color={stat.color} />
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {stat.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Sipariş listesi */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid rgba(28,8,0,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(28,8,0,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1c0800' }}>
              Aktif Siparişler
            </h2>
            <button onClick={fetchData} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#a89080', padding: 4, borderRadius: 6,
            }}>
              <RefreshCw size={16} />
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#a89080' }}>
              <RefreshCw size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: '0.875rem' }}>Yükleniyor...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Package size={40} color="rgba(28,8,0,0.10)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontWeight: 600, color: '#4a3020', marginBottom: 4 }}>Aktif sipariş yok</p>
              <p style={{ fontSize: '0.85rem', color: '#a89080' }}>
                {isOnline ? 'Yeni sipariş bekleniyor...' : 'Sipariş almak için çevrimiçi olun'}
              </p>
            </div>
          ) : (
            <div>
              {orders.map((order: any) => (
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
    </div>
  )
}

// ================================
// SİPARİŞ KARTI
// ================================
function OrderCard({ order, onAccept, onReject, onUpdateStatus }: {
  order: any
  onAccept: () => void
  onReject: () => void
  onUpdateStatus: (status: string) => void
}) {
  return (
    <div style={{
      padding: '18px 20px',
      borderBottom: '1px solid rgba(28,8,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800', marginBottom: 2 }}>
            {order.recipientName}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#a89080', fontFamily: 'monospace' }}>
            {order.trackingCode}
          </p>
        </div>
        <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#c8860a' }}>
          {formatCurrency(order.price)}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c8860a', marginTop: 5, flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: '#4a3020', lineHeight: 1.5 }}>{order.senderAddress}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <MapPin size={8} color="#1c0800" style={{ marginTop: 5, flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: '#4a3020', lineHeight: 1.5 }}>{order.recipientAddress}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: '0.82rem', color: '#a89080' }}>
          {formatTimeAgo(order.createdAt)}
        </p>
        <a href={`tel:${order.recipientPhone}`} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.82rem', fontWeight: 600, color: '#1c0800',
          textDecoration: 'none',
        }}>
          <Phone size={13} />
          {order.recipientPhone}
        </a>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {order.status === 'CONFIRMED' && (
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            <button onClick={onAccept} style={{ flex: 2, padding: '11px 0', background: '#c8860a', color: '#1c0800', border: 'none', borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
              Kabul Et
            </button>
            <button onClick={onReject} style={{ flex: 1, padding: '11px 0', background: 'rgba(28,8,0,0.06)', color: '#4a3020', border: 'none', borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
              Reddet
            </button>
          </div>
        )}
        {order.status === 'PICKING_UP' && (
          <button onClick={() => onUpdateStatus('IN_TRANSIT')} style={{
            flex: 1, padding: '11px 0',
            background: '#1c0800', color: '#fff',
            border: 'none', borderRadius: 8,
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 700, fontSize: '0.875rem',
            cursor: 'pointer',
          }}>
            Paketi Aldım, Yoldayım
          </button>
        )}
        {order.status === 'IN_TRANSIT' && (
          <label style={{
            flex: 1, padding: '11px 0',
            background: '#16a34a', color: '#fff',
            border: 'none', borderRadius: 8,
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 700, fontSize: '0.875rem',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
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
        <a
          href={getCourierNavigationUrl(order)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '11px 16px',
            background: 'rgba(28,8,0,0.06)',
            color: '#1c0800',
            border: 'none', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 6,
            textDecoration: 'none',
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600, fontSize: '0.875rem',
          }}
        >
          <Navigation size={15} />
          Yol Tarifi
        </a>
      </div>
    </div>
  )
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
