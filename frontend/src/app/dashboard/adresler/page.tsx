'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Trash2, Star, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

type SavedAddress = {
  id: string
  label: string
  address: string
  lat: number | null
  lng: number | null
  isDefault: boolean
}

export default function AdresDefteri() {
  const router = useRouter()
  const { accessToken, _hasHydrated } = useAuthStore()
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', address: '', isDefault: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!accessToken) { router.push('/giris'); return }
    fetchAddresses()
  }, [_hasHydrated, accessToken])

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses')
      if (res.data.success) setAddresses(res.data.data)
    } catch {
      toast.error('Adresler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.label.trim() || !form.address.trim()) {
      toast.error('Etiket ve adres zorunludur')
      return
    }
    setSaving(true)
    try {
      const res = await api.post('/addresses', form)
      if (res.data.success) {
        toast.success('Adres kaydedildi')
        setAddresses(prev => [...prev, res.data.data])
        setForm({ label: '', address: '', isDefault: false })
        setShowForm(false)
      }
    } catch {
      toast.error('Adres kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/addresses/${id}`)
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast.success('Adres silindi')
    } catch {
      toast.error('Adres silinemedi')
    }
  }

  const s: Record<string, any> = {
    page: { minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" },
    header: { background: '#1c0800', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 12 },
    container: { maxWidth: 640, margin: '0 auto', padding: '24px 16px' },
    card: { background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '16px 18px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 12 },
    label: { fontSize: '0.75rem', color: '#a89080', marginBottom: 2 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid rgba(28,8,0,0.12)', borderRadius: 8, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const },
    btn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#c8860a', color: '#1c0800', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' },
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', textDecoration: 'none', padding: 4 }}>
          <ArrowLeft size={18} />
        </Link>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Adres Defteri</span>
      </header>

      <div style={s.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ color: '#7a6050', fontSize: '0.875rem' }}>
            {addresses.length} kayıtlı adres
          </p>
          <button style={s.btn} onClick={() => setShowForm(!showForm)}>
            <Plus size={15} /> Yeni Adres
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#fef8ed', border: '1px solid rgba(200,134,10,0.25)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800', marginBottom: 14 }}>Yeni Adres Ekle</p>
            <div style={{ marginBottom: 10 }}>
              <p style={s.label}>Etiket (Ev, İş, Depo vb.)</p>
              <input style={s.input} value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Örn: Ev" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <p style={s.label}>Adres</p>
              <input style={s.input} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Tam adres yazın" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#4a3020', marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
              Varsayılan adres olarak ayarla
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.btn} onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ ...s.btn, background: '#f0ede8', color: '#7a6050' }}>
                İptal
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#a89080', padding: 40 }}>Yükleniyor...</p>
        ) : addresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a89080' }}>
            <MapPin size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Kayıtlı adres yok</p>
            <p style={{ fontSize: '0.875rem' }}>Sık kullandığınız adresleri kaydedin</p>
          </div>
        ) : (
          addresses.map(addr => (
            <div key={addr.id} style={s.card}>
              <div style={{ width: 38, height: 38, background: addr.isDefault ? '#fef8ed' : '#f5f3ef', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {addr.isDefault ? <Star size={16} color="#c8860a" fill="#c8860a" /> : <MapPin size={16} color="#a89080" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800', marginBottom: 2 }}>{addr.label}</p>
                <p style={{ fontSize: '0.8rem', color: '#7a6050', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr.address}</p>
              </div>
              <button onClick={() => handleDelete(addr.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#d1574a', flexShrink: 0 }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
