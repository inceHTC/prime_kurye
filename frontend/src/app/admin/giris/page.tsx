'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, Loader2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/lib/authService'
import { useAuthStore } from '@/store/authStore'

export default function AdminLoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [blockTimer, setBlockTimer] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (blocked) {
      toast.error(`Çok fazla deneme. ${blockTimer} saniye bekleyin.`)
      return
    }

    if (!email || !password) {
      toast.error('Tüm alanları doldurun')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.login({ email, password })
      if (res.success) {
        if (res.data.user.role !== 'ADMIN') {
          // Admin değilse hata ver — hangi alan yanlış belli etme
          setAttempts(prev => {
            const newAttempts = prev + 1
            if (newAttempts >= 5) {
              setBlocked(true)
              let timer = 60
              setBlockTimer(timer)
              const interval = setInterval(() => {
                timer--
                setBlockTimer(timer)
                if (timer <= 0) {
                  clearInterval(interval)
                  setBlocked(false)
                  setAttempts(0)
                }
              }, 1000)
            }
            return newAttempts
          })
          toast.error('Giriş bilgileri hatalı')
          return
        }

        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken)
        toast.success('Hoş geldiniz')
        router.push('/admin')
      }
    } catch {
      setAttempts(prev => {
        const newAttempts = prev + 1
        if (newAttempts >= 5) {
          setBlocked(true)
          let timer = 60
          setBlockTimer(timer)
          const interval = setInterval(() => {
            timer--
            setBlockTimer(timer)
            if (timer <= 0) {
              clearInterval(interval)
              setBlocked(false)
              setAttempts(0)
            }
          }, 1000)
        }
        return newAttempts
      })
      toast.error('Giriş bilgileri hatalı')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1c0800',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: "'Barlow', sans-serif",
    }}>

      {/* Arka plan deseni */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(200,134,10,0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: 'rgba(200,134,10,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(200,134,10,0.25)' }}>
            <Shield size={28} color="#c8860a" />
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#fff', marginBottom: 4 }}>
            PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Yönetim Paneli
          </p>
        </div>

        {/* Form kutusu */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: '32px 28px', backdropFilter: 'blur(10px)' }}>

          {blocked && (
            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Lock size={16} color="#dc2626" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>
                Çok fazla başarısız deneme. <strong>{blockTimer} saniye</strong> bekleyin.
              </p>
            </div>
          )}

          {attempts >= 3 && !blocked && (
            <div style={{ background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.20)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ fontSize: '0.78rem', color: '#fcd34d' }}>
                ⚠️ {5 - attempts} deneme hakkınız kaldı.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6, letterSpacing: '0.05em' }}>
                E-POSTA
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@primekurye.com"
                disabled={blocked || isLoading}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 8, outline: 'none',
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: '0.875rem', color: '#fff',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(200,134,10,0.50)' }}
                onBlur={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6, letterSpacing: '0.05em' }}>
                ŞİFRE
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={blocked || isLoading}
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: 8, outline: 'none',
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: '0.875rem', color: '#fff',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(200,134,10,0.50)' }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || blocked}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 0', background: blocked ? 'rgba(200,134,10,0.30)' : '#c8860a',
                color: '#1c0800', border: 'none', borderRadius: 8,
                cursor: (isLoading || blocked) ? 'not-allowed' : 'pointer',
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.95rem',
                marginTop: 4, transition: 'all 0.2s',
                opacity: (isLoading || blocked) ? 0.7 : 1,
              }}
            >
              {isLoading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Giriş yapılıyor...</>
                : blocked
                ? `${blockTimer}s bekleyin`
                : <><Shield size={16} /> Giriş Yap</>
              }
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.20)' }}>
              Bu sayfa yetkisiz erişime karşı korumalıdır
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.72rem', color: 'rgba(255,255,255,0.15)' }}>
          © {new Date().getFullYear()} Prime Kurye
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.20); }
      `}</style>
    </div>
  )
}