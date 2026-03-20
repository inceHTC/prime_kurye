export type DeliveryType = 'EXPRESS' | 'SAME_DAY' | 'SCHEDULED'

export interface DistrictOption {
  value: string
  label: string
  lat: number
  lng: number
}

export interface ManualEstimateInput {
  pickupDistrict: string
  dropoffDistrict: string
  deliveryType: DeliveryType
  isFragile?: boolean
}

export const ISTANBUL_DISTRICTS: DistrictOption[] = [
  { value: 'adalar', label: 'Adalar', lat: 40.8764, lng: 29.0911 },
  { value: 'arnavutkoy', label: 'Arnavutkoy', lat: 41.1856, lng: 28.7407 },
  { value: 'atasehir', label: 'Atasehir', lat: 40.9833, lng: 29.1167 },
  { value: 'avcilar', label: 'Avcilar', lat: 40.9799, lng: 28.7214 },
  { value: 'bagcilar', label: 'Bagcilar', lat: 41.039, lng: 28.8567 },
  { value: 'bahcelievler', label: 'Bahcelievler', lat: 41.0064, lng: 28.8406 },
  { value: 'bakirkoy', label: 'Bakirkoy', lat: 40.9809, lng: 28.8753 },
  { value: 'basaksehir', label: 'Basaksehir', lat: 41.0931, lng: 28.8025 },
  { value: 'bayrampasa', label: 'Bayrampasa', lat: 41.0482, lng: 28.9004 },
  { value: 'besiktas', label: 'Besiktas', lat: 41.043, lng: 29.0094 },
  { value: 'beykoz', label: 'Beykoz', lat: 41.1342, lng: 29.0927 },
  { value: 'beylikduzu', label: 'Beylikduzu', lat: 41.0015, lng: 28.6417 },
  { value: 'beyoglu', label: 'Beyoglu', lat: 41.037, lng: 28.985 },
  { value: 'buyukcekmece', label: 'Buyukcekmece', lat: 41.0218, lng: 28.585 },
  { value: 'catalca', label: 'Catalca', lat: 41.1426, lng: 28.4619 },
  { value: 'cekmekoy', label: 'Cekmekoy', lat: 41.0331, lng: 29.1756 },
  { value: 'esenler', label: 'Esenler', lat: 41.0432, lng: 28.8738 },
  { value: 'esenyurt', label: 'Esenyurt', lat: 41.0343, lng: 28.6801 },
  { value: 'eyupsultan', label: 'Eyupsultan', lat: 41.0822, lng: 28.9336 },
  { value: 'fatih', label: 'Fatih', lat: 41.017, lng: 28.9497 },
  { value: 'gaziosmanpasa', label: 'Gaziosmanpasa', lat: 41.0742, lng: 28.9106 },
  { value: 'gungoren', label: 'Gungoren', lat: 41.0178, lng: 28.8726 },
  { value: 'kadikoy', label: 'Kadikoy', lat: 40.9919, lng: 29.0277 },
  { value: 'kagithane', label: 'Kagithane', lat: 41.0852, lng: 28.967 },
  { value: 'kartal', label: 'Kartal', lat: 40.8889, lng: 29.1856 },
  { value: 'kucukcekmece', label: 'Kucukcekmece', lat: 41.0006, lng: 28.7897 },
  { value: 'maltepe', label: 'Maltepe', lat: 40.9351, lng: 29.1307 },
  { value: 'pendik', label: 'Pendik', lat: 40.8787, lng: 29.2577 },
  { value: 'sancaktepe', label: 'Sancaktepe', lat: 41.0019, lng: 29.2305 },
  { value: 'sariyer', label: 'Sariyer', lat: 41.1669, lng: 29.051 },
  { value: 'silivri', label: 'Silivri', lat: 41.0734, lng: 28.2464 },
  { value: 'sultanbeyli', label: 'Sultanbeyli', lat: 40.9687, lng: 29.2654 },
  { value: 'sultangazi', label: 'Sultangazi', lat: 41.1019, lng: 28.8669 },
  { value: 'sisli', label: 'Sisli', lat: 41.0605, lng: 28.9872 },
  { value: 'tuzla', label: 'Tuzla', lat: 40.8167, lng: 29.3003 },
  { value: 'umraniye', label: 'Umraniye', lat: 41.0164, lng: 29.1248 },
  { value: 'uskudar', label: 'Uskudar', lat: 41.0236, lng: 29.0152 },
  { value: 'zeytinburnu', label: 'Zeytinburnu', lat: 40.993, lng: 28.9042 },
]

const DISTRICT_MAP = new Map(ISTANBUL_DISTRICTS.map((district) => [district.value, district]))

export function getDistrictByValue(value: string) {
  return DISTRICT_MAP.get(value)
}

export function formatDistrictLabel(value: string) {
  return getDistrictByValue(value)?.label ?? value
}

export function haversineKm(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
) {
  const toRadians = (deg: number) => (deg * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRadians(endLat - startLat)
  const dLng = toRadians(endLng - startLng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(startLat)) *
      Math.cos(toRadians(endLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

export function calculateManualEstimate(input: ManualEstimateInput) {
  const pickup = getDistrictByValue(input.pickupDistrict)
  const dropoff = getDistrictByValue(input.dropoffDistrict)

  if (!pickup || !dropoff) {
    return null
  }

  const birdDistance = haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng)
  const roadDistance = Math.max(3, Number((birdDistance * 1.32 + 1.5).toFixed(1)))

  const config = {
    EXPRESS: { base: 200, perKm: 4.9, minutesPerKm: 4.2 },
    SAME_DAY: { base: 94.9, perKm: 3.5, minutesPerKm: 6.8 },
    SCHEDULED: { base: 110.9, perKm: 3.9, minutesPerKm: 6.1 },
  }[input.deliveryType]

  const fragileFee = input.isFragile ? 25 : 0
  const subtotal = config.base + roadDistance * config.perKm + fragileFee
  const estimatedMinutes = Math.max(25, Math.round(roadDistance * config.minutesPerKm))

  return {
    distance: roadDistance,
    estimatedMinutes,
    price: Number(subtotal.toFixed(2)),
    total: Number(subtotal.toFixed(2)),
    fragileFee,
  }
}
