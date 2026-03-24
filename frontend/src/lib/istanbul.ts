export type DeliveryType = 'EXPRESS' | 'SAME_DAY' | 'SCHEDULED'

export interface DistrictOption {
  value: string
  label: string
  lat: number
  lng: number
  side: 'europe' | 'asia'
}

export interface ManualEstimateInput {
  pickupDistrict: string
  dropoffDistrict: string
  deliveryType: DeliveryType
  isFragile?: boolean
  packageWeight?: number
}

export const ISTANBUL_DISTRICTS: DistrictOption[] = [
  // ── ANADOLU YAKASI ──────────────────────────────────────────
  { value: 'adalar',       label: 'Adalar',       lat: 40.8764, lng: 29.0911, side: 'asia' },
  { value: 'atasehir',     label: 'Ataşehir',     lat: 40.9833, lng: 29.1167, side: 'asia' },
  { value: 'beykoz',       label: 'Beykoz',       lat: 41.1342, lng: 29.0927, side: 'asia' },
  { value: 'cekmekoy',     label: 'Çekmeköy',     lat: 41.0331, lng: 29.1756, side: 'asia' },
  { value: 'kadikoy',      label: 'Kadıköy',      lat: 40.9919, lng: 29.0277, side: 'asia' },
  { value: 'kartal',       label: 'Kartal',        lat: 40.8889, lng: 29.1856, side: 'asia' },
  { value: 'maltepe',      label: 'Maltepe',       lat: 40.9351, lng: 29.1307, side: 'asia' },
  { value: 'pendik',       label: 'Pendik',        lat: 40.8787, lng: 29.2577, side: 'asia' },
  { value: 'sancaktepe',   label: 'Sancaktepe',   lat: 41.0019, lng: 29.2305, side: 'asia' },
  { value: 'sultanbeyli',  label: 'Sultanbeyli',  lat: 40.9687, lng: 29.2654, side: 'asia' },
  { value: 'tuzla',        label: 'Tuzla',         lat: 40.8167, lng: 29.3003, side: 'asia' },
  { value: 'umraniye',     label: 'Ümraniye',      lat: 41.0164, lng: 29.1248, side: 'asia' },
  { value: 'uskudar',      label: 'Üsküdar',       lat: 41.0236, lng: 29.0152, side: 'asia' },
  // ── AVRUPA YAKASI ───────────────────────────────────────────
  { value: 'arnavutkoy',   label: 'Arnavutköy',   lat: 41.1856, lng: 28.7407, side: 'europe' },
  { value: 'avcilar',      label: 'Avcılar',       lat: 40.9799, lng: 28.7214, side: 'europe' },
  { value: 'bagcilar',     label: 'Bağcılar',      lat: 41.0390, lng: 28.8567, side: 'europe' },
  { value: 'bahcelievler', label: 'Bahçelievler', lat: 41.0064, lng: 28.8406, side: 'europe' },
  { value: 'bakirkoy',     label: 'Bakırköy',      lat: 40.9809, lng: 28.8753, side: 'europe' },
  { value: 'basaksehir',   label: 'Başakşehir',   lat: 41.0931, lng: 28.8025, side: 'europe' },
  { value: 'bayrampasa',   label: 'Bayrampaşa',   lat: 41.0482, lng: 28.9004, side: 'europe' },
  { value: 'besiktas',     label: 'Beşiktaş',      lat: 41.0430, lng: 29.0094, side: 'europe' },
  { value: 'beylikduzu',   label: 'Beylikdüzü',   lat: 41.0015, lng: 28.6417, side: 'europe' },
  { value: 'beyoglu',      label: 'Beyoğlu',       lat: 41.0370, lng: 28.9850, side: 'europe' },
  { value: 'buyukcekmece', label: 'Büyükçekmece', lat: 41.0218, lng: 28.5850, side: 'europe' },
  { value: 'catalca',      label: 'Çatalca',       lat: 41.1426, lng: 28.4619, side: 'europe' },
  { value: 'esenler',      label: 'Esenler',       lat: 41.0432, lng: 28.8738, side: 'europe' },
  { value: 'esenyurt',     label: 'Esenyurt',      lat: 41.0343, lng: 28.6801, side: 'europe' },
  { value: 'eyupsultan',   label: 'Eyüpsultan',   lat: 41.0822, lng: 28.9336, side: 'europe' },
  { value: 'fatih',        label: 'Fatih',         lat: 41.0170, lng: 28.9497, side: 'europe' },
  { value: 'gaziosmanpasa',label: 'Gaziosmanpaşa', lat: 41.0742, lng: 28.9106, side: 'europe' },
  { value: 'gungoren',     label: 'Güngören',      lat: 41.0178, lng: 28.8726, side: 'europe' },
  { value: 'kagithane',    label: 'Kağıthane',     lat: 41.0852, lng: 28.9670, side: 'europe' },
  { value: 'kucukcekmece', label: 'Küçükçekmece', lat: 41.0006, lng: 28.7897, side: 'europe' },
  { value: 'sariyer',      label: 'Sarıyer',       lat: 41.1669, lng: 29.0510, side: 'europe' },
  { value: 'silivri',      label: 'Silivri',       lat: 41.0734, lng: 28.2464, side: 'europe' },
  { value: 'sultangazi',   label: 'Sultangazi',    lat: 41.1019, lng: 28.8669, side: 'europe' },
  { value: 'sisli',        label: 'Şişli',         lat: 41.0605, lng: 28.9872, side: 'europe' },
  { value: 'zeytinburnu',  label: 'Zeytinburnu',  lat: 40.9930, lng: 28.9042, side: 'europe' },
]

const DISTRICT_MAP = new Map(ISTANBUL_DISTRICTS.map((d) => [d.value, d]))

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
  const R = 6371
  const dLat = ((endLat - startLat) * Math.PI) / 180
  const dLng = ((endLng - startLng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((startLat * Math.PI) / 180) *
      Math.cos((endLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Kademeli km ücreti: 0-10km→9₺, 10-25km→7₺, 25km+→5₺
function tieredKmCost(km: number): number {
  if (km <= 10) return km * 9
  if (km <= 25) return 10 * 9 + (km - 10) * 7
  return 10 * 9 + 15 * 7 + (km - 25) * 5
}

export function calculateManualEstimate(input: ManualEstimateInput) {
  const pickup  = getDistrictByValue(input.pickupDistrict)
  const dropoff = getDistrictByValue(input.dropoffDistrict)
  if (!pickup || !dropoff) return null

  const birdKm     = haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng)
  const crossSide  = pickup.side !== dropoff.side
  // Karşı yakaya geçişte köprü deturu ve trafik; aynı yakada normal şehir faktörü
  const roadFactor = crossSide ? 1.85 : 1.35
  const roadKm     = Math.max(3, Number((birdKm * roadFactor).toFixed(1)))

  const BASE = 65
  const kmCost = tieredKmCost(roadKm)
  const fragileFee = input.isFragile ? 30 : 0

  // Ağırlık katmanı
  const weight = input.packageWeight ?? 1
  const weightFee = weight > 15 ? 60 : weight > 5 ? 30 : 0

  const subtotal = BASE + kmCost + fragileFee + weightFee

  const config = {
    EXPRESS:   { multiplier: 1.40, min: 110 },
    SAME_DAY:  { multiplier: 1.00, min:  80 },
    SCHEDULED: { multiplier: 0.85, min:  68 },
  }[input.deliveryType]

  const price = Math.max(config.min, Math.round(subtotal * config.multiplier))

  // Tahmini süre: karşı yakada köprü için +20dk eklenir
  const speedFactor = input.deliveryType === 'EXPRESS' ? 3.0 : 3.8
  const bridgeExtra = crossSide ? 20 : 0
  const estimatedMinutes = Math.max(20, Math.round(roadKm * speedFactor) + bridgeExtra)

  return {
    distance: roadKm,
    birdDistance: Number(birdKm.toFixed(1)),
    crossSide,
    estimatedMinutes,
    price,
    total: price,
    fragileFee,
    weightFee,
  }
}
