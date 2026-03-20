'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/lib/authService'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Şifre gerekli'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)

    try {
      const response = await authService.login(data)

      if (response.success) {
        setAuth(response.data.user, response.data.accessToken, response.data.refreshToken)
        toast.success('Hoş geldiniz')

        if (redirect) {
          router.push(redirect)
          return
        }

        const role = response.data.user.role
        if (role === 'ADMIN') router.push('/admin')
        else if (role === 'COURIER') router.push('/kurye')
        else router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Giriş başarısız')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 md:p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-brand">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg text-dark-900 tracking-tight">
            Prime<span className="text-brand-500">Kurye</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card p-6 md:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-dark-900 mb-2">Tekrar hoş geldiniz</h1>
              <p className="text-dark-500 text-sm">
                {redirect ? 'Devam etmek için hesabınıza giriş yapın' : 'Hesabınıza giriş yapın'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">E-posta</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="ornek@sirket.com"
                  className={cn('input', errors.email && 'input-error')}
                  autoComplete="email"
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Şifre</label>
                  <Link href="/sifremi-unuttum" className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    Şifremi unuttum
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn('input pr-11', errors.password && 'input-error')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="error-message">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center mt-2">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Giriş yapılıyor...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Giriş Yap
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-dark-500 mt-6">
              Hesabınız yok mu?{' '}
              <Link
                href={redirect ? `/kayit?redirect=${encodeURIComponent(redirect)}` : '/kayit'}
                className="text-brand-500 hover:text-brand-600 font-semibold"
              >
                Ücretsiz kayıt olun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
