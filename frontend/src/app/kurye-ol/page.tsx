'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Zap, ArrowLeft, Bike, Shield, Clock, TrendingUp,
  CheckCircle, Loader2, User, Phone, Mail, Lock,
  CreditCard, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

const benefits = [
  { icon: TrendingUp, title: 'Yüksek Kazanç', desc: 'Her teslimat başına %80 pay alırsın. Haftalık ödeme garantisi.' },
  { icon: Clock, title: 'Esnek Çalışma', desc: 'İstediğin saatte çalış, istediğinde mola ver. Tamamen özgürsün.' },
  { icon: Shield, title: 'Sigorta Güvencesi', desc: 'Tüm teslimatlar 10.000₺ kargo sigortası kapsamındadır.' },
  { icon: Bike, title: 'Kolay Kullanım', desc: 'Uygulama üzerinden siparişleri gör, kabul et, teslim et.' },
]

const steps = [
  { num: '01', title: 'Başvur', desc: 'Formu doldur, bilgilerini gir' },
  { num: '02', title: 'Onay', desc: 'Ekibimiz 24 saat içinde seni arar' },
  { num: '03', title: 'Başla', desc: 'Onaylanınca hemen çalışmaya başla' },
]

export default function KuryeOlPage() {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info')
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    plateNumber: '',
    hasMotorcycle: false,
    city: 'İstanbul',
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.fullName.trim()) newErrors.fullName = 'Ad soyad gerekli'
    if (!form.email.includes('@')) newErrors.email = 'Geçerli e-posta girin'
    if (!form.phone.startsWith('05') || form.phone.length !== 11) newErrors.phone = 'Geçerli telefon girin'
    if (form.password.length < 8) newErrors.password = 'Şifre en az 8 karakter olmalı'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor'
    if (!form.agreeTerms) newErrors.agreeTerms = 'Şartları kabul etmelisiniz'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsLoading(true)
    try {
      const res = await api.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'COURIER',
        plateNumber: form.plateNumber,
      })
      if (res.data.success) {
        router.push('/kurye-belgeler')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kayıt başarısız')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', padding: 6 }}>
            <ArrowLeft size={20} />
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#1c0800" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff' }}>
              PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
            </span>
          </Link>
        </div>
        <Link href="/giris" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 500 }}>
          Giriş Yap
        </Link>
      </header>

      {/* Bilgi sayfası */}
      {step === 'info' && (
        <div>
          {/* Hero */}
          <div style={{ background: '#1c0800', padding: '64px 24px 80px', textAlign: 'center' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(200,134,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Bike size={36} color="#c8860a" />
              </div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
                Prime Kurye Ailesine<br />
                <span style={{ color: '#c8860a' }}>Katıl, Kazan!</span>
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
                İstanbul'un en hızlı büyüyen kurye platformunda çalış. Esnek saatler, yüksek kazanç, haftalık ödeme garantisi.
              </p>
              <button
                onClick={() => setStep('form')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '16px 36px', background: '#c8860a', color: '#1c0800',
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '1.05rem',
                  boxShadow: '0 4px 20px rgba(200,134,10,0.40)',
                }}
              >
                Hemen Başvur <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>

            {/* Avantajlar */}
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#1c0800', textAlign: 'center', marginBottom: 40 }}>
              Neden Prime Kurye?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 60 }}>
              {benefits.map(b => {
                const Icon = b.icon
                return (
                  <div key={b.title} style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px 22px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <Icon size={22} color="#c8860a" />
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800', marginBottom: 6 }}>{b.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#7a6050', lineHeight: 1.6 }}>{b.desc}</p>
                  </div>
                )
              })}
            </div>

            {/* Nasıl çalışır */}
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#1c0800', textAlign: 'center', marginBottom: 40 }}>
              3 Adımda Başla
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 60 }} className="steps-grid">
              {steps.map((s, i) => (
                <div key={s.num} style={{ textAlign: 'center', padding: '24px 20px', background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', position: 'relative' }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '3rem', color: 'rgba(200,134,10,0.15)', lineHeight: 1, marginBottom: 8 }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c0800', marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#a89080' }}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Kazanç tablosu */}
            <div style={{ background: '#1c0800', borderRadius: 16, padding: '32px', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#fff', marginBottom: 24, textAlign: 'center' }}>
                Ne Kadar Kazanırsın?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="earn-grid">
                {[
                  { label: 'Günde 5 Teslimat', value: '~₺600', sub: 'Günlük kazanç' },
                  { label: 'Günde 10 Teslimat', value: '~₺1.200', sub: 'Günlük kazanç' },
                  { label: 'Aylık Potansiyel', value: '~₺18.000', sub: '20 iş günü' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', padding: '20px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: 10 }}>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>{item.label}</p>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#c8860a', lineHeight: 1, marginBottom: 4 }}>
                      {item.value}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setStep('form')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '16px 40px', background: '#c8860a', color: '#1c0800',
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: '1rem',
                  boxShadow: '0 4px 20px rgba(200,134,10,0.30)',
                }}
              >
                Başvuru Formunu Doldur <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Başvuru formu */}
      {step === 'form' && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 80px' }}>
          <div style={{ marginBottom: 28 }}>
            <button onClick={() => setStep('info')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a89080', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', padding: 0, marginBottom: 16 }}>
              <ArrowLeft size={16} /> Geri
            </button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 6 }}>
              Kurye Başvurusu
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#a89080' }}>Tüm alanları eksiksiz doldurun</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Ad soyad */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020', marginBottom: 6 }}>Ad Soyad</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#a89080" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Adınız Soyadınız"
                  className="input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
              {errors.fullName && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: 4 }}>{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020', marginBottom: 6 }}>E-posta</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#a89080" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="ornek@email.com"
                  className="input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
              {errors.email && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: 4 }}>{errors.email}</p>}
            </div>

            {/* Telefon */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020', marginBottom: 6 }}>Telefon</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#a89080" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  value={form.phone}
                  maxLength={11}
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, '')
                    if (val.length > 0 && !val.startsWith('05')) {
                      val = '05' + val.replace(/^0+/, '').replace(/^5/, '')
                    }
                    if (val.length > 11) return
                    setForm(f => ({ ...f, phone: val }))
                  }}
                  placeholder="05XX XXX XX XX"
                  className="input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
              {errors.phone && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: 4 }}>{errors.phone}</p>}
            </div>

            {/* Plaka */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020', marginBottom: 6 }}>Motosiklet Plakası</label>
              <div style={{ position: 'relative' }}>
                <Bike size={16} color="#a89080" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={form.plateNumber}
                  onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value.toUpperCase() }))}
                  placeholder="34 AB 1234"
                  className="input"
                  style={{ paddingLeft: 38, fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020', marginBottom: 6 }}>Şifre</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#a89080" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="En az 8 karakter"
                  className="input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
              {errors.password && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: 4 }}>{errors.password}</p>}
            </div>

            {/* Şifre tekrar */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020', marginBottom: 6 }}>Şifre Tekrar</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#a89080" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Şifrenizi tekrar girin"
                  className="input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
              {errors.confirmPassword && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: 4 }}>{errors.confirmPassword}</p>}
            </div>

            {/* Şartlar */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={e => setForm(f => ({ ...f, agreeTerms: e.target.checked }))}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: '#c8860a' }}
              />
              <span style={{ fontSize: '0.82rem', color: '#7a6050', lineHeight: 1.5 }}>
                <Link href="/sartlar" style={{ color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>Kullanım Şartları</Link>
                {' '}ve{' '}
                <Link href="/gizlilik" style={{ color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>Gizlilik Politikası</Link>
                'nı okudum ve kabul ediyorum.
              </span>
            </label>
            {errors.agreeTerms && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: -10 }}>{errors.agreeTerms}</p>}

            {/* Gönder */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 0', background: '#c8860a', color: '#1c0800',
                border: 'none', borderRadius: 8, cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1rem',
                opacity: isLoading ? 0.7 : 1, marginTop: 4,
              }}
            >
              {isLoading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Kaydediliyor...</>
                : <>Başvuruyu Tamamla <ChevronRight size={18} /></>
              }
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#a89080' }}>
              Zaten hesabın var mı?{' '}
              <Link href="/giris" style={{ color: '#c8860a', fontWeight: 600, textDecoration: 'none' }}>Giriş Yap</Link>
            </p>
          </div>
        </div>
      )}

      {/* Başarı */}
      {step === 'success' && (
        <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '48px 32px', boxShadow: '0 4px 24px rgba(28,8,0,0.08)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={40} color="#16a34a" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>
              Başvurunuz Alındı!
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.7, marginBottom: 28 }}>
              Başvurunuzu inceleyeceğiz ve 24 saat içinde sizi arayacağız. Onaylandıktan sonra hemen çalışmaya başlayabilirsiniz.
            </p>
            <div style={{ background: '#fef8ed', borderRadius: 10, padding: '14px 18px', marginBottom: 28, textAlign: 'left' }}>
              <p style={{ fontSize: '0.82rem', color: '#7a6050', lineHeight: 1.7 }}>
                📱 Telefonunuzu açık tutun, ekibimiz sizinle iletişime geçecek.<br />
                📧 Onay e-postası için gelen kutunuzu kontrol edin.
              </p>
            </div>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 28px', background: '#c8860a', color: '#1c0800',
              borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            }}>
              Anasayfaya Dön
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .earn-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}