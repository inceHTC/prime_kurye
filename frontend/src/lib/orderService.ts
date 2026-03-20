import api from './api'

export interface CreateOrderData {
  senderName: string
  senderPhone: string
  senderAddress: string
  senderLat: number
  senderLng: number
  senderNotes?: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  recipientLat: number
  recipientLng: number
  recipientNotes?: string
  packageDesc: string
  packageWeight: number
  isFragile: boolean
  packageValue?: number
  deliveryType: 'EXPRESS' | 'SAME_DAY' | 'SCHEDULED'
  // GÜNCELLEME: Sadece 'MOTORCYCLE' kabul ediliyor
  vehicle: 'MOTORCYCLE' 
  scheduledAt?: string
  insuranceValue?: number
}

export interface PriceEstimate {
  distance: number
  price: number
  total?: number
  estimatedMinutes: number
}

export const orderService = {
  async estimatePrice(data: {
    senderLat: number
    senderLng: number
    recipientLat: number
    recipientLng: number
    deliveryType: string
    // GÜNCELLEME: Sadece 'MOTORCYCLE' kabul ediliyor
    vehicle: 'MOTORCYCLE' 
    isFragile?: boolean
    packageValue?: number
  }): Promise<PriceEstimate> {
    const res = await api.post('/orders/estimate', data)
    return res.data.data
  },

  async createOrder(data: CreateOrderData) {
    const res = await api.post('/orders', data)
    return res.data
  },

  async getOrders(page = 1, status?: string) {
    const params: any = { page }
    if (status) params.status = status
    const res = await api.get('/orders', { params })
    return res.data
  },

  async getOrder(id: string) {
    const res = await api.get(`/orders/${id}`)
    return res.data
  },

  async trackOrder(code: string) {
    const res = await api.get(`/orders/track/${code}`)
    return res.data
  },
}