'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Bike, Building2, Eye, EyeOff, User, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/lib/authService'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

type Role = 'INDIVIDUAL' | 'BUSINESS' | 'COURIER'

const schema = z
  .object({
    fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalı'),
    email: z.string().email('Geçerli bir e-posta girin'),
    phone: z.string().regex(/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası girin'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalı')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'En az bir büyük harf, küçük harf ve rakam içermeli'),
    passwordConfirm: z.string(),
    role: z.enum(['INDIVIDUAL', 'BUSINESS', 'COURIER']),
    companyName: z.string().optional(),
    taxNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Şifreler eşleşmiyor',
    path: ['passwordConfirm'],
  })

type RegisterForm = z.infer<typeof schema>

const roles = [
  {
    value: 'INDIVIDUAL' as Role,
    label: 'Bireysel',
    icon: User,
    desc: 'Kişisel gönderim',
    color: '#1d4ed8',
    bg: '#eff6ff',
    features: ['Hızlı sipariş', 'Kolay takip', 'Güvenli ödeme'],
  },
  {
    value: 'BUSINESS' as Role,
    label: 'Kurumsal',
    icon: Building2,
    desc: 'İşletme hesabı',
    color: '#c8860a',
    bg: '#fef8ed',
    features: ['Toplu sipariş', 'Raporlar', 'Fatura ve API'],
  },
  {
    value: 'COURIER' as Role,
    label: 'Kurye',
    icon: Bike,
    desc: 'Para kazan',
    color: '#16a34a',
    bg: '#f0fdf4',
    features: ['Esnek çalışma', 'Yüksek kazanç', 'Haftalık ödeme'],
  },
]

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>('INDIVIDUAL')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'INDIVIDUAL' },
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)

    try {
      const response = await authService.register(data)

      if (response.success) {
        setAuth(response.data.user, response.data.accessToken, response.data.refreshToken)
        toast.success('Hesabınız oluşturuldu')

        if (redirect) {
          router.push(redirect)
          return
        }

        const role = response.data.user.role
        if (role === 'COURIER') router.push('/kurye-belgeler')
        else if (role === 'BUSINESS') router.push('/dashboard')
        else router.push('/dashboard/bireysel')
      }
    } catch (error: any) {
      const message = error.response?.data?.message
      if (message?.includes('E-posta')) toast.error('Bu e-posta adresi zaten kayıtlı')
      else if (message?.includes('Telefon')) toast.error('Bu telefon numarası zaten kayıtlı')
      else if (message?.includes('gerekli')) toast.error(message)
      else toast.error(message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.')
    }
  }

  const activeRole = roles.find((role) => role.value === selectedRole)!

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 24px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', width: 'fit-content' }}>
          <div style={{ width: 32, height: 32, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#1c0800" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#1c0800' }}>
            VIN<span style={{ color: '#c8860a' }}>KURYE</span>
          </span>
        </Link>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px 40px' }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>
              Hesap Oluşturun
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#a89080' }}>
              {redirect ? 'Siparişinize devam etmek için hızlıca hesap oluşturun.' : 'İlk siparişinize özel avantajlarla başlayın.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.value

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.value)
                    setValue('role', role.value)
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '14px 8px',
                    borderRadius: 12,
                    border: `2px solid ${isSelected ? role.color : 'rgba(28,8,0,0.10)'}`,
                    background: isSelected ? role.bg : '#fff',
                    cursor: 'pointer',
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: isSelected ? '#fff' : '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={isSelected ? role.color : '#a89080'} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: isSelected ? role.color : '#4a3020' }}>{role.label}</span>
                  <span style={{ fontSize: '0.7rem', color: '#a89080' }}>{role.desc}</span>
                </button>
              )
            })}
          </div>

          <div style={{ background: activeRole.bg, borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {activeRole.features.map((feature) => (
              <span key={feature} style={{ fontSize: '0.75rem', fontWeight: 700, color: activeRole.color }}>
                {feature}
              </span>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(28,8,0,0.08)', padding: '24px 22px' }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Ad Soyad</label>
                <input {...register('fullName')} type="text" placeholder="Adınız Soyadınız" className={cn('input', errors.fullName && 'input-error')} />
                {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
              </div>

              {selectedRole === 'BUSINESS' && (
                <>
                  <div>
                    <label className="label">Şirket / İşletme Adı</label>
                    <input {...register('companyName')} type="text" placeholder="Şirketinizin adı" className="input" />
                  </div>
                  <div>
                    <label className="label">Vergi Numarası</label>
                    <input {...register('taxNumber')} type="text" placeholder="1234567890" className="input" />
                  </div>
                </>
              )}

              <div>
                <label className="label">E-posta</label>
                <input {...register('email')} type="email" placeholder="ornek@email.com" className={cn('input', errors.email && 'input-error')} />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Telefon</label>
                <input {...register('phone')} type="tel" placeholder="05321234567" className={cn('input', errors.phone && 'input-error')} />
                {errors.phone && <p className="error-message">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="label">Şifre</label>
                <div style={{ position: 'relative' }}>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="En az 8 karakter"
                    className={cn('input', errors.password && 'input-error')}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a89080', padding: 4 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="error-message">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Şifre Tekrar</label>
                <input
                  {...register('passwordConfirm')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrenizi tekrar girin"
                  className={cn('input', errors.passwordConfirm && 'input-error')}
                />
                {errors.passwordConfirm && <p className="error-message">{errors.passwordConfirm.message}</p>}
              </div>

              {selectedRole === 'COURIER' && (
                <div style={{ background: '#fef8ed', borderRadius: 8, padding: '12px 14px', fontSize: '0.8rem', color: '#7a6050', lineHeight: 1.6 }}>
                  Kayıt sonrası gerekli belgelerinizi yükleyip admin onayı beklemeniz gerekir.
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '13px 0',
                  background: '#c8860a',
                  color: '#1c0800',
                  border: 'none',
                  borderRadius: 8,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  opacity: isLoading ? 0.7 : 1,
                  marginTop: 4,
                }}
              >
                {isLoading ? 'Kayıt yapılıyor...' : (
                  <>
                    Hesap Oluştur
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#a89080' }}>
                Kayıt olarak{' '}
                <Link href="/sartlar" style={{ color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
                  Kullanım Şartları
                </Link>{' '}
                ve{' '}
                <Link href="/gizlilik" style={{ color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
                  Gizlilik Politikası
                </Link>{' '}
                metinlerini kabul etmiş sayılırsınız.
              </p>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#a89080', marginTop: 20 }}>
            Zaten hesabın var mı?{' '}
            <Link href={redirect ? `/giris?redirect=${encodeURIComponent(redirect)}` : '/giris'} style={{ color: '#c8860a', fontWeight: 600, textDecoration: 'none' }}>
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #c8860a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
