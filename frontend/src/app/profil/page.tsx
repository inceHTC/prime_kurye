'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Zap, ArrowLeft, User, Lock, Building2,
  CheckCircle, Loader2, LogOut
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalı'),
  phone: z.string().regex(/^(\+90|0)?[0-9]{10}$/, 'Geçerli telefon numarası girin'),
  companyName: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalı')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Büyük harf, küçük harf ve rakam içermeli'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilPage() {
  const router = useRouter()
  const { user, accessToken, setAuth, clearAuth, refreshToken, _hasHydrated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: '',
      companyName: '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (!_hasHydrated) return
    if (!accessToken) { router.push('/giris'); return }
    fetchProfile()
  }, [_hasHydrated, accessToken])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me')
      if (res.data.success) {
        const data = res.data.data
        setProfileData(data)
        profileForm.reset({
          fullName: data.fullName,
          phone: data.phone,
          companyName: data.business?.companyName || '',
        })
      }
    } catch {
      toast.error('Profil yüklenemedi')
    }
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsLoadingProfile(true)
    try {
      const res = await api.patch('/users/profile', data)
      if (res.data.success) {
        toast.success('Profil güncellendi!')
        // Store'u güncelle
        if (user) {
          setAuth({ ...user, fullName: data.fullName }, accessToken!, refreshToken!)
        }
        fetchProfile()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Güncelleme başarısız')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsLoadingPassword(true)
    try {
      const res = await api.patch('/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      if (res.data.success) {
        toast.success('Şifre değiştirildi!')
        passwordForm.reset()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Şifre değiştirilemedi')
    } finally {
      setIsLoadingPassword(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  if (!_hasHydrated || !user) return null

  const tabs = [
    { id: 'profile', label: 'Profil Bilgileri', icon: User },
    { id: 'password', label: 'Şifre Değiştir', icon: Lock },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid rgba(28,8,0,0.08)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard" style={{ padding: 8, borderRadius: 8, color: '#4a3020', textDecoration: 'none', display: 'flex' }}>
              <ArrowLeft size={20} />
            </Link>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 30, height: 30, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="#1c0800" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, color: '#1c0800' }}>
                VIN<span style={{ color: '#c8860a' }}>KURYE</span>
              </span>
            </Link>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontFamily: "'Barlow', sans-serif",
            fontWeight: 600, fontSize: '0.85rem', color: '#a89080',
            borderRadius: 8,
          }}>
            <LogOut size={15} />
            Çıkış
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Profil özeti */}
        <div style={{
          background: '#1c0800', borderRadius: 14,
          padding: '28px 28px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 20,
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#c8860a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
            fontSize: '1.5rem', color: '#1c0800', flexShrink: 0,
          }}>
            {user.fullName?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: "'Barlow', sans-serif" }}>
              {user.fullName}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.50)' }}>
              {user.email}
            </p>
            {profileData?.business && (
              <p style={{ fontSize: '0.82rem', color: '#c8860a', marginTop: 4, fontWeight: 600 }}>
                <Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                {profileData.business.companyName}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 4,
              fontSize: '0.75rem', fontWeight: 700,
              background: 'rgba(200,134,10,0.15)', color: '#c8860a',
            }}>
              {user.role === 'BUSINESS' ? 'İşletme' : user.role === 'COURIER' ? 'Kurye' : user.role === 'ADMIN' ? 'Admin' : 'Bireysel'}
            </span>
          </div>
        </div>

        {/* Sekmeler */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid rgba(28,8,0,0.08)' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.875rem',
                  transition: 'all 0.15s',
                  background: activeTab === tab.id ? '#1c0800' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#a89080',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* PROFİL FORMU */}
        {activeTab === 'profile' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '28px 28px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1c0800', marginBottom: 24, fontFamily: "'Barlow', sans-serif" }}>
              Kişisel Bilgiler
            </h2>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }} className="form-grid">
                <div>
                  <label className="label">Ad Soyad</label>
                  <input
                    {...profileForm.register('fullName')}
                    className={cn('input', profileForm.formState.errors.fullName && 'input-error')}
                    placeholder="Adınız Soyadınız"
                  />
                  {profileForm.formState.errors.fullName && (
                    <p className="error-message">{profileForm.formState.errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Telefon</label>
                  <input
                    {...profileForm.register('phone')}
                    className={cn('input', profileForm.formState.errors.phone && 'input-error')}
                    placeholder="05XX XXX XX XX"
                  />
                  {profileForm.formState.errors.phone && (
                    <p className="error-message">{profileForm.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* E-posta (sadece görüntü) */}
              <div style={{ marginBottom: 18 }}>
                <label className="label">E-posta</label>
                <input
                  value={user.email}
                  disabled
                  className="input"
                  style={{ background: '#faf9f7', color: '#a89080', cursor: 'not-allowed' }}
                />
                <p style={{ fontSize: '0.78rem', color: '#a89080', marginTop: 4 }}>E-posta adresi değiştirilemez</p>
              </div>

              {/* Şirket adı - sadece işletme için */}
              {user.role === 'BUSINESS' && (
                <div style={{ marginBottom: 24 }}>
                  <label className="label">Şirket / İşletme Adı</label>
                  <input
                    {...profileForm.register('companyName')}
                    className="input"
                    placeholder="İşletmenizin adı"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoadingProfile}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', background: '#c8860a', color: '#1c0800',
                  border: 'none', borderRadius: 8, cursor: isLoadingProfile ? 'not-allowed' : 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                  opacity: isLoadingProfile ? 0.7 : 1,
                }}
              >
                {isLoadingProfile ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
                {isLoadingProfile ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </form>
          </div>
        )}

        {/* ŞİFRE FORMU */}
        {activeTab === 'password' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '28px 28px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1c0800', marginBottom: 8, fontFamily: "'Barlow', sans-serif" }}>
              Şifre Değiştir
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#a89080', marginBottom: 24 }}>
              Güvenliğiniz için güçlü bir şifre seçin.
            </p>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label className="label">Mevcut Şifre</label>
                  <input
                    {...passwordForm.register('currentPassword')}
                    type="password"
                    className={cn('input', passwordForm.formState.errors.currentPassword && 'input-error')}
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="error-message">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Yeni Şifre</label>
                  <input
                    {...passwordForm.register('newPassword')}
                    type="password"
                    className={cn('input', passwordForm.formState.errors.newPassword && 'input-error')}
                    placeholder="En az 8 karakter"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="error-message">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Yeni Şifre Tekrar</label>
                  <input
                    {...passwordForm.register('confirmPassword')}
                    type="password"
                    className={cn('input', passwordForm.formState.errors.confirmPassword && 'input-error')}
                    placeholder="Şifrenizi tekrar girin"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="error-message">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoadingPassword}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', background: '#1c0800', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: isLoadingPassword ? 'not-allowed' : 'pointer',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                  marginTop: 24, opacity: isLoadingPassword ? 0.7 : 1,
                }}
              >
                {isLoadingPassword ? <Loader2 size={16} /> : <Lock size={16} />}
                {isLoadingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
              </button>
            </form>
          </div>
        )}

      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}