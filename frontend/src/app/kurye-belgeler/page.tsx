'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, Upload, FileText, CheckCircle,
  Loader2, AlertCircle, ArrowRight, Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

const DOCS = [
  {
    field: 'identityDoc',
    label: 'Kimlik Belgesi',
    desc: 'TC Kimlik kartı veya pasaport (ön-arka)',
    required: true,
    icon: '🪪',
  },
  {
    field: 'licenseDoc',
    label: 'Motosiklet Ehliyeti',
    desc: 'Geçerli A1/A2/A sınıfı ehliyet',
    required: true,
    icon: '🪪',
  },
  {
    field: 'vehicleDoc',
    label: 'Araç Ruhsatı',
    desc: 'Motosikletinize ait güncel ruhsat',
    required: true,
    icon: '📋',
  },
  {
    field: 'criminalRecord',
    label: 'Sabıka Kaydı',
    desc: 'e-Devlet\'ten alınan güncel sabıka kaydı belgesi',
    required: true,
    icon: '📄',
  },
]

export default function KuryeBelgelerPage() {
  const router = useRouter()
  const { user, accessToken } = useAuthStore()
  const [files, setFiles] = useState<Record<string, File | null>>({
    identityDoc: null,
    licenseDoc: null,
    vehicleDoc: null,
    criminalRecord: null,
  })
  const [contractSigned, setContractSigned] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [docStatus, setDocStatus] = useState<any>(null)
  const [step, setStep] = useState<'docs' | 'contract' | 'done'>('docs')

  useEffect(() => {
    if (!accessToken) { router.push('/giris'); return }
    if (user?.role !== 'COURIER') { router.push('/'); return }
    fetchDocStatus()
  }, [accessToken])

  const fetchDocStatus = async () => {
    try {
      const res = await api.get('/courier-docs/my')
      if (res.data.success) {
        setDocStatus(res.data.data)
        if (res.data.data.contractSigned) setStep('done')
        else if (res.data.data.documentsSubmitted) setStep('contract')
      }
    } catch {
      // İlk kez açılıyor
    }
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }))
  }

  const allRequired = DOCS.filter(d => d.required).every(d => files[d.field] !== null)

  const handleUpload = async () => {
    if (!allRequired) {
      toast.error('Tüm zorunlu belgeleri yükleyin')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      Object.entries(files).forEach(([field, file]) => {
        if (file) formData.append(field, file)
      })

      const res = await api.post('/courier-docs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data.success) {
        toast.success('Belgeler yüklendi!')
        setStep('contract')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Yükleme başarısız')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSignContract = async () => {
    if (!contractSigned) {
      toast.error('Sözleşmeyi kabul etmelisiniz')
      return
    }

    try {
      const res = await api.post('/courier-docs/sign-contract', { agreed: true })
      if (res.data.success) {
        toast.success('Sözleşme imzalandı!')
        setStep('done')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'İşlem başarısız')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#1c0800" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff' }}>
            PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
          </span>
        </Link>
        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>
          {user?.fullName}
        </span>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Adım göstergesi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
          {[
            { num: 1, label: 'Belgeler', active: step === 'docs', done: step !== 'docs' },
            { num: 2, label: 'Sözleşme', active: step === 'contract', done: step === 'done' },
            { num: 3, label: 'Tamamlandı', active: step === 'done', done: false },
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'unset' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: s.done ? '#16a34a' : s.active ? '#c8860a' : '#f5f3ef',
                  color: s.done || s.active ? '#fff' : '#a89080',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s',
                }}>
                  {s.done ? <CheckCircle size={16} /> : s.num}
                </div>
                <span style={{ fontSize: '0.72rem', color: s.active ? '#c8860a' : '#a89080', fontWeight: s.active ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: 2, background: s.done ? '#16a34a' : 'rgba(28,8,0,0.10)', margin: '0 8px', marginBottom: 20, transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* ADIM 1 — BELGELER */}
        {step === 'docs' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 6 }}>
                Belgelerinizi Yükleyin
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#a89080' }}>
                Tüm belgeler güvenli şekilde saklanır, yalnızca yetkili personel görebilir.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {DOCS.map(doc => (
                <div key={doc.field} style={{
                  background: '#fff', borderRadius: 12, border: `1px solid ${files[doc.field] ? 'rgba(22,163,74,0.30)' : 'rgba(28,8,0,0.08)'}`,
                  padding: '16px 18px', transition: 'border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: '1.4rem' }}>{doc.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c0800' }}>{doc.label}</p>
                        {doc.required && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: 3 }}>
                            Zorunlu
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#a89080', marginBottom: 10 }}>{doc.desc}</p>

                      {files[doc.field] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle size={16} color="#16a34a" />
                          <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                            {files[doc.field]!.name}
                          </span>
                          <button onClick={() => handleFileChange(doc.field, null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a89080', fontSize: '0.75rem', padding: 0 }}>
                            Değiştir
                          </button>
                        </div>
                      ) : (
                        <label style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '7px 14px', background: '#f5f3ef', borderRadius: 6,
                          cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#4a3020',
                        }}>
                          <Upload size={14} />
                          Dosya Seç
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            style={{ display: 'none' }}
                            onChange={e => handleFileChange(doc.field, e.target.files?.[0] || null)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fef8ed', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 8 }}>
              <Shield size={16} color="#c8860a" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.78rem', color: '#7a6050', lineHeight: 1.6 }}>
                Belgeleriniz 256-bit şifreleme ile korunur. Yalnızca Prime Kurye yetkilileri görebilir.
                Kabul edilmez belge türleri: eksik, bulanık veya süresi dolmuş belgeler.
              </p>
            </div>

            <button
              onClick={handleUpload}
              disabled={!allRequired || isUploading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 0', background: '#c8860a', color: '#1c0800',
                border: 'none', borderRadius: 8, cursor: (!allRequired || isUploading) ? 'not-allowed' : 'pointer',
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1rem',
                opacity: (!allRequired || isUploading) ? 0.6 : 1,
              }}
            >
              {isUploading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Yükleniyor...</>
                : <>Belgeleri Yükle <ArrowRight size={18} /></>
              }
            </button>
          </div>
        )}

        {/* ADIM 2 — SÖZLEŞME */}
        {step === 'contract' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 6 }}>
                Sözleşmeyi İnceleyin
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#a89080' }}>
                Belgeleriniz alındı. Şimdi kurye hizmet sözleşmesini okuyup onaylayın.
              </p>
            </div>

            {/* Sözleşme özeti */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', padding: '20px 22px', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c0800', marginBottom: 14 }}>Sözleşme Özeti</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '💰', text: 'Her teslimat ücretinin %80\'ini alırsınız' },
                  { icon: '📅', text: 'Haftalık ödeme — her Pazartesi banka hesabınıza' },
                  { icon: '🛡️', text: '10.000₺ kargo kayıp/hasar sigortası' },
                  { icon: '⚖️', text: 'Bağımsız çalışan statüsü — vergi kendi sorumluluğunuzda' },
                  { icon: '🔒', text: 'Müşteri bilgilerini gizli tutma yükümlülüğü (KVKK)' },
                  { icon: '🏍️', text: 'Trafik kurallarına uyma zorunluluğu' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.85rem' }}>
                    <span>{item.icon}</span>
                    <span style={{ color: '#4a3020', lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tam sözleşme linki */}
            <Link href="/kurye-sozlesmesi" target="_blank" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 16px', background: '#f5f3ef', borderRadius: 8,
              textDecoration: 'none', marginBottom: 20,
              color: '#1c0800', fontWeight: 600, fontSize: '0.875rem',
            }}>
              <FileText size={16} color="#c8860a" />
              Tam Sözleşmeyi Oku (Yeni sekmede açılır)
              <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
            </Link>

            {/* Onay kutuları */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={contractSigned}
                  onChange={e => setContractSigned(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: '#c8860a', flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.85rem', color: '#4a3020', lineHeight: 1.6 }}>
                  <strong>Kurye Hizmet Sözleşmesi</strong>'ni okudum, anladım ve tüm şartları kabul ediyorum. Bu onay, dijital imza niteliği taşımaktadır.
                </span>
              </label>
            </div>

            <button
              onClick={handleSignContract}
              disabled={!contractSigned}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 0', background: '#1c0800', color: '#fff',
                border: 'none', borderRadius: 8, cursor: !contractSigned ? 'not-allowed' : 'pointer',
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1rem',
                opacity: !contractSigned ? 0.5 : 1,
              }}
            >
              <CheckCircle size={18} />
              Sözleşmeyi İmzala
            </button>
          </div>
        )}

        {/* ADIM 3 — TAMAMLANDI */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={44} color="#16a34a" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 10 }}>
              Başvurunuz Tamamlandı!
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.7, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
              Belgeleriniz ve sözleşmeniz alındı. Ekibimiz belgelerinizi inceleyecek ve
              <strong> 24 saat içinde</strong> sizi arayarak hesabınızı aktif edecek.
            </p>

            <div style={{ background: '#fef8ed', borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left', maxWidth: 400, margin: '0 auto 28px' }}>
              <p style={{ fontSize: '0.82rem', color: '#7a6050', lineHeight: 1.8 }}>
                📱 Telefonunuzu açık tutun<br />
                📧 E-postanızı kontrol edin<br />
                ✅ Onaylandıktan sonra kurye paneliniz aktif olacak
              </p>
            </div>

            <Link href="/kurye" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', background: '#c8860a', color: '#1c0800',
              borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            }}>
              Kurye Paneline Git <ArrowRight size={16} />
            </Link>
          </div>
        )}

      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}