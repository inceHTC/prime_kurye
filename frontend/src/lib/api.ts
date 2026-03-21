import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
})

type PersistedAuthState = {
  state?: {
    accessToken?: string | null
    refreshToken?: string | null
  }
}

type RetriableRequestConfig = {
  _retry?: boolean
  headers?: Record<string, string>
}

function getStoredAuth() {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = localStorage.getItem('prime-kurye-auth')
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as PersistedAuthState
  } catch {
    localStorage.removeItem('prime-kurye-auth')
    return null
  }
}

function updateStoredTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') {
    return
  }

  const stored = getStoredAuth()
  if (!stored?.state) {
    return
  }

  localStorage.setItem(
    'prime-kurye-auth',
    JSON.stringify({
      ...stored,
      state: {
        ...stored.state,
        accessToken,
        refreshToken,
      },
    })
  )
}

function clearStoredAuthAndRedirect() {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem('prime-kurye-auth')

  if (window.location.pathname !== '/giris') {
    window.location.href = '/giris'
  }
}

let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null

api.interceptors.request.use((config) => {
  const stored = getStoredAuth()
  const accessToken = stored?.state?.accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const stored = getStoredAuth()
      const refreshToken = stored?.state?.refreshToken

      if (!refreshToken) {
        clearStoredAuthAndRedirect()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        refreshPromise ??= axios
          .post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )
          .then((response) => {
            const tokens = response.data?.data

            if (!tokens?.accessToken || !tokens?.refreshToken) {
              return null
            }

            updateStoredTokens(tokens.accessToken, tokens.refreshToken)
            return tokens
          })
          .finally(() => {
            refreshPromise = null
          })

        const tokens = await refreshPromise

        if (!tokens?.accessToken) {
          clearStoredAuthAndRedirect()
          return Promise.reject(error)
        }

        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        clearStoredAuthAndRedirect()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
