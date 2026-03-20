// ================================
// PRIME KURYE — Global Types
// ================================

// --- Kullanıcı Rolleri ---
export type UserRole = 'BUSINESS' | 'COURIER' | 'ADMIN'

export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  role: UserRole
  avatar?: string
  isVerified: boolean
  createdAt: string
}

// --- Sipariş Durumları ---
export type OrderStatus =
  | 'PENDING'       // Beklemede
  | 'CONFIRMED'     // Onaylandı
  | 'PICKING_UP'    // Kurye alıyor
  | 'IN_TRANSIT'    // Yolda
  | 'DELIVERED'     // Teslim edildi
  | 'CANCELLED'     // İptal edildi
  | 'FAILED'        // Başarısız

export type DeliveryType =
  | 'EXPRESS'   // Anında (1-2 saat)
  | 'SAME_DAY'  // Aynı gün sonu
  | 'SCHEDULED' // Planlanmış

export type VehicleType = 'MOTORCYCLE' | 'CAR' | 'BICYCLE'

// --- Adres ---
export interface Address {
  fullAddress: string
  district: string
  city: string
  lat: number
  lng: number
  floor?: string
  door?: string
  notes?: string
}

// --- Paket ---
export interface PackageInfo {
  weight: number       // kg
  description: string
  value?: number       // TL (sigorta için)
  isFragile: boolean
}

// --- Sipariş ---
export interface Order {
  id: string
  trackingCode: string
  status: OrderStatus
  deliveryType: DeliveryType

  sender: {
    name: string
    phone: string
    address: Address
  }
  recipient: {
    name: string
    phone: string
    address: Address
  }

  packageInfo: PackageInfo
  vehicle: VehicleType

  price: number
  insuranceValue?: number

  courier?: CourierInfo
  estimatedDelivery?: string
  deliveredAt?: string

  createdAt: string
  updatedAt: string
}

// --- Kurye ---
export interface CourierInfo {
  id: string
  fullName: string
  phone: string
  avatar?: string
  vehicle: VehicleType
  plateNumber?: string
  rating: number
  totalDeliveries: number
  currentLocation?: {
    lat: number
    lng: number
    updatedAt: string
  }
}

// --- Fiyat Hesaplama ---
export interface PriceEstimate {
  basePrice: number
  distancePrice: number
  vehicleMultiplier: number
  expressMultiplier: number
  total: number
  estimatedMinutes: number
  distance: number // km
}

// --- API Response ---
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// --- Bildirim ---
export interface Notification {
  id: string
  type: 'ORDER_UPDATE' | 'COURIER_ASSIGNED' | 'DELIVERED' | 'PAYMENT' | 'SYSTEM'
  title: string
  message: string
  isRead: boolean
  orderId?: string
  createdAt: string
}

// --- Form Types ---
export interface CreateOrderForm {
  senderAddress: Address
  recipientName: string
  recipientPhone: string
  recipientAddress: Address
  packageDescription: string
  packageWeight: number
  isFragile: boolean
  packageValue?: number
  deliveryType: DeliveryType
  vehicle: VehicleType
  scheduledAt?: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  fullName: string
  email: string
  phone: string
  password: string
  passwordConfirm: string
  role: 'BUSINESS' | 'COURIER'
  companyName?: string // BUSINESS için
}