'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('E-posta adresi girin'); return }
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      toast.error('Bir hata oluştu, tekrar deneyin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow', sans-serif" }}>
      <header style={{ padding: '16px 24px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', width: 'fit-content' }}>
          <div style={{ width: 32, height: 32, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#1c0800" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#1c0800' }}>
            PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
          </span>
        </Link>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {sent ? (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(28,8,0,0.06)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1c0800', marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>
                E-posta Gönderildi!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.7, marginBottom: 28 }}>
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik. Gelen kutunuzu kontrol edin.
              </p>
              <p style={{ fontSize: '0.78rem', color: '#a89080', marginBottom: 24 }}>
                E-posta gelmedi mi? Spam klasörünü kontrol edin veya tekrar deneyin.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={() => setSent(false)} style={{ padding: '10px 20px', background: '#f5f3ef', color: '#4a3020', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.875rem' }}>
                  Tekrar Dene
                </button>
                <Link href="/giris" style={{ padding: '10px 20px', background: '#c8860a', color: '#1c0800', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                  Giriş Yap
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '36px 32px', boxShadow: '0 4px 20px rgba(28,8,0,0.06)' }}>
              <Link href="/giris" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a89080', textDecoration: 'none', fontSize: '0.82rem', marginBottom: 24, fontWeight: 500 }}>
                <ArrowLeft size={15} /> Girişe Dön
              </Link>

              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c0800', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Şifremi Unuttum
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#a89080', lineHeight: 1.65 }}>
                  Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020', marginBottom: 6 }}>
                    E-posta Adresi
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#a89080" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="input"
                      style={{ paddingLeft: 38 }}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px 0', background: '#c8860a', color: '#1c0800',
                    border: 'none', borderRadius: 8, cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.95rem',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Gönderiliyor...</>
                    : 'Sıfırlama Bağlantısı Gönder'
                  }
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}