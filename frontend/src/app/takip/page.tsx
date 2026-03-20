'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Search } from 'lucide-react'

export default function TakipPage() {
  const router = useRouter()
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      router.push(`/takip/${code.trim()}`)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Barlow', sans-serif" }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 36, height: 36, background: '#c8860a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="#1c0800" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: '#1c0800' }}>
          PRIME<span style={{ color: '#c8860a' }}>KURYE</span>
        </span>
      </Link>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 32px', maxWidth: 480, width: '100%', boxShadow: '0 4px 20px rgba(28,8,0,0.08)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c0800', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
          Gönderi Takip
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#a89080', marginBottom: 28 }}>
          Takip kodunuzu girerek gönderinizin durumunu öğrenin.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Takip kodu (örn: PK1A2B3C)"
              className="input"
              style={{ flex: 1, fontFamily: 'monospace' }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!code.trim()}
              style={{
                padding: '12px 20px',
                background: '#c8860a',
                color: '#1c0800',
                border: 'none',
                borderRadius: 8,
                cursor: code.trim() ? 'pointer' : 'not-allowed',
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: code.trim() ? 1 : 0.6,
              }}
            >
              <Search size={16} />
              Sorgula
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}