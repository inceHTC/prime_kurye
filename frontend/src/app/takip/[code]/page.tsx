'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import {
  ArrowLeft,
  Bike,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Phone,
  Search,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { orderService } from '@/lib/orderService'
import { useAuthStore } from '@/store/authStore'
import {
  ORDER_STATUS_LABELS,
  formatCurrency,
  formatDateTime,
  isValidTrackingCode,
  normalizeTrackingCode,
} from '@/lib/utils'

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''

const statusSteps = [
  { key: 'PENDING', label: 'Sipariş Alındı', icon: Package },
  { key: 'CONFIRMED', label: 'Onaylandı', icon: CheckCircle },
  { key: 'PICKING_UP', label: 'Kurye Yolda', icon: Bike },
  { key: 'IN_TRANSIT', label: 'Teslimatta', icon: Bike },
  { key: 'DELIVERED', label: 'Teslim Edildi', icon: CheckCircle },
]

const statusOrder = ['PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT', 'DELIVERED']

export default function TakipDetayPage() {
  const params = useParams()
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [rating, setRating] = useState(5)

  const rawCode = String(params.code || '')
  const normalizedCode = useMemo(() => normalizeTrackingCode(rawCode), [rawCode])
  const isValidCode = isValidTrackingCode(normalizedCode)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  })

  useEffect(() => {
    if (!rawCode) return

    if (normalizedCode !== rawCode) {
      router.replace(`/takip/${normalizedCode}`)
      return
    }

    if (!isValidCode) {
      setIsLoading(false)
      setError('Geçersiz takip kodu formatı')
      return
    }

    fetchOrder()
    const interval = setInterval(fetchOrder, 15000)
    return () => clearInterval(interval)
  }, [rawCode, normalizedCode, isValidCode])

  const fetchOrder = async () => {
    try {
      const response = await orderService.trackOrder(normalizedCode)
      if (response.success) {
        setOrder(response.data)
        setError('')
      }
    } catch {
      setError('Sipariş bulunamadı')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEscrowPayment = async () => {
    setIsPaying(true)
    try {
      const response = await api.post('/escrow/initiate', { orderId: order.id })
      if (response.data.success) {
        toast.success('Ödeme alındı. Kurye yola çıktı.')
        fetchOrder()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ödeme başarısız')
    } finally {
      setIsPaying(false)
    }
  }

  const handleConfirmDelivery = async () => {
    setIsConfirming(true)
    try {
      const response = await api.post('/escrow/confirm', { orderId: order.id, rating })
      if (response.data.success) {
        toast.success('Teslimat onaylandı')
        fetchOrder()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Onay başarısız')
    } finally {
      setIsConfirming(false)
    }
  }

  const currentStepIndex = order ? statusOrder.indexOf(order.status) : -1

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <header style={{ background: '#1c0800', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/takip" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', padding: 6 }}>
            <ArrowLeft size={20} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#1c0800" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff' }}>
              PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>· Sipariş Takip</span>
          </div>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.75rem',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              color: '#c8860a',
              background: 'rgba(200,134,10,0.15)',
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            {normalizedCode}
          </span>
        </div>
      </header>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
          <Loader2 size={32} color="#c8860a" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <ShieldAlert size={48} color="rgba(28,8,0,0.18)" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontWeight: 700, color: '#1c0800', marginBottom: 6 }}>{error}</p>
          <p style={{ fontSize: '0.875rem', color: '#a89080', marginBottom: 20 }}>
            Takip kodu: <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{normalizedCode || '—'}</span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/takip" className="btn-primary">
              <Search size={16} />
              Yeni Kod Sorgula
            </Link>
            <Link href="/" className="btn-outline">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      ) : order && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="takip-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {order.status === 'PICKING_UP' && order.escrowStatus === 'PENDING' && accessToken && (
                <div style={{ background: '#fef8ed', borderRadius: 14, border: '2px solid rgba(200,134,10,0.30)', padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(200,134,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bike size={20} color="#c8860a" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800' }}>Kurye paketi aldı</p>
                      <p style={{ fontSize: '0.8rem', color: '#a89080', marginTop: 1 }}>Ödemenizi yaparak teslimatı başlatın</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 14px', background: '#fff', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.875rem', color: '#7a6050' }}>Ödenecek tutar</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#c8860a', lineHeight: 1 }}>
                      {formatCurrency(order.price)}
                    </span>
                  </div>
                  <button
                    onClick={handleEscrowPayment}
                    disabled={isPaying}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '13px 0',
                      background: '#c8860a',
                      color: '#1c0800',
                      border: 'none',
                      borderRadius: 8,
                      cursor: isPaying ? 'not-allowed' : 'pointer',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      opacity: isPaying ? 0.7 : 1,
                    }}
                  >
                    {isPaying ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> İşleniyor...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} /> Ödemeyi Onayla
                      </>
                    )}
                  </button>
                </div>
              )}

              {order.status === 'DELIVERED' && order.escrowStatus === 'HELD' && accessToken && (
                <div style={{ background: '#f0fdf4', borderRadius: 14, border: '2px solid rgba(22,163,74,0.25)', padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(22,163,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={20} color="#16a34a" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800' }}>Paket teslim edildi</p>
                      <p style={{ fontSize: '0.8rem', color: '#a89080', marginTop: 1 }}>Teslimi onaylayın, kurye ödemeyi alsın</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: '0.8rem', color: '#4a3020', fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>Kurye değerlendirmesi</p>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.75rem', lineHeight: 1, color: star <= rating ? '#c8860a' : '#e4e0d8' }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmDelivery}
                    disabled={isConfirming}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '13px 0',
                      background: '#16a34a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: isConfirming ? 'not-allowed' : 'pointer',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      opacity: isConfirming ? 0.7 : 1,
                    }}
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Onaylanıyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} /> Evet, Teslim Aldım
                      </>
                    )}
                  </button>
                </div>
              )}

              {order.status === 'DELIVERED' && order.escrowStatus === 'RELEASED' && (
                <div style={{ background: '#f0fdf4', borderRadius: 14, border: '1px solid rgba(22,163,74,0.20)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircle size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 600 }}>
                    Teslimat onaylandı. Ödeme kuryeye aktarıldı.
                  </p>
                </div>
              )}

              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1c0800' }}>Sipariş Durumu</h2>
                  <span style={{ padding: '4px 12px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, ...getStatusStyle(order.status) }}>
                    {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                  </span>
                </div>

                {order.status !== 'CANCELLED' && order.status !== 'FAILED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon
                      const isDone = index <= currentStepIndex
                      const isCurrent = index === currentStepIndex

                      return (
                        <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isDone ? '#c8860a' : '#f5f3ef',
                            }}
                          >
                            <Icon size={15} color={isDone ? '#1c0800' : '#a89080'} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#c8860a' : isDone ? '#1c0800' : '#a89080' }}>
                              {step.label}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {order.courier && (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '18px 20px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c0800', marginBottom: 14 }}>Kuryeniz</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bike size={20} color="#c8860a" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1c0800' }}>{order.courier.user?.fullName}</p>
                      <p style={{ fontSize: '0.75rem', color: '#a89080', marginTop: 1 }}>Motokurye</p>
                    </div>
                    {order.courier.user?.phone && (
                      <a href={`tel:${order.courier.user.phone}`} style={{ width: 38, height: 38, background: '#f0fdf4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <Phone size={16} color="#16a34a" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '18px 20px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c0800', marginBottom: 14 }}>Güzergâh</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c8860a', marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '0.72rem', color: '#a89080', marginBottom: 2 }}>Alım noktası</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1c0800' }}>{order.senderAddress}</p>
                    </div>
                  </div>
                  <div style={{ width: 1, height: 16, background: 'rgba(28,8,0,0.10)', marginLeft: 5 }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <MapPin size={10} color="#1c0800" style={{ marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '0.72rem', color: '#a89080', marginBottom: 2 }}>Teslimat noktası</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1c0800' }}>{order.recipientAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '18px 20px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c0800', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} color="#c8860a" /> Zaman Bilgisi
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Sipariş tarihi', value: formatDateTime(order.createdAt) },
                    order.estimatedAt && { label: 'Tahmini teslimat', value: formatDateTime(order.estimatedAt) },
                    order.deliveredAt && { label: 'Teslim tarihi', value: formatDateTime(order.deliveredAt) },
                  ]
                    .filter(Boolean)
                    .map((item: any) => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: '#a89080' }}>{item.label}</span>
                        <span style={{ fontWeight: 500, color: '#1c0800' }}>{item.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden', position: 'sticky', top: 24, height: 600 }}>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={order.courier?.currentLat ? { lat: order.courier.currentLat, lng: order.courier.currentLng } : { lat: 41.0082, lng: 28.9784 }}
                    zoom={13}
                    options={{ disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false }}
                  >
                    {order.courier?.currentLat && (
                      <Marker position={{ lat: order.courier.currentLat, lng: order.courier.currentLng }} />
                    )}
                  </GoogleMap>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
                    <Loader2 size={32} color="#c8860a" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .takip-grid { grid-template-columns: 1fr !important; }
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
