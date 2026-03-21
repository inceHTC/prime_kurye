'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShieldCheck, Zap } from 'lucide-react'
import { isValidTrackingCode, normalizeTrackingCode } from '@/lib/utils'

export default function TakipPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const normalizedCode = normalizeTrackingCode(code)
  const isReady = isValidTrackingCode(normalizedCode)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!isReady) return
    router.push(`/takip/${normalizedCode}`)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f7efe7 0%, #faf9f7 40%, #faf9f7 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 36, height: 36, background: '#c8860a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="#1c0800" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: '#1c0800' }}>
          VIN<span style={{ color: '#c8860a' }}>KURYE</span>
        </span>
      </Link>

      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          border: '1px solid rgba(28,8,0,0.08)',
          padding: '40px 32px',
          maxWidth: 560,
          width: '100%',
          boxShadow: '0 20px 50px rgba(28,8,0,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={18} color="#c8860a" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1c0800', fontFamily: "'Barlow Condensed', sans-serif" }}>Gönderi Takip</h1>
            <p style={{ fontSize: '0.88rem', color: '#a89080' }}>Sipariş takip kodunuzu girerek gönderinizin son durumunu öğrenin.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="label">Takip Kodu</label>
          <input
            value={code}
            onChange={(event) => setCode(normalizeTrackingCode(event.target.value))}
            placeholder="Örn: PK8X2M9AB12"
            className="input"
            style={{
              width: '100%',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '1rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '14px 16px',
            }}
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={18}
            autoFocus
          />

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isReady ? '#166534' : '#a89080', fontSize: '0.82rem' }}>
              <ShieldCheck size={15} />
              <span>{isReady ? 'Takip kodu formatı geçerli' : 'Sadece harf ve rakam kabul edilir, kod PK ile başlar'}</span>
            </div>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.8rem',
                color: '#7a6050',
                background: '#f8f3eb',
                padding: '5px 10px',
                borderRadius: 999,
              }}
            >
              {normalizedCode || 'PK'}
            </span>
          </div>

          <button
            type="submit"
            disabled={!isReady}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: 20,
              justifyContent: 'center',
              opacity: isReady ? 1 : 0.6,
              cursor: isReady ? 'pointer' : 'not-allowed',
            }}
          >
            <Search size={16} />
            Siparişi Sorgula
          </button>
        </form>
      </div>
    </div>
  )
}
