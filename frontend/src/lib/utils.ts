import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { OrderStatus, DeliveryType, VehicleType } from '@/types'

// --- Tailwind class merger ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Para formatı ---
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount)
}

// --- Tarih formatı ---
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dakika önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  return formatDate(dateString)
}

// --- Sipariş durumu çevirileri ---
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  PICKING_UP: 'Kurye Alıyor',
  IN_TRANSIT: 'Yolda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  FAILED: 'Başarısız',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PICKING_UP: 'bg-purple-100 text-purple-800',
  IN_TRANSIT: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  FAILED: 'bg-red-100 text-red-800',
}

// --- Teslimat tipi ---
export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  EXPRESS: 'Ekspres (1-2 saat)',
  SAME_DAY: 'Aynı Gün',
  SCHEDULED: 'Planlanmış',
}

// --- Araç tipi ---
export const VEHICLE_LABELS: Record<VehicleType, string> = {
  MOTORCYCLE: 'Motosiklet',
  CAR: 'Araç',
  BICYCLE: 'Bisiklet',
}

export const VEHICLE_ICONS: Record<VehicleType, string> = {
  MOTORCYCLE: '🏍️',
  CAR: '🚗',
  BICYCLE: '🚲',
}

// --- Telefon formatı ---
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('90') && cleaned.length === 12) {
    return `+90 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`
  }
  return phone
}

// --- Mesafe hesabı (Haversine) ---
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // Dünya yarıçapı km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

// --- Takip kodu üretici ---
export function generateTrackingCode(): string {
  const prefix = 'PK'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

const TRACKING_CODE_ALLOWED = /[^A-Z0-9]/g
const TRACKING_CODE_FORMAT = /^PK[A-Z0-9]{6,16}$/

export function normalizeTrackingCode(value: string): string {
  const cleaned = value.toUpperCase().replace(TRACKING_CODE_ALLOWED, '')
  if (!cleaned) return ''

  if (cleaned.startsWith('PK')) {
    return cleaned.slice(0, 18)
  }

  const withoutLeadingNoise = cleaned.replace(/^P+K?/, '')
  return `PK${withoutLeadingNoise}`.slice(0, 18)
}

export function isValidTrackingCode(value: string): boolean {
  return TRACKING_CODE_FORMAT.test(normalizeTrackingCode(value))
}

// --- Truncate text ---
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}
