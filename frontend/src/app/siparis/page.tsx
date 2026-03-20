'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { Zap, ArrowLeft, MapPin, Package, Truck, Clock, ChevronRight, Loader2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { orderService } from '@/lib/orderService'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
const ISTANBUL_CENTER = { lat: 41.0082, lng: 28.9784 }
const ISTANBUL_BOUNDS = {
  north: 41.3201,
  south: 40.8020,
  east: 29.4580,
  west: 28.5025,
}

const deliveryTypes = [
  { value: 'EXPRESS', label: 'Ekspres', desc: '1-2 saat', price: '200₺+', color: 'brand' },
  { value: 'SAME_DAY', label: 'Aynı Gün', desc: 'Gün sonu', price: '94,90₺+', color: 'dark' },
  { value: 'SCHEDULED', label: 'Planlanmış', desc: 'Seçtiğin saat', price: '110,90₺+', color: 'dark' },
]

const steps = ['Adresler', 'Paket', 'Özet']

export default function SiparisPage() {
  const router = useRouter()
  const { accessToken, user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [directions, setDirections] = useState<any>(null)
  const [priceEstimate, setPriceEstimate] = useState<any>(null)

  // Form state
  const [form, setForm] = useState({
    senderName: user?.fullName || '',
    senderPhone: '',
    senderAddress: '',
    senderLat: 0,
    senderLng: 0,
    senderNotes: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientLat: 0,
    recipientLng: 0,
    recipientNotes: '',
    packageDesc: '',
    packageWeight: 1,
    isFragile: false,
    packageValue: 0,
    deliveryType: 'EXPRESS' as 'EXPRESS' | 'SAME_DAY' | 'SCHEDULED',
    vehicle: 'MOTORCYCLE' as 'MOTORCYCLE', // Sabitlendi
    insuranceValue: 0,
  })

  const senderRef = useRef<HTMLInputElement>(null)
  const recipientRef = useRef<HTMLInputElement>(null)
  const senderStreetRef = useRef<HTMLInputElement>(null)
  const recipientStreetRef = useRef<HTMLInputElement>(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: ['places'],
  })

  // Adres arama (Places Autocomplete)
  const [senderBounds, setSenderBounds] = useState<any>(null)
  const [recipientBounds, setRecipientBounds] = useState<any>(null)

  const initAutocomplete = useCallback((
    input: HTMLInputElement | null,
    type: 'sender' | 'recipient',
    searchType: 'neighborhood' | 'street' = 'neighborhood'
  ) => {
    if (!input || !isLoaded) return

    const bounds = searchType === 'street'
      ? (type === 'sender' ? senderBounds : recipientBounds)
      : new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(40.8020, 28.5025),
        new window.google.maps.LatLng(41.3201, 29.4580)
      )

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'TR' },
      fields: ['formatted_address', 'geometry', 'address_components', 'name'],
      types: searchType === 'street' ? ['address'] : ['geocode'],
      bounds: searchType === 'street' && bounds
        ? bounds
        : new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(ISTANBUL_BOUNDS.south, ISTANBUL_BOUNDS.west),
          new window.google.maps.LatLng(ISTANBUL_BOUNDS.north, ISTANBUL_BOUNDS.east)
        ),
      strictBounds: true,
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      const isIstanbul = place.address_components?.some(
        (c: any) => c.long_name === 'İstanbul' || c.short_name === 'İstanbul'
      )
      
      if (!isIstanbul) {
        toast.error('Şu an sadece İstanbul içi hizmet veriyoruz')
        input.value = ''
        return
      }

      if (place.geometry?.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const address = place.formatted_address || ''

        if (searchType === 'neighborhood') {
          const newBounds = place.geometry.viewport ||
            new window.google.maps.LatLngBounds(
              new window.google.maps.LatLng(lat - 0.01, lng - 0.01),
              new window.google.maps.LatLng(lat + 0.01, lng + 0.01)
            )

          if (type === 'sender') {
            setSenderBounds(newBounds)
            setForm(f => ({ ...f, senderAddress: address, senderLat: lat, senderLng: lng }))
            senderStreetRef.current?.focus()
          } else {
            setRecipientBounds(newBounds)
            setForm(f => ({ ...f, recipientAddress: address, recipientLat: lat, recipientLng: lng }))
            recipientStreetRef.current?.focus()
          }
        } else {
          if (type === 'sender') {
            setForm(f => ({ ...f, senderAddress: address, senderLat: lat, senderLng: lng }))
          } else {
            setForm(f => ({ ...f, recipientAddress: address, recipientLat: lat, recipientLng: lng }))
          }
        }
      }
    })
  }, [isLoaded, senderBounds, recipientBounds])

  const handleEstimate = async () => {
    if (!form.senderLat || !form.recipientLat) return
    try {
      const estimate = await orderService.estimatePrice({
        senderLat: form.senderLat,
        senderLng: form.senderLng,
        recipientLat: form.recipientLat,
        recipientLng: form.recipientLng,
        deliveryType: form.deliveryType,
        vehicle: form.vehicle,
        isFragile: form.isFragile,
        packageValue: form.packageValue
      })
      setPriceEstimate(estimate)

      if (isLoaded) {
        const directionsService = new window.google.maps.DirectionsService()
        directionsService.route({
          origin: { lat: form.senderLat, lng: form.senderLng },
          destination: { lat: form.recipientLat, lng: form.recipientLng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (status === 'OK') setDirections(result)
        })
      }
    } catch {
      toast.error('Fiyat hesaplanamadı')
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 0) {
      if (!form.senderAddress || !form.recipientAddress) {
        toast.error('Lütfen adres bilgilerini girin')
        return
      }
      if (!form.senderLat || !form.recipientLat) {
        toast.error('Lütfen listeden adres seçin')
        return
      }
    }
    if (currentStep === 1) {
        await handleEstimate()
    }
    setCurrentStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (!accessToken) {
      router.push('/giris')
      return
    }
    setIsLoading(true)
    try {
      const res = await orderService.createOrder(form)
      if (res.success) {
        toast.success('Sipariş oluşturuldu!')
        router.push(`/siparis/basari?code=${res.data.trackingCode}&orderId=${res.data.id}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sipariş oluşturulamadı')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container-lg px-4 md:px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
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

      {/* Adım göstergesi */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-lg px-4 md:px-6 py-3">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={cn(
                  'flex items-center gap-1.5 text-sm font-medium',
                  i === currentStep ? 'text-brand-600' :
                    i < currentStep ? 'text-green-600' : 'text-dark-400'
                )}>
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    i === currentStep ? 'bg-brand-500 text-white' :
                      i < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  )}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:block">{step}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('h-px w-8 md:w-16', i < currentStep ? 'bg-green-300' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-lg px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">

            {currentStep === 0 && (
              <>
                {/* Hizmet Tipi Bilgisi (Seçim Kalktı) */}
                <div className="card p-5 border-brand-100 bg-brand-50/20">
                  <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-500" />
                    Hizmet Bilgisi
                  </h3>
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-brand-200 bg-white shadow-sm">
                    <div className="text-2xl">🏍️</div>
                    <div>
                      <p className="text-sm font-bold text-dark-900">Standart Moto Kurye</p>
                      <p className="text-xs text-dark-500">İstanbul içi hızlı ve güvenli teslimat.</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-1 rounded">Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-500" />
                    Teslimat Hızı
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {deliveryTypes.map((dt) => (
                      <button
                        key={dt.value}
                        onClick={() => setForm(f => ({ ...f, deliveryType: dt.value as any }))}
                        className={cn(
                          'p-3 rounded-xl border-2 text-left transition-all',
                          form.deliveryType === dt.value
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <p className={cn('text-sm font-bold', form.deliveryType === dt.value ? 'text-brand-700' : 'text-dark-900')}>
                          {dt.label}
                        </p>
                        <p className="text-xs text-dark-400 mt-0.5">{dt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-500" />
                    Alım Noktası
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={form.senderName}
                      onChange={e => setForm(f => ({ ...f, senderName: e.target.value }))}
                      className="input"
                      placeholder="Gönderici Ad Soyad"
                    />
                    <input
                      type="tel"
                      value={form.senderPhone}
                      placeholder="Telefon (05XX XXX XX XX)"
                      className="input"
                      onChange={e => setForm(f => ({ ...f, senderPhone: e.target.value.replace(/\D/g, '').substring(0, 11) }))}
                    />
                    <input
                      ref={senderRef}
                      type="text"
                      className="input"
                      placeholder="İlçe (Seçiniz)"
                      onFocus={() => initAutocomplete(senderRef.current, 'sender', 'neighborhood')}
                    />
                    <input
                      ref={senderStreetRef}
                      type="text"
                      className="input"
                      placeholder="Mahalle / Sokak"
                      onFocus={() => initAutocomplete(senderStreetRef.current, 'sender', 'street')}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Bina No / Kat / Daire"
                      onChange={e => setForm(f => ({ ...f, senderNotes: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-dark-900" />
                    Teslimat Noktası
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={form.recipientName}
                      onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
                      className="input"
                      placeholder="Alıcı Ad Soyad"
                    />
                    <input
                      type="tel"
                      value={form.recipientPhone}
                      placeholder="Telefon"
                      className="input"
                      onChange={e => setForm(f => ({ ...f, recipientPhone: e.target.value.replace(/\D/g, '').substring(0, 11) }))}
                    />
                    <input
                      ref={recipientRef}
                      type="text"
                      className="input"
                      placeholder="İlçe (Seçiniz)"
                      onFocus={() => initAutocomplete(recipientRef.current, 'recipient', 'neighborhood')}
                    />
                    <input
                      ref={recipientStreetRef}
                      type="text"
                      className="input"
                      placeholder="Mahalle / Sokak"
                      onFocus={() => initAutocomplete(recipientStreetRef.current, 'recipient', 'street')}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Bina No / Kat / Daire"
                      onChange={e => setForm(f => ({ ...f, recipientNotes: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 1 && (
              <div className="card p-5">
                <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-500" />
                  Paket Bilgileri
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={form.packageDesc}
                    onChange={e => setForm(f => ({ ...f, packageDesc: e.target.value }))}
                    className="input"
                    placeholder="Paket İçeriği (Örn: Evrak, Yemek vb.)"
                  />
                  <div>
                    <label className="label text-xs">Ağırlık (kg)</label>
                    <input
                      type="number"
                      value={form.packageWeight}
                      onChange={e => setForm(f => ({ ...f, packageWeight: parseFloat(e.target.value) }))}
                      className="input"
                      min="1"
                    />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFragile}
                        onChange={e => setForm(f => ({ ...f, isFragile: e.target.checked }))}
                        className="w-4 h-4 rounded accent-brand-500"
                      />
                      <span className="text-sm font-medium text-dark-700">Kırılabilir / Hassas Paket (+25₺)</span>
                    </label>

                    <div className="pt-2 border-t border-gray-200">
                      <label className="label text-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-500" /> 
                        Sigorta Bedeli (Paket Değeri ₺)
                      </label>
                      <input
                        type="number"
                        value={form.packageValue || ''}
                        onChange={e => setForm(f => ({ ...f, packageValue: parseFloat(e.target.value) }))}
                        className="input bg-white"
                        placeholder="Örn: 1500"
                      />
                      <p className="text-[10px] text-dark-400 mt-1">* Değerin %2'si oranında sigorta bedeli yansıtılır.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="card p-5">
                <h3 className="font-semibold text-dark-900 mb-4">Sipariş Özeti</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-dark-500">Mesafe / Tahmini</span>
                    <span className="font-semibold text-dark-900">
                      {priceEstimate?.distance} km / {priceEstimate?.estimatedMinutes} dk
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-dark-500">Hız</span>
                    <span className="font-semibold text-brand-600">
                      {deliveryTypes.find(d => d.value === form.deliveryType)?.label}
                    </span>
                  </div>
                  {form.isFragile && (
                    <div className="flex justify-between py-2 border-b border-gray-50 text-orange-600">
                      <span>Hassas Paket Farkı</span>
                      <span className="font-bold">+25.00 ₺</span>
                    </div>
                  )}
                  {form.packageValue > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-50 text-blue-600">
                      <span>Güvenlik / Sigorta</span>
                      <span className="font-bold">+{(form.packageValue * 0.02).toFixed(2)} ₺</span>
                    </div>
                  )}
                  {priceEstimate && (
                    <div className="mt-4 p-4 bg-brand-500 rounded-xl flex items-center justify-between text-white">
                      <span className="font-medium">Toplam Tutar</span>
                      <span className="text-2xl font-bold">
                        {priceEstimate.total?.toFixed(2) || priceEstimate.price?.toFixed(2)} ₺
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button onClick={() => setCurrentStep(s => s - 1)} className="btn-outline flex-1">Geri</button>
              )}
              {currentStep < steps.length - 1 ? (
                <button onClick={handleNextStep} className="btn-primary flex-1 justify-center">
                  Devam Et <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isLoading} className="btn-primary flex-1 justify-center">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Siparişi Onayla'}
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="card overflow-hidden sticky top-24 h-[600px]">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={form.senderLat ? { lat: form.senderLat, lng: form.senderLng } : ISTANBUL_CENTER}
                  zoom={form.senderLat ? 13 : 11}
                >
                  {form.senderLat > 0 && <Marker position={{ lat: form.senderLat, lng: form.senderLng }} label="A" />}
                  {form.recipientLat > 0 && <Marker position={{ lat: form.recipientLat, lng: form.recipientLng }} label="B" />}
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100"><Loader2 className="animate-spin" /></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}