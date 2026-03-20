'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { isValidTrackingCode, normalizeTrackingCode } from '@/lib/utils'

export function HeroSection() {
  const [trackCode, setTrackCode] = useState('')
  const normalizedTrackCode = normalizeTrackingCode(trackCode)
  const canTrack = isValidTrackingCode(normalizedTrackCode)

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          background: '#1c0800',
          overflow: 'hidden',
        }}
      >
        <img
          src="/images/hero-bg.png"
          alt="Motokurye teslimat"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(28,8,0,0.95) 0%, rgba(28,8,0,0.70) 50%, rgba(28,8,0,0.20) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: 'linear-gradient(to top, #1c0800, transparent)',
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ maxWidth: 620 }}>
            <div
              className="animate-fade-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(200,134,10,0.15)',
                border: '1px solid rgba(200,134,10,0.35)',
                borderRadius: 4,
                padding: '6px 14px',
                marginBottom: 28,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8860a' }} />
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#c8860a',
                  letterSpacing: '0.08em',
                }}
              >
                İstanbul'da Aktif · 1.000+ Motokurye
              </span>
            </div>

            <h1
              className="animate-fade-up delay-100"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(52px, 7vw, 90px)',
                fontWeight: 700,
                lineHeight: 0.95,
                color: '#fff',
                marginBottom: 24,
                letterSpacing: '-0.02em',
              }}
            >
              Sen Çağır,
              <br />
              <span style={{ color: '#c8860a' }}>Biz Ulaştıralım.</span>
            </h1>

            <p
              className="animate-fade-up delay-200"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 'clamp(16px, 2vw, 18px)',
                color: 'rgba(255,255,255,0.70)',
                marginBottom: 40,
                lineHeight: 1.65,
                maxWidth: 480,
              }}
            >
              Bireysel ve kurumsal profesyonel motokurye hizmeti.
              <br />
              Kapıdan kapıya 60-90 dakika, gerçek zamanlı takip, %99.9 teslimat başarısı.
            </p>

            <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/siparis" className="btn-primary" style={{ fontSize: '0.9rem', padding: '15px 32px' }}>
                Hemen Kurye Çağır
                <ArrowRight size={16} />
              </Link>
              <Link href="#nasil-calisir" className="btn-outline-light" style={{ fontSize: '0.9rem', padding: '14px 28px' }}>
                Nasıl Çalışır?
              </Link>
            </div>

            <div
              className="animate-fade-up delay-400"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: 4,
                display: 'flex',
                gap: 0,
                maxWidth: 440,
              }}
            >
              <input
                value={trackCode}
                onChange={(event) => setTrackCode(normalizeTrackingCode(event.target.value))}
                placeholder="Takip kodu girin... (ör: PK1A2B3C)"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  padding: '11px 16px',
                  color: '#fff',
                  outline: 'none',
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: '0.875rem',
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && canTrack) {
                    window.location.href = `/takip/${normalizedTrackCode}`
                  }
                }}
              />
              <Link
                href={canTrack ? `/takip/${normalizedTrackCode}` : '/takip'}
                style={{
                  background: '#c8860a',
                  color: '#1c0800',
                  border: 'none',
                  borderRadius: 5,
                  padding: '11px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  opacity: canTrack ? 1 : 0.75,
                }}
              >
                <Search size={14} />
                Takip Et
              </Link>
            </div>
          </div>
        </div>

        <div
          className="hidden lg:flex"
          style={{
            position: 'absolute',
            right: 60,
            top: '50%',
            transform: 'translateY(-50%)',
            flexDirection: 'column',
            gap: 12,
            zIndex: 1,
          }}
        >
          {[
            { value: '5.000+', label: 'Aktif İşletme' },
            { value: '< 2 dk', label: 'Kurye Atama' },
            { value: '%99.9', label: 'Başarı Oranı' },
            { value: '10.000₺', label: 'Paket Güvencesi' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '16px 20px',
                backdropFilter: 'blur(8px)',
                minWidth: 160,
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#c8860a',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.55)',
                  marginTop: 4,
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: '#c8860a',
          borderTop: '3px solid #a06a08',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
          }}
          className="quick-strip"
        >
          {[
            { icon: '⚡', title: '60-90 Dakika', desc: 'Ekspres teslimat' },
            { icon: '📍', title: 'Canlı Takip', desc: 'Gerçek zamanlı harita' },
            { icon: '🛡️', title: '10.000₺ Güvence', desc: 'Paket sigortası' },
            { icon: '🏍️', title: 'Motokurye', desc: 'Kapıdan kapıya' },
          ].map((item, index) => (
            <div
              key={item.title}
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                borderRight: index < 3 ? '1px solid rgba(28,8,0,0.15)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#1c0800',
                    letterSpacing: '0.02em',
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: '0.8rem',
                    color: 'rgba(28,8,0,0.65)',
                    fontWeight: 500,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .quick-strip { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .quick-strip { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
