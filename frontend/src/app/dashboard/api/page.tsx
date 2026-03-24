'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, ArrowLeft, Key, Plus, Copy, Trash2,
  CheckCircle, AlertTriangle, Eye, EyeOff, RefreshCw, Shield,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function ApiKeysPage() {
  const router = useRouter()
  const { user, accessToken, _hasHydrated } = useAuthStore()
  const [keys, setKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!accessToken) { router.push('/giris'); return }
    if (user?.role !== 'BUSINESS') { router.push('/dashboard'); return }
    fetchKeys()
  }, [_hasHydrated, accessToken])

  const fetchKeys = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/business/api-keys')
      if (res.data.success) setKeys(res.data.data.keys)
    } catch {
      toast.error('Anahtarlar yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newKeyName.trim()) { toast.error('Anahtar adı girin'); return }
    setCreating(true)
    try {
      const res = await api.post('/business/api-keys', { name: newKeyName.trim() })
      if (res.data.success) {
        setNewlyCreatedKey(res.data.data.key)
        setShowNewKey(true)
        setNewKeyName('')
        setShowCreateForm(false)
        fetchKeys()
        toast.success('API anahtarı oluşturuldu')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Oluşturulamadı')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`"${name}" anahtarını iptal etmek istediğinize emin misiniz?`)) return
    setRevoking(id)
    try {
      await api.delete(`/business/api-keys/${id}`)
      toast.success('Anahtar iptal edildi')
      fetchKeys()
    } catch {
      toast.error('İptal edilemedi')
    } finally {
      setRevoking(null)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Kopyalandı!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!_hasHydrated || !user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', padding: 6 }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={13} color="#1c0800" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff' }}>
              VIN<span style={{ color: '#c8860a' }}>KURYE</span>
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', marginLeft: 4 }}>· API Yönetimi</span>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>

        {/* Başlık */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', marginBottom: 6 }}>API Anahtarları</h1>
          <p style={{ fontSize: '0.875rem', color: '#7a6050' }}>
            E-ticaret sitenizi veya uygulamanızı VinKurye'ye entegre etmek için API anahtarı oluşturun.
          </p>
        </div>

        {/* Yeni oluşturulan anahtar uyarısı */}
        {newlyCreatedKey && (
          <div style={{ background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.30)', borderRadius: 14, padding: '20px 22px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CheckCircle size={18} color="#16a34a" />
              <p style={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>Anahtar oluşturuldu — şimdi kopyalayın!</p>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#166534', marginBottom: 14 }}>
              Bu anahtarı güvenli bir yerde saklayın. Bir daha tam olarak gösterilmeyecek.
            </p>
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid rgba(22,163,74,0.20)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <code style={{ flex: 1, fontSize: '0.82rem', color: '#1c0800', fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>
                {showNewKey ? newlyCreatedKey : newlyCreatedKey.slice(0, 12) + '●●●●●●●●●●●●●●●●●●●●'}
              </code>
              <button onClick={() => setShowNewKey(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a89080', padding: 4, flexShrink: 0 }}>
                {showNewKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button
                onClick={() => handleCopy(newlyCreatedKey)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: copied ? '#16a34a' : '#1c0800', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.78rem', flexShrink: 0, transition: 'background 0.2s' }}>
                <Copy size={13} />
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
            <button onClick={() => setNewlyCreatedKey(null)} style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#a89080', padding: 0 }}>
              Anladım, kapat
            </button>
          </div>
        )}

        {/* Anahtar oluştur */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showCreateForm ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={16} color="#c8860a" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800' }}>Yeni Anahtar Oluştur</p>
                <p style={{ fontSize: '0.72rem', color: '#a89080', marginTop: 1 }}>Maksimum 5 aktif anahtar</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#c8860a', color: '#1c0800', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.82rem' }}>
              <Plus size={14} />
              Oluştur
            </button>
          </div>

          {showCreateForm && (
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Anahtar adı (ör. Shopify Mağaza, Test)"
                style={{ flex: 1, padding: '10px 14px', border: '1px solid rgba(28,8,0,0.15)', borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem', color: '#1c0800', outline: 'none' }}
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                style={{ padding: '10px 20px', background: '#1c0800', color: '#fff', border: 'none', borderRadius: 8, cursor: creating ? 'not-allowed' : 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.82rem', opacity: creating ? 0.7 : 1 }}>
                {creating ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
              <button onClick={() => setShowCreateForm(false)} style={{ padding: '10px 14px', background: '#f0ede8', color: '#4a3020', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.82rem' }}>
                İptal
              </button>
            </div>
          )}
        </div>

        {/* Anahtar listesi */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(28,8,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c0800' }}>Mevcut Anahtarlar</h2>
            <button onClick={fetchKeys} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a89080', display: 'flex', padding: 4 }}>
              <RefreshCw size={14} />
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#a89080' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: '0.82rem' }}>Yükleniyor...</p>
            </div>
          ) : keys.filter(k => k.isActive).length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Key size={32} color="rgba(28,8,0,0.12)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontWeight: 700, color: '#4a3020', marginBottom: 4 }}>Henüz API anahtarı yok</p>
              <p style={{ fontSize: '0.82rem', color: '#a89080' }}>Yukarıdan yeni bir anahtar oluşturun</p>
            </div>
          ) : (
            keys.filter(k => k.isActive).map((k: any) => (
              <div key={k.id} style={{ padding: '16px 22px', borderBottom: '1px solid rgba(28,8,0,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Key size={15} color="#16a34a" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c0800', marginBottom: 3 }}>{k.name}</p>
                  <code style={{ fontSize: '0.75rem', color: '#a89080', fontFamily: 'ui-monospace, monospace' }}>{k.key}</code>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: '0.68rem', color: '#a89080' }}>
                      Oluşturuldu: {new Date(k.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                    {k.lastUsedAt && (
                      <span style={{ fontSize: '0.68rem', color: '#a89080' }}>
                        Son kullanım: {new Date(k.lastUsedAt).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(k.id, k.name)}
                  disabled={revoking === k.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 7, cursor: revoking === k.id ? 'not-allowed' : 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.75rem', flexShrink: 0, opacity: revoking === k.id ? 0.6 : 1 }}>
                  <Trash2 size={12} />
                  {revoking === k.id ? 'İptal ediliyor...' : 'İptal Et'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Kullanım rehberi */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Shield size={16} color="#c8860a" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c0800' }}>API Kullanım Rehberi</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4a3020', marginBottom: 6 }}>Kimlik Doğrulama</p>
              <div style={{ background: '#1c0800', borderRadius: 8, padding: '12px 16px' }}>
                <code style={{ fontSize: '0.78rem', color: '#c8860a', fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre' }}>
                  {`X-API-Key: vk_live_xxxxxxxxxxxx`}
                </code>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4a3020', marginBottom: 6 }}>Sipariş Oluştur</p>
              <div style={{ background: '#1c0800', borderRadius: 8, padding: '12px 16px', overflowX: 'auto' }}>
                <code style={{ fontSize: '0.75rem', color: '#e5e7eb', fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre' }}>
{`POST /api/orders
{
  "senderName": "Gönderen Adı",
  "senderPhone": "05xx xxx xx xx",
  "senderAddress": "Tam adres",
  "senderLat": 41.015,
  "senderLng": 28.979,
  "recipientName": "Alıcı Adı",
  "recipientPhone": "05xx xxx xx xx",
  "recipientAddress": "Teslimat adresi",
  "recipientLat": 40.991,
  "recipientLng": 29.028,
  "deliveryType": "EXPRESS",
  "packageDesc": "Paket açıklaması"
}`}
                </code>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4a3020', marginBottom: 6 }}>Sipariş Takip</p>
              <div style={{ background: '#1c0800', borderRadius: 8, padding: '12px 16px' }}>
                <code style={{ fontSize: '0.78rem', color: '#c8860a', fontFamily: 'ui-monospace, monospace' }}>
                  GET /api/orders/track/:trackingCode
                </code>
              </div>
            </div>

            <div style={{ background: '#fef8ed', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10 }}>
              <AlertTriangle size={15} color="#c8860a" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.75rem', color: '#7a6050', lineHeight: 1.6 }}>
                API anahtarlarınızı kaynak kodunuza gömmeyin. Ortam değişkeni (env) kullanın.
                Şüpheli aktivite durumunda anahtarı hemen iptal edin.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
