import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  phone: string
  fullName: string
  role: 'INDIVIDUAL' | 'BUSINESS' | 'COURIER' | 'ADMIN'
  avatar?: string
  isVerified: boolean
  courierId?: string | null
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  _hasHydrated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      _hasHydrated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'prime-kurye-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
