import api from './api'

export interface RegisterData {
  email: string
  phone: string
  fullName: string
  password: string
  role: 'INDIVIDUAL' | 'BUSINESS' | 'COURIER'
  companyName?: string
  taxNumber?: string
}

export interface LoginData {
  email: string
  password: string
}

export const authService = {
  async register(data: RegisterData) {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  async login(data: LoginData) {
    const res = await api.post('/auth/login', data)
    return res.data
  },

  async logout(refreshToken: string) {
    const res = await api.post('/auth/logout', { refreshToken })
    return res.data
  },

  async getMe() {
    const res = await api.get('/auth/me')
    return res.data
  },
}
