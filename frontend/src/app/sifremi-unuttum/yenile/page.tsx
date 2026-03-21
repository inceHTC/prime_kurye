'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export default function SifreYenilePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) { setTokenValid(false); return }
    verifyToken()
  }, [token])

  const verifyToken = async () => {
    try {
      const res = await api.get(`/auth/reset-password/verify/${token}`)
      if (res.data.success) {
        setTokenValid(true)
        setUserInfo(res.data.data)
      }
    } catch {
      setTokenValid(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Şifre en az 8 karakter olmalı'); return }
    if (password !== confirmPassword) { toast.error('Şifreler eşleşmiyor'); return }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error('Büyük harf, küçük harf ve rakam içermeli')
      return
    }

    setIsLoading(true)
    try {
      const res = await api.post('/auth/reset-password', { token, password })
      if (res.data.success) {
        setSuccess(true)
        setTimeout(() => router.push('/giris'), 3000)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Şifre güncellenemedi')
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

          {tokenValid === null && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Loader2 size={32} color="#c8860a" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          )}

          {tokenValid === false && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <XCircle size={32} color="#dc2626" />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1c0800', marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>
                Geçersiz Bağlantı
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.7, marginBottom: 24 }}>
                Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.
              </p>
              <Link href="/sifremi-unuttum" style={{ display: 'inline-flex', padding: '11px 24px', background: '#c8860a', color: '#1c0800', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                Yeni Bağlantı İste
              </Link>
            </div>
          )}

          {tokenValid === true && !success && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '36px 32px' }}>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c0800', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Yeni Şifre Belirle
                </h1>
                {userInfo && (
                  <p style={{ fontSize: '0.875rem', color: '#a89080' }}>
                    <strong>{userInfo.email}</strong> hesabı için
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020', marginBottom: 6 }}>Yeni Şifre</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#a89080" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="En az 8 karakter"
                      className="input"
                      style={{ paddingLeft: 38, paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a89080', padding: 4 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#a89080', marginTop: 4 }}>
                    En az 8 karakter, büyük/küçük harf ve rakam içermeli
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020', marginBottom: 6 }}>Şifre Tekrar</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#a89080" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Şifrenizi tekrar girin"
                      className="input"
                      style={{ paddingLeft: 38 }}
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
                    opacity: isLoading ? 0.7 : 1, marginTop: 4,
                  }}
                >
                  {isLoading
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Güncelleniyor...</>
                    : <><Lock size={16} /> Şifremi Güncelle</>
                  }
                </button>
              </form>
            </div>
          )}

          {success && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1c0800', marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>
                Şifre Güncellendi!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.7, marginBottom: 24 }}>
                Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
              </p>
              <Link href="/giris" style={{ display: 'inline-flex', padding: '11px 24px', background: '#c8860a', color: '#1c0800', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                Hemen Giriş Yap
              </Link>
            </div>
          )}

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}