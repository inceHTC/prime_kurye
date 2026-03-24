'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

/**
 * Sayfa yüklenirken Zustand localStorage hidrasyon beklenir.
 * Hidrasyondan sonra accessToken yoksa redirectPath'e yönlendirir.
 * roleRequired verilirse rol uyuşmazsa da yönlendirir.
 *
 * Dönüş: { isReady } — true olunca içerik gösterilebilir.
 */
export function useRequireAuth(options?: {
  redirectPath?: string
  roleRequired?: string | string[]
  roleRedirect?: string
}) {
  const router = useRouter()
  const { _hasHydrated, accessToken, user } = useAuthStore()

  const redirectPath = options?.redirectPath ?? '/giris'
  const roleRequired = options?.roleRequired
  const roleRedirect = options?.roleRedirect ?? '/dashboard'

  useEffect(() => {
    if (!_hasHydrated) return

    if (!accessToken) {
      router.replace(redirectPath)
      return
    }

    if (roleRequired && user) {
      const allowed = Array.isArray(roleRequired) ? roleRequired : [roleRequired]
      if (!allowed.includes(user.role)) {
        router.replace(roleRedirect)
      }
    }
  }, [_hasHydrated, accessToken, user?.role])

  // isReady: hidrasyon tamamlandı ve oturum kontrolü geçti
  const isReady = _hasHydrated && !!accessToken
  return { isReady, user }
}
