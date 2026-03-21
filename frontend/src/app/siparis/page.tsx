'use client'

import { Suspense, type Dispatch, type ReactNode, type SetStateAction, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useJsApiLoader } from '@react-google-maps/api'
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  UserRound,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { orderService } from '@/lib/orderService'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import {
  ISTANBUL_DISTRICTS,
  calculateManualEstimate,
  formatDistrictLabel,
  getDistrictByValue,
  type DeliveryType,
} from '@/lib/istanbul'

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
const mapsLibraries: ('places')[] = ['places']

const steps = ['Adresler', 'Paket', 'Özet']
const anonymousDraftStorageKey = 'prime-kurye-order-draft-anonymous'

const deliveryTypes: Array<{
  value: DeliveryType
  label: string
  desc: string
  price: string
}> = [
  { value: 'EXPRESS', label: 'Ekspres', desc: '1-2 saat', price: '200 TL+' },
  { value: 'SAME_DAY', label: 'Aynı Gün', desc: 'Gün sonu', price: '94,90 TL+' },
  { value: 'SCHEDULED', label: 'Planlı', desc: 'Seçilen saat', price: '110,90 TL+' },
]

type OrderFormState = {
  senderName: string
  senderPhone: string
  senderDistrict: string
  senderNeighborhood: string
  senderAddressDetail: string
  senderAddress: string
  senderLat: number
  senderLng: number
  senderNotes: string
  recipientName: string
  recipientPhone: string
  recipientDistrict: string
  recipientNeighborhood: string
  recipientAddressDetail: string
  recipientAddress: string
  recipientLat: number
  recipientLng: number
  recipientNotes: string
  packageDesc: string
  packageWeight: number
  isFragile: boolean
  packageValue: number
  deliveryType: DeliveryType
  vehicle: 'MOTORCYCLE'
  insuranceValue: number
}

type NeighborhoodPrediction = {
  placeId: string
  label: string
}

const createDefaultForm = (userName = ''): OrderFormState => ({
  senderName: userName,
  senderPhone: '',
  senderDistrict: '',
  senderNeighborhood: '',
  senderAddressDetail: '',
  senderAddress: '',
  senderLat: 0,
  senderLng: 0,
  senderNotes: '',
  recipientName: '',
  recipientPhone: '',
  recipientDistrict: '',
  recipientNeighborhood: '',
  recipientAddressDetail: '',
  recipientAddress: '',
  recipientLat: 0,
  recipientLng: 0,
  recipientNotes: '',
  packageDesc: '',
  packageWeight: 1,
  isFragile: false,
  packageValue: 0,
  deliveryType: 'EXPRESS',
  vehicle: 'MOTORCYCLE',
  insuranceValue: 0,
})

function SiparisContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accessToken, user } = useAuthStore()
  const { isLoaded: isMapsLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: mapsLibraries,
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [priceEstimate, setPriceEstimate] = useState<any>(null)
  const [form, setForm] = useState<OrderFormState>(() => createDefaultForm())
  const [senderSuggestions, setSenderSuggestions] = useState<NeighborhoodPrediction[]>([])
  const [recipientSuggestions, setRecipientSuggestions] = useState<NeighborhoodPrediction[]>([])

  const getUserDraftStorageKey = (userId?: string) => (userId ? `prime-kurye-order-draft-${userId}` : null)

  const routePreview = useMemo(() => {
    if (!form.senderDistrict || !form.recipientDistrict) {
      return null
    }

    return calculateManualEstimate({
      pickupDistrict: form.senderDistrict,
      dropoffDistrict: form.recipientDistrict,
      deliveryType: form.deliveryType,
      isFragile: form.isFragile,
    })
  }, [form.deliveryType, form.isFragile, form.packageValue, form.recipientDistrict, form.senderDistrict])

  useEffect(() => {
    setForm((current) => ({
      ...current,
      senderName: current.senderName || user?.fullName || '',
    }))
  }, [user?.fullName])

  useEffect(() => {
    const nextForm = createDefaultForm(user?.fullName || '')
    const userDraftStorageKey = getUserDraftStorageKey(user?.id)

    if (typeof window !== 'undefined') {
      const primaryDraft = userDraftStorageKey
        ? window.localStorage.getItem(userDraftStorageKey)
        : window.localStorage.getItem(anonymousDraftStorageKey)
      const anonymousDraft = window.localStorage.getItem(anonymousDraftStorageKey)
      const draft = primaryDraft || (!userDraftStorageKey ? anonymousDraft : null)

      if (draft) {
        try {
          Object.assign(nextForm, JSON.parse(draft))
        } catch {
          if (userDraftStorageKey) {
            window.localStorage.removeItem(userDraftStorageKey)
          }
          window.localStorage.removeItem(anonymousDraftStorageKey)
        }
      }

      if (userDraftStorageKey && !primaryDraft && anonymousDraft) {
        try {
          Object.assign(nextForm, JSON.parse(anonymousDraft))
          window.localStorage.setItem(userDraftStorageKey, JSON.stringify(nextForm))
        } catch {}
        window.localStorage.removeItem(anonymousDraftStorageKey)
      }
    }

    const pickupDistrict = searchParams.get('pickupDistrict')
    const dropoffDistrict = searchParams.get('dropoffDistrict')
    const deliveryType = searchParams.get('deliveryType') as DeliveryType | null
    const isFragile = searchParams.get('isFragile')
    const packageValue = searchParams.get('packageValue')

    if (pickupDistrict && getDistrictByValue(pickupDistrict)) {
      nextForm.senderDistrict = pickupDistrict
    }
    if (dropoffDistrict && getDistrictByValue(dropoffDistrict)) {
      nextForm.recipientDistrict = dropoffDistrict
    }
    if (deliveryType && ['EXPRESS', 'SAME_DAY', 'SCHEDULED'].includes(deliveryType)) {
      nextForm.deliveryType = deliveryType
    }
    if (isFragile) {
      nextForm.isFragile = isFragile === 'true'
    }
    if (packageValue) {
      nextForm.packageValue = Number(packageValue) || 0
    }

    nextForm.insuranceValue = 0

    setForm(nextForm)
    if (searchParams.get('resume') === 'checkout' && isAddressStepTextValid(nextForm) && nextForm.packageDesc.trim()) {
      setCurrentStep(2)
    }
    setIsHydrated(true)
  }, [searchParams, user?.fullName])

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') {
      return
    }

    const userDraftStorageKey = getUserDraftStorageKey(user?.id)
    const targetKey = userDraftStorageKey || anonymousDraftStorageKey

    window.localStorage.setItem(targetKey, JSON.stringify(form))
  }, [form, isHydrated, user?.id])

  useEffect(() => {
    void updateNeighborhoodSuggestions('sender', form.senderDistrict, form.senderNeighborhood)
  }, [form.senderDistrict, form.senderNeighborhood, isMapsLoaded])

  useEffect(() => {
    void updateNeighborhoodSuggestions('recipient', form.recipientDistrict, form.recipientNeighborhood)
  }, [form.recipientDistrict, form.recipientNeighborhood, isMapsLoaded])

  const updateNeighborhoodSuggestions = async (
    prefix: 'sender' | 'recipient',
    districtValue: string,
    query: string
  ) => {
    if (!isMapsLoaded || !districtValue || query.trim().length < 2 || !window.google?.maps?.places) {
      if (prefix === 'sender') setSenderSuggestions([])
      else setRecipientSuggestions([])
      return
    }

    const districtLabel = formatDistrictLabel(districtValue)
    const service = new window.google.maps.places.AutocompleteService()

    const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve) => {
      service.getPlacePredictions(
        {
          input: `${query}, ${districtLabel}, İstanbul, Türkiye`,
          componentRestrictions: { country: 'tr' },
          types: ['geocode'],
        },
        (result) => resolve(result || [])
      )
    })

    const items = predictions
      .map((prediction) => ({
        placeId: prediction.place_id,
        label: extractNeighborhoodLabel(prediction.description, districtLabel),
      }))
      .filter((item) => item.label.length > 0)
      .filter((item, index, list) => list.findIndex((candidate) => candidate.label === item.label) === index)
      .slice(0, 6)

    if (prefix === 'sender') setSenderSuggestions(items)
    else setRecipientSuggestions(items)
  }

  const geocodeFullAddress = async (address: string) => {
    if (!isMapsLoaded || !window.google?.maps?.Geocoder) {
      throw new Error('Harita servisi hazır değil')
    }

    const geocoder = new window.google.maps.Geocoder()
    const response = await geocoder.geocode({ address, region: 'tr' })
    const result = response.results[0]

    if (!result?.geometry?.location) {
      throw new Error('Adres koordinatı alınamadı')
    }

    return {
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat(),
      lng: result.geometry.location.lng(),
    }
  }

  const geocodeAddressPair = async () => {
    if (!isAddressStepTextValid(form)) {
      toast.error('Lütfen alım ve teslimat bilgilerini eksiksiz girin')
      return null
    }

    setIsGeocoding(true)

    try {
      const senderRawAddress = buildAddressString(form, 'sender')
      const recipientRawAddress = buildAddressString(form, 'recipient')

      const [senderGeo, recipientGeo] = await Promise.all([
        geocodeFullAddress(senderRawAddress),
        geocodeFullAddress(recipientRawAddress),
      ])

      setForm((current) => ({
        ...current,
        senderAddress: senderGeo.formattedAddress,
        senderLat: senderGeo.lat,
        senderLng: senderGeo.lng,
        recipientAddress: recipientGeo.formattedAddress,
        recipientLat: recipientGeo.lat,
        recipientLng: recipientGeo.lng,
      }))

      return {
        senderLat: senderGeo.lat,
        senderLng: senderGeo.lng,
        recipientLat: recipientGeo.lat,
        recipientLng: recipientGeo.lng,
      }
    } catch (error: any) {
      toast.error(error.message || 'Adres doğrulaması yapılamadı')
      return null
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleEstimate = async () => {
    const fallbackEstimate = calculateManualEstimate({
      pickupDistrict: form.senderDistrict,
      dropoffDistrict: form.recipientDistrict,
      deliveryType: form.deliveryType,
      isFragile: form.isFragile,
    })

    let senderLat = form.senderLat
    let senderLng = form.senderLng
    let recipientLat = form.recipientLat
    let recipientLng = form.recipientLng

    if (!senderLat || !recipientLat) {
      const geocoded = await geocodeAddressPair()
      if (!geocoded) {
        return null
      }

      senderLat = geocoded.senderLat
      senderLng = geocoded.senderLng
      recipientLat = geocoded.recipientLat
      recipientLng = geocoded.recipientLng
    }

    try {
      const estimate = await orderService.estimatePrice({
        senderLat,
        senderLng,
        recipientLat,
        recipientLng,
        deliveryType: form.deliveryType,
        vehicle: form.vehicle,
        isFragile: form.isFragile,
      })

      setPriceEstimate(estimate)
      return estimate
    } catch {
      if (fallbackEstimate) {
        setPriceEstimate(fallbackEstimate)
        toast('Yaklaşık fiyat gösteriliyor. Kesin tutar ödeme adımında netleşir.', { icon: 'i' })
        return fallbackEstimate
      }

      toast.error('Fiyat hesaplanamadi')
      return null
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 0) {
      const geocoded = await geocodeAddressPair()
      if (!geocoded) {
        return
      }
    }

    if (currentStep === 1) {
      if (!form.packageDesc.trim()) {
        toast.error('Lütfen paket içeriğini girin')
        return
      }

      const estimate = await handleEstimate()
      if (!estimate) {
        return
      }
    }

    setCurrentStep((step) => step + 1)
  }

  const handleProceedToPayment = async () => {
    if (!priceEstimate) {
      const estimate = await handleEstimate()
      if (!estimate) {
        return
      }
    }

    if (!accessToken) {
      const redirect = `/siparis?resume=checkout`
      router.push(`/giris?redirect=${encodeURIComponent(redirect)}`)
      return
    }

    if (user?.role === 'COURIER' || user?.role === 'ADMIN') {
      toast.error('Bu hesapla sipariş oluşturamazsınız. Lütfen müşteri hesabıyla giriş yapın.')
      router.push('/giris')
      return
    }

    setIsLoading(true)

    try {
      if (!form.senderLat || !form.recipientLat) {
        const geocoded = await geocodeAddressPair()
        if (!geocoded) {
          setIsLoading(false)
          return
        }
      }

      const response = await orderService.createOrder({
        senderName: form.senderName,
        senderPhone: form.senderPhone,
        senderAddress: form.senderAddress || buildAddressString(form, 'sender'),
        senderLat: form.senderLat,
        senderLng: form.senderLng,
        senderNotes: form.senderNotes,
        recipientName: form.recipientName,
        recipientPhone: form.recipientPhone,
        recipientAddress: form.recipientAddress || buildAddressString(form, 'recipient'),
        recipientLat: form.recipientLat,
        recipientLng: form.recipientLng,
        recipientNotes: form.recipientNotes,
        packageDesc: form.packageDesc,
        packageWeight: form.packageWeight,
        isFragile: form.isFragile,
        packageValue: form.packageValue,
        deliveryType: form.deliveryType,
        vehicle: form.vehicle,
        insuranceValue: 0,
      })

      if (response.success) {
        if (typeof window !== 'undefined') {
          const userDraftStorageKey = getUserDraftStorageKey(user?.id)
          if (userDraftStorageKey) {
            window.localStorage.removeItem(userDraftStorageKey)
          }
          window.localStorage.removeItem(anonymousDraftStorageKey)
        }
        toast.success('Siparişiniz oluşturuldu, ödeme adımına geçiliyor')
        router.push(`/odeme?orderId=${response.data.id}`)
      }
    } catch (error: any) {
      const apiMessage = error.response?.data?.message
      const validationMessage = error.response?.data?.errors?.[0]?.msg
      toast.error(apiMessage || validationMessage || 'Sipariş oluşturulamadı')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container-lg px-4 md:px-6 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-dark-700" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-dark-900">Kurye Çağır</span>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100">
        <div className="container-lg px-4 md:px-6 py-3">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium',
                    index === currentStep ? 'text-amber-600' : index < currentStep ? 'text-green-600' : 'text-dark-400'
                  )}
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      index === currentStep
                        ? 'bg-amber-500 text-white'
                        : index < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="hidden sm:block">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn('h-px w-8 md:w-16', index < currentStep ? 'bg-green-300' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-lg px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_380px] gap-6">
          <div className="space-y-5">
            {currentStep === 0 && (
              <>
                <div className="card p-5 border border-amber-100 bg-amber-50/40">
                  <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-500" />
                    Teslimat Bilgisi
                  </h3>
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-amber-200 bg-white">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark-900">Manuel İstanbul içi sipariş</p>
                      <p className="text-xs text-dark-500">
                        Test ortamında adresler ilçe ve detay alanlarıyla manuel alınıyor.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Teslimat Hızı
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {deliveryTypes.map((deliveryType) => (
                      <button
                        key={deliveryType.value}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, deliveryType: deliveryType.value }))}
                        className={cn(
                          'p-3 rounded-xl border-2 text-left transition-all',
                          form.deliveryType === deliveryType.value
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <p className={cn('text-sm font-bold', form.deliveryType === deliveryType.value ? 'text-amber-700' : 'text-dark-900')}>
                          {deliveryType.label}
                        </p>
                        <p className="text-xs text-dark-400 mt-0.5">{deliveryType.desc}</p>
                        <p className="text-xs text-dark-500 mt-2">{deliveryType.price}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <AddressCard
                  title="Alım Noktası"
                  accentClass="text-blue-700"
                  icon={<UserRound className="w-4 h-4 text-blue-600" />}
                  district={form.senderDistrict}
                  neighborhood={form.senderNeighborhood}
                  suggestions={senderSuggestions}
                  mapsReady={isMapsLoaded}
                  name={form.senderName}
                  phone={form.senderPhone}
                  addressDetail={form.senderAddressDetail}
                  notes={form.senderNotes}
                  onDistrictChange={(value) => handleDistrictChange('sender', value, setForm)}
                  onNeighborhoodChange={(value) => handleNeighborhoodChange('sender', value, setForm)}
                  onNeighborhoodSelect={(value) => selectNeighborhood('sender', value, setForm, setSenderSuggestions)}
                  onNameChange={(value) => setForm((current) => ({ ...current, senderName: value }))}
                  onPhoneChange={(value) => setForm((current) => ({ ...current, senderPhone: sanitizePhone(value) }))}
                  onAddressDetailChange={(value) => setForm((current) => updateFullAddress({ ...current, senderAddressDetail: value }, 'sender'))}
                  onNotesChange={(value) => setForm((current) => ({ ...current, senderNotes: value }))}
                />

                <AddressCard
                  title="Teslimat Noktası"
                  accentClass="text-red-600"
                  icon={<MapPin className="w-4 h-4 text-red-500" />}
                  district={form.recipientDistrict}
                  neighborhood={form.recipientNeighborhood}
                  suggestions={recipientSuggestions}
                  mapsReady={isMapsLoaded}
                  name={form.recipientName}
                  phone={form.recipientPhone}
                  addressDetail={form.recipientAddressDetail}
                  notes={form.recipientNotes}
                  onDistrictChange={(value) => handleDistrictChange('recipient', value, setForm)}
                  onNeighborhoodChange={(value) => handleNeighborhoodChange('recipient', value, setForm)}
                  onNeighborhoodSelect={(value) => selectNeighborhood('recipient', value, setForm, setRecipientSuggestions)}
                  onNameChange={(value) => setForm((current) => ({ ...current, recipientName: value }))}
                  onPhoneChange={(value) => setForm((current) => ({ ...current, recipientPhone: sanitizePhone(value) }))}
                  onAddressDetailChange={(value) =>
                    setForm((current) => updateFullAddress({ ...current, recipientAddressDetail: value }, 'recipient'))
                  }
                  onNotesChange={(value) => setForm((current) => ({ ...current, recipientNotes: value }))}
                />
              </>
            )}

            {currentStep === 1 && (
              <div className="card p-5">
                <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500" />
                  Paket Bilgileri
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Paket İçeriği</label>
                    <input
                      type="text"
                      value={form.packageDesc}
                      onChange={(event) => setForm((current) => ({ ...current, packageDesc: event.target.value }))}
                      className="input"
                      placeholder="Örn. Evrak, yemek, kutu ürün"
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Ağırlık (kg)</label>
                    <input
                      type="number"
                      value={form.packageWeight}
                      onChange={(event) => setForm((current) => ({ ...current, packageWeight: Number(event.target.value) || 1 }))}
                      className="input"
                      min="1"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFragile}
                        onChange={(event) => setForm((current) => ({ ...current, isFragile: event.target.checked }))}
                        className="w-4 h-4 rounded accent-amber-500"
                      />
                      <span className="text-sm font-medium text-dark-700">Kırılabilir / Hassas paket (+25 TL)</span>
                    </label>

                    <div className="pt-2 border-t border-gray-200">
                      <label className="label text-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        Paket Değeri (opsiyonel)
                      </label>
                      <input
                        type="number"
                        value={form.packageValue || ''}
                        onChange={(event) => {
                          const packageValue = Number(event.target.value) || 0
                          setForm((current) => ({
                            ...current,
                            packageValue,
                            insuranceValue: 0,
                          }))
                        }}
                        className="input bg-white"
                        placeholder="Örn. 1500"
                        min="0"
                      />
                      <p className="text-[10px] text-dark-400 mt-1">
                        Paket değeri sadece olası hasar süreçlerinde referans olarak kaydedilir, müşteriye ek ücret yansıtılmaz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="card p-5">
                <h3 className="font-semibold text-dark-900 mb-4">Sipariş Özeti</h3>
                <div className="space-y-3 text-sm">
                  <SummaryLine label="Alim" value={formatDistrictLabel(form.senderDistrict)} />
                  <SummaryLine label="Teslim" value={formatDistrictLabel(form.recipientDistrict)} />
                  <SummaryLine
                    label="Mesafe / Tahmini Süre"
                    value={`${priceEstimate?.distance ?? routePreview?.distance ?? '-'} km / ${priceEstimate?.estimatedMinutes ?? routePreview?.estimatedMinutes ?? '-'} dk`}
                  />
                  <SummaryLine
                      label="Teslimat Tipi"
                    value={deliveryTypes.find((item) => item.value === form.deliveryType)?.label ?? '-'}
                    highlightClass="text-amber-600"
                  />
                  {form.isFragile && <SummaryLine label="Hassas Paket Farkı" value="+25.00 TL" highlightClass="text-orange-600" />}
                  {(priceEstimate || routePreview) && (
                    <div className="mt-4 p-4 bg-amber-500 rounded-xl flex items-center justify-between text-white">
                      <span className="font-medium">Toplam Tutar</span>
                      <span className="text-2xl font-bold">
                        {(priceEstimate?.total ?? priceEstimate?.price ?? routePreview?.total ?? 0).toFixed(2)} TL
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button type="button" onClick={() => setCurrentStep((step) => step - 1)} className="btn-outline flex-1">
                  Geri
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={handleNextStep} className="btn-primary flex-1 justify-center">
                  Devam Et <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleProceedToPayment} disabled={isLoading} className="btn-primary flex-1 justify-center">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ödeme Sayfasına Geç'}
                </button>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="card p-5 sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 mb-3">Rota Özeti</p>
              <div className="space-y-3">
                <RouteBlock
                  title="Alım İlçesi"
                  value={form.senderDistrict ? formatDistrictLabel(form.senderDistrict) : 'Henüz seçilmedi'}
                />
                <RouteBlock
                  title="Teslim İlçesi"
                  value={form.recipientDistrict ? formatDistrictLabel(form.recipientDistrict) : 'Henüz seçilmedi'}
                />
                <RouteBlock
                  title="Detaylı Adresler"
                  value={
                    form.senderAddressDetail && form.recipientAddressDetail
                      ? `${form.senderAddressDetail} -> ${form.recipientAddressDetail}`
                      : 'Mahalle, sokak ve bina detaylarını ekleyin'
                  }
                />
              </div>

              <div className="mt-5 p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <SummaryLine
                  label="Yaklaşık mesafe"
                  value={routePreview ? `${routePreview.distance} km` : 'İlçe seçimi bekleniyor'}
                />
                <SummaryLine
                  label="Yaklaşık süre"
                  value={routePreview ? `${routePreview.estimatedMinutes} dk` : 'İlçe seçimi bekleniyor'}
                />
              </div>

              {!accessToken && currentStep === 2 && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Ödeme adımına geçince önce giriş veya kayıt ekranı açılır, sonra aynı siparişe devam edersiniz.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function SiparisPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <SiparisContent />
    </Suspense>
  )
}

function AddressCard({
  title,
  icon,
  accentClass,
  district,
  neighborhood,
  suggestions,
  mapsReady,
  name,
  phone,
  addressDetail,
  notes,
  onDistrictChange,
  onNeighborhoodChange,
  onNeighborhoodSelect,
  onNameChange,
  onPhoneChange,
  onAddressDetailChange,
  onNotesChange,
}: {
  title: string
  icon: ReactNode
  accentClass: string
  district: string
  neighborhood: string
  suggestions: NeighborhoodPrediction[]
  mapsReady: boolean
  name: string
  phone: string
  addressDetail: string
  notes: string
  onDistrictChange: (value: string) => void
  onNeighborhoodChange: (value: string) => void
  onNeighborhoodSelect: (value: string) => void
  onNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onAddressDetailChange: (value: string) => void
  onNotesChange: (value: string) => void
}) {
  const datalistId = `${title}-mahalle-listesi`

  return (
    <div className="card p-5">
      <h3 className={cn('font-semibold mb-3 flex items-center gap-2', accentClass)}>
        {icon}
        {title}
      </h3>
      <div className="space-y-3">
        <input type="text" value={name} onChange={(event) => onNameChange(event.target.value)} className="input" placeholder="Ad Soyad" />
        <input
          type="tel"
          value={phone}
          placeholder="Telefon (05XX XXX XX XX)"
          className="input"
          onChange={(event) => onPhoneChange(event.target.value)}
        />
        <select className="input" value={district} onChange={(event) => onDistrictChange(event.target.value)}>
          <option value="">İstanbul içi ilçe seçin</option>
          {ISTANBUL_DISTRICTS.map((districtOption) => (
            <option key={districtOption.value} value={districtOption.value}>
              {districtOption.label}
            </option>
          ))}
        </select>
        <div>
          <input
            type="text"
            className="input"
            value={neighborhood}
            list={suggestions.length ? datalistId : undefined}
            placeholder={district ? 'Mahalle yazın ve listeden seçin' : 'Önce ilçe seçin'}
            onChange={(event) => {
              onNeighborhoodChange(event.target.value)
              onNeighborhoodSelect(event.target.value)
            }}
            disabled={!district}
          />
          {Boolean(suggestions.length) && (
            <datalist id={datalistId}>
              {suggestions.map((item) => (
                <option key={item.placeId} value={item.label} />
              ))}
            </datalist>
          )}
          <p className="text-[11px] text-dark-400 mt-1">
            {mapsReady
              ? district
                ? 'Google Maps önerileri ile mahalle seçebilirsiniz.'
                : 'Mahalle seçimi için önce ilçe belirleyin.'
              : 'Google Maps yükleniyor...'}
          </p>
        </div>
        <input
          type="text"
          className="input"
          value={addressDetail}
          placeholder="Sokak / bina no / kapı bilgisi"
          onChange={(event) => onAddressDetailChange(event.target.value)}
        />
        <input
          type="text"
          className="input"
          value={notes}
          placeholder="Kat / daire / teslim notu"
          onChange={(event) => onNotesChange(event.target.value)}
        />
      </div>
    </div>
  )
}

function SummaryLine({
  label,
  value,
  highlightClass,
}: {
  label: string
  value: string
  highlightClass?: string
}) {
  return (
    <div className={cn('flex justify-between py-2 border-b border-gray-50 gap-4', highlightClass)}>
      <span className="text-dark-500">{label}</span>
      <span className={cn('font-semibold text-right text-dark-900', highlightClass)}>{value}</span>
    </div>
  )
}

function RouteBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-dark-400 font-semibold mb-2">{title}</p>
      <p className="text-sm font-semibold text-dark-900">{value}</p>
    </div>
  )
}

function sanitizePhone(value: string) {
  return value.replace(/\D/g, '').substring(0, 11)
}

function buildAddressString(form: OrderFormState, prefix: 'sender' | 'recipient') {
  const districtValue = prefix === 'sender' ? form.senderDistrict : form.recipientDistrict
  const districtLabel = districtValue ? formatDistrictLabel(districtValue) : ''
  const neighborhood = prefix === 'sender' ? form.senderNeighborhood.trim() : form.recipientNeighborhood.trim()
  const detail = prefix === 'sender' ? form.senderAddressDetail.trim() : form.recipientAddressDetail.trim()

  return [detail, neighborhood, districtLabel, 'İstanbul', 'Türkiye'].filter(Boolean).join(', ')
}

function updateFullAddress(form: OrderFormState, prefix: 'sender' | 'recipient') {
  const address = buildAddressString(form, prefix)

  if (prefix === 'sender') {
    form.senderAddress = address
    form.senderLat = 0
    form.senderLng = 0
  } else {
    form.recipientAddress = address
    form.recipientLat = 0
    form.recipientLng = 0
  }

  return form
}

function handleDistrictChange(
  prefix: 'sender' | 'recipient',
  districtValue: string,
  setForm: Dispatch<SetStateAction<OrderFormState>>
) {
  setForm((current) => {
    const updated = { ...current }

    if (prefix === 'sender') {
      updated.senderDistrict = districtValue
      updated.senderNeighborhood = ''
    } else {
      updated.recipientDistrict = districtValue
      updated.recipientNeighborhood = ''
    }

    return updateFullAddress(updated, prefix)
  })
}

function handleNeighborhoodChange(
  prefix: 'sender' | 'recipient',
  value: string,
  setForm: Dispatch<SetStateAction<OrderFormState>>
) {
  setForm((current) => {
    const updated = { ...current }

    if (prefix === 'sender') {
      updated.senderNeighborhood = value
    } else {
      updated.recipientNeighborhood = value
    }

    return updateFullAddress(updated, prefix)
  })
}

function selectNeighborhood(
  prefix: 'sender' | 'recipient',
  value: string,
  setForm: Dispatch<SetStateAction<OrderFormState>>,
  clearSuggestions: Dispatch<SetStateAction<NeighborhoodPrediction[]>>
) {
  clearSuggestions((current) => current.filter((item) => item.label.toLowerCase().includes(value.trim().toLowerCase())))
  handleNeighborhoodChange(prefix, value, setForm)
}

function isAddressStepTextValid(form: OrderFormState) {
  return Boolean(
    form.senderName.trim() &&
      form.senderPhone.trim() &&
      form.senderDistrict &&
      form.senderNeighborhood.trim() &&
      form.senderAddressDetail.trim() &&
      form.recipientName.trim() &&
      form.recipientPhone.trim() &&
      form.recipientDistrict &&
      form.recipientNeighborhood.trim() &&
      form.recipientAddressDetail.trim()
  )
}

function extractNeighborhoodLabel(description: string, districtLabel: string) {
  const parts = description.split(',').map((item) => item.trim())
  const filtered = parts.filter(
    (item) =>
      item &&
      item.toLowerCase() !== districtLabel.toLowerCase() &&
      item.toLowerCase() !== 'istanbul' &&
      item.toLowerCase() !== 'türkiye' &&
      item.toLowerCase() !== 'turkiye'
  )

  return filtered[0] || ''
}
