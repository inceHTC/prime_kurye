'use client'

import { type ReactNode, useMemo, useState } from 'react'
import { ArrowRight, Clock3, MapPinned, ShieldCheck, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import {
  ISTANBUL_DISTRICTS,
  calculateManualEstimate,
  formatDistrictLabel,
  type DeliveryType,
} from '@/lib/istanbul'

const services: Array<{
  value: DeliveryType
  label: string
  detail: string
  icon: typeof Zap
}> = [
  { value: 'EXPRESS', label: 'Ekspres', detail: '1-2 saat içinde teslimat', icon: Zap },
  { value: 'SAME_DAY', label: 'Aynı Gün', detail: 'Gün sonuna kadar teslimat', icon: Clock3 },
  { value: 'SCHEDULED', label: 'Planlı', detail: 'Belirlenen zaman aralığında', icon: ShieldCheck },
]

export default function OrderCalculator() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const [formData, setFormData] = useState({
    pickupDistrict: '',
    dropoffDistrict: '',
    serviceType: 'EXPRESS' as DeliveryType,
    isFragile: false,
    packageValue: '',
  })

  const estimate = useMemo(() => {
    if (!formData.pickupDistrict || !formData.dropoffDistrict) {
      return null
    }

    return calculateManualEstimate({
      pickupDistrict: formData.pickupDistrict,
      dropoffDistrict: formData.dropoffDistrict,
      deliveryType: formData.serviceType,
      isFragile: formData.isFragile,
    })
  }, [formData])

  const handleContinue = () => {
    if (!estimate) return

    const params = new URLSearchParams({
      pickupDistrict: formData.pickupDistrict,
      dropoffDistrict: formData.dropoffDistrict,
      deliveryType: formData.serviceType,
      isFragile: String(formData.isFragile),
      packageValue: formData.packageValue || '0',
    })

    const target = `/siparis?${params.toString()}`
    router.push(accessToken ? target : `/giris?redirect=${encodeURIComponent(target)}`)
  }

  return (
    <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '0 20px' }}>
      <div className="calculator-shell">
        <section className="calculator-panel calculator-form">
          <div>
            <p className="calculator-eyebrow">Hesaplama Kartı</p>
            <h2 className="calculator-title">Teslimat bilgilerini girin.</h2>
            <p className="calculator-copy">
              Alım ve teslim ilçelerini seçin, teslimat tipini belirleyin ve isterseniz hassas paket seçeneğini ekleyin.
            </p>
          </div>

          <div className="calculator-grid">
            <Field label="Alım İlçesi">
              <select
                className="input"
                value={formData.pickupDistrict}
                onChange={(event) => setFormData((current) => ({ ...current, pickupDistrict: event.target.value }))}
              >
                <option value="">İlçe seçin</option>
                {ISTANBUL_DISTRICTS.map((district) => (
                  <option key={district.value} value={district.value}>
                    {district.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Teslim İlçesi">
              <select
                className="input"
                value={formData.dropoffDistrict}
                onChange={(event) => setFormData((current) => ({ ...current, dropoffDistrict: event.target.value }))}
              >
                <option value="">İlçe seçin</option>
                {ISTANBUL_DISTRICTS.map((district) => (
                  <option key={district.value} value={district.value}>
                    {district.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <label className="label">Teslimat Tipi</label>
            <div className="calculator-service-grid">
              {services.map((service) => {
                const Icon = service.icon
                const isActive = formData.serviceType === service.value

                return (
                  <button
                    key={service.value}
                    type="button"
                    className="calculator-service-card"
                    data-active={isActive}
                    onClick={() => setFormData((current) => ({ ...current, serviceType: service.value }))}
                  >
                    <div className="calculator-service-icon">
                      <Icon size={17} />
                    </div>
                    <strong>{service.label}</strong>
                    <span>{service.detail}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="calculator-inline-grid">
            <label className="calculator-check">
              <input
                type="checkbox"
                checked={formData.isFragile}
                onChange={(event) => setFormData((current) => ({ ...current, isFragile: event.target.checked }))}
              />
              <span>Hassas / kırılabilir paket (+25 TL)</span>
            </label>

            <Field label="Paket Değeri">
              <input
                className="input"
                type="number"
                min="0"
                step="50"
                placeholder="Örn. 1500"
                value={formData.packageValue}
                onChange={(event) => setFormData((current) => ({ ...current, packageValue: event.target.value }))}
              />
            </Field>
          </div>

          <div className="calculator-note">
            Paket değeri yalnızca güvence kaydı için alınır, müşteri fiyatına eklenmez.
          </div>
        </section>

        <aside className="calculator-panel calculator-summary">
          <div>
            <p className="calculator-eyebrow">Sonuç Kartı</p>
            <h3 className="calculator-title">Yaklaşık teslimat özeti</h3>
          </div>

          <div className="calculator-route">
            <div>
              <span>Alım</span>
              <strong>{formData.pickupDistrict ? formatDistrictLabel(formData.pickupDistrict) : 'Seçim bekleniyor'}</strong>
            </div>
            <ArrowRight size={16} />
            <div>
              <span>Teslim</span>
              <strong>{formData.dropoffDistrict ? formatDistrictLabel(formData.dropoffDistrict) : 'Seçim bekleniyor'}</strong>
            </div>
          </div>

          {estimate ? (
            <>
              <div className="calculator-estimate-list">
                <SummaryRow label="Yaklaşık mesafe" value={`${estimate.distance} km`} />
                <SummaryRow label="Tahmini süre" value={`${estimate.estimatedMinutes} dk`} />
                <SummaryRow
                  label="Teslimat tipi"
                  value={services.find((service) => service.value === formData.serviceType)?.label ?? '-'}
                />
              </div>

              <div className="calculator-total-box">
                <span>Toplam tahmini tutar</span>
                <strong>{estimate.total.toFixed(2)} TL</strong>
              </div>

              <button type="button" className="btn-primary calculator-button" onClick={handleContinue}>
                Siparişe Devam Et
                <MapPinned size={16} />
              </button>

              <p className="calculator-help">
                {accessToken
                  ? 'Sipariş sayfasında adres detaylarını tamamlayarak ödeme adımına geçebilirsiniz.'
                  : 'Devam ettiğinizde önce giriş veya kayıt ekranına yönlendirilirsiniz.'}
              </p>
            </>
          ) : (
            <div className="calculator-empty">
              İlçe seçimi tamamlandığında yaklaşık mesafe, süre ve fiyat burada gösterilir.
            </div>
          )}
        </aside>
      </div>

      <style>{`
        .calculator-shell {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
          gap: 20px;
          align-items: start;
        }

        .calculator-panel {
          background: rgba(255, 253, 248, 0.88);
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 26px;
          box-shadow: 0 20px 50px rgba(17, 17, 17, 0.05);
        }

        .calculator-form,
        .calculator-summary {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .calculator-eyebrow {
          margin: 0 0 10px;
          color: rgba(17, 17, 17, 0.52);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .calculator-title {
          margin: 0;
          color: #111111;
          font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
          font-size: clamp(1.85rem, 2.6vw, 2.7rem);
          line-height: 1.04;
          letter-spacing: -0.03em;
        }

        .calculator-copy {
          margin: 12px 0 0;
          color: rgba(17, 17, 17, 0.68);
          line-height: 1.75;
        }

        .calculator-grid,
        .calculator-inline-grid,
        .calculator-service-grid {
          display: grid;
          gap: 14px;
        }

        .calculator-grid,
        .calculator-inline-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .calculator-service-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .calculator-service-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 16px;
          border-radius: 18px;
          border: 1px solid rgba(17, 17, 17, 0.12);
          background: rgba(255, 255, 255, 0.82);
          color: #111111;
          cursor: pointer;
          text-align: left;
        }

        .calculator-service-card[data-active="true"] {
          background: #111111;
          color: #f8f3e8;
          border-color: #111111;
        }

        .calculator-service-card span {
          font-size: 0.84rem;
          line-height: 1.5;
          color: inherit;
          opacity: 0.78;
        }

        .calculator-service-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(17, 17, 17, 0.08);
        }

        .calculator-service-card[data-active="true"] .calculator-service-icon {
          background: rgba(248, 243, 232, 0.12);
        }

        .calculator-check {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(17, 17, 17, 0.1);
          font-size: 0.94rem;
          font-weight: 600;
          color: #111111;
          align-self: end;
        }

        .calculator-check input {
          width: 18px;
          height: 18px;
          accent-color: #111111;
          flex-shrink: 0;
        }

        .calculator-note,
        .calculator-route,
        .calculator-empty,
        .calculator-total-box {
          border-radius: 18px;
          border: 1px solid rgba(17, 17, 17, 0.08);
          background: rgba(255, 255, 255, 0.72);
        }

        .calculator-note {
          padding: 14px 16px;
          color: rgba(17, 17, 17, 0.68);
          font-size: 0.9rem;
          line-height: 1.7;
        }

        .calculator-route {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 10px;
          align-items: center;
          padding: 16px;
          color: #111111;
        }

        .calculator-route div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .calculator-route span {
          color: rgba(17, 17, 17, 0.5);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .calculator-route strong {
          font-size: 1rem;
          color: #111111;
        }

        .calculator-estimate-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .calculator-total-box {
          padding: 18px;
          color: #111111;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .calculator-total-box span {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(17, 17, 17, 0.55);
        }

        .calculator-total-box strong {
          font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
          font-size: 2.2rem;
          line-height: 1;
          color: #111111;
        }

        .calculator-button {
          width: 100%;
          justify-content: center;
          background: #111111;
          color: #f8f3e8;
          border: 1px solid #111111;
          box-shadow: none;
        }

        .calculator-help,
        .calculator-empty {
          color: rgba(17, 17, 17, 0.68);
          font-size: 0.9rem;
          line-height: 1.7;
        }

        .calculator-empty {
          padding: 18px;
        }

        @media (max-width: 960px) {
          .calculator-shell {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .calculator-grid,
          .calculator-inline-grid,
          .calculator-service-grid {
            grid-template-columns: 1fr;
          }

          .calculator-form,
          .calculator-summary {
            padding: 22px;
            border-radius: 22px;
          }
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '0.95rem' }}>
      <span style={{ color: 'rgba(17,17,17,0.58)' }}>{label}</span>
      <strong style={{ color: '#111111' }}>{value}</strong>
    </div>
  )
}
