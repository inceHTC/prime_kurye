'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import toast from 'react-hot-toast'

export default function IletisimPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Tüm alanları doldurun')
      return
    }
    setIsLoading(true)
    // Gerçek entegrasyonda API'ye gönderilir
    await new Promise(r => setTimeout(r, 1500))
    setSent(true)
    setIsLoading(false)
    toast.success('Mesajınız alındı!')
  }

  const contacts = [
    { icon: Phone, label: 'Telefon', value: '0212 123 45 67', href: 'tel:+902121234567', sub: 'Hf içi 08:00-22:00' },
    { icon: Mail, label: 'E-posta', value: 'destek@primekurye.com', href: 'mailto:destek@primekurye.com', sub: '24 saat içinde yanıt' },
    { icon: MapPin, label: 'Adres', value: 'İstanbul, Türkiye', href: '#', sub: 'Tüm İstanbul\'a hizmet' },
    { icon: Clock, label: 'Çalışma Saatleri', value: 'Hf içi 08:00-22:00', href: '#', sub: 'Hf sonu 09:00-18:00' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <div style={{ background: '#1c0800', padding: '56px 24px 64px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#fff', marginBottom: 12 }}>
          Bize Ulaşın
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.50)', maxWidth: 480, margin: '0 auto' }}>
          Sorularınız, önerileriniz veya şikayetleriniz için her zaman buradayız.
        </p>
      </div>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* İletişim kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 48 }}>
          {contacts.map(c => {
            const Icon = c.icon
            return (
              <a key={c.label} href={c.href} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 18px', textDecoration: 'none', display: 'block', transition: 'border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,134,10,0.30)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,8,0,0.08)' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={18} color="#c8860a" />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#a89080', fontWeight: 600, marginBottom: 4 }}>{c.label}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c0800', marginBottom: 2 }}>{c.value}</p>
                <p style={{ fontSize: '0.75rem', color: '#a89080' }}>{c.sub}</p>
              </a>
            )
          })}
        </div>

        {/* Form + sıkça sorulan */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="contact-grid">

          {/* Form */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '28px 24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1c0800', marginBottom: 20 }}>Mesaj Gönder</h2>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={30} color="#16a34a" />
                </div>
                <h3 style={{ fontWeight: 700, color: '#1c0800', marginBottom: 8 }}>Mesajınız Alındı!</h3>
                <p style={{ fontSize: '0.875rem', color: '#a89080' }}>24 saat içinde e-posta ile dönüş yapacağız.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Ad Soyad</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Adınız Soyadınız" />
                </div>
                <div>
                  <label className="label">E-posta</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" placeholder="ornek@email.com" />
                </div>
                <div>
                  <label className="label">Konu</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input">
                    <option value="">Konu seçin...</option>
                    <option value="siparis">Sipariş Sorunu</option>
                    <option value="odeme">Ödeme Sorunu</option>
                    <option value="kurye">Kurye Şikayeti</option>
                    <option value="teknik">Teknik Sorun</option>
                    <option value="isletme">İşletme Hesabı</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="label">Mesajınız</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="input"
                    placeholder="Mesajınızı yazın..."
                    rows={4}
                    style={{ resize: 'vertical', minHeight: 100 }}
                  />
                </div>
                <button type="submit" disabled={isLoading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 0', background: '#c8860a', color: '#1c0800',
                  border: 'none', borderRadius: 8, cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.95rem',
                  opacity: isLoading ? 0.7 : 1,
                }}>
                  {isLoading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Gönderiliyor...</> : <><Send size={16} /> Gönder</>}
                </button>
              </form>
            )}
          </div>

          {/* Sık sorulan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px 22px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800', marginBottom: 14 }}>Hızlı Bağlantılar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Sipariş Takibi', href: '/takip' },
                  { label: 'Sık Sorulan Sorular', href: '/sss' },
                  { label: 'API Dökümantasyon', href: '/api-docs' },
                  { label: 'Kurye Ol', href: '/kurye-ol' },
                ].map(l => (
                  <Link key={l.label} href={l.href} style={{ fontSize: '0.875rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    → {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div style={{ background: '#1c0800', borderRadius: 14, padding: '24px 22px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: 10 }}>Acil Durum</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 14 }}>
                Aktif siparişinizle ilgili acil sorun yaşıyorsanız doğrudan arayın.
              </p>
              <a href="tel:+902121234567" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', background: '#c8860a', color: '#1c0800',
                borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
              }}>
                <Phone size={15} /> 0212 123 45 67
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}