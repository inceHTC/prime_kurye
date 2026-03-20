'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const services = [
  {
    id: 'ekspres',
    title: 'Ekspres Teslimat',
    subtitle: '60 – 90 dakika içinde',
    desc: 'En acil gönderileriniz için. Sipariş verildikten sonra 2 dakika içinde en yakın motokurye atanır, kapınızda.',
    price: '200₺',
    priceNote: 'den başlayan fiyatlar',
    img: '/images/service-ekspres.png',
    highlight: true,
  },
  {
    id: 'ayni-gun',
    title: 'Aynı Gün Teslimat',
    subtitle: 'Gün sonuna kadar',
    desc: 'Acele olmayan gönderiler için en ekonomik seçenek. Siparişiniz gün içinde teslim edilir.',
    price: '94,90₺',
    priceNote: 'den başlayan fiyatlar',
    img: '/images/service-ayni-gun.png',
    highlight: false,
  },
  {
    id: 'planlanmis',
    title: 'Planlanmış Teslimat',
    subtitle: 'Belirlediğin saatte',
    desc: 'Teslimat saatini siz belirleyin. Önceden planlayın, motokuryeniz tam zamanında gelsin.',
    price: '110,90₺',
    priceNote: 'den başlayan fiyatlar',
    img: '/images/service-planlanmis.png',
    highlight: false,
  },
]

export function ServicesSection() {
  return (
    <section id="hizmetler" style={{ padding: '96px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Başlık */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 56 }}>
          <div>
            <div style={{
              display: 'inline-block',
              background: '#fef8ed', color: '#c8860a',
              fontFamily: "'Barlow', sans-serif", fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '0.1em',
              padding: '5px 12px',
              borderRadius: 4, marginBottom: 14,
              border: '1px solid rgba(200,134,10,0.20)',
            }}>
              Hizmetlerimiz
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(36px, 4vw, 52px)',
              fontWeight: 800,
              color: '#1c0800', letterSpacing: '-0.01em',
            }}>
              İhtiyacınıza Uygun<br />Teslimat Seçeneği
            </h2>
          </div>
          <Link href="/siparis" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: "'Barlow', sans-serif", fontWeight: 600,
            fontSize: '0.9rem', color: '#c8860a', textDecoration: 'none',
            borderBottom: '2px solid #c8860a', paddingBottom: 2,
          }}>
            Tüm hizmetleri gör <ArrowRight size={16} />
          </Link>
        </div>

        {/* Servis kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {services.map(s => (
            <div key={s.id} style={{
              borderRadius: 10,
              overflow: 'hidden',
              border: s.highlight ? '2px solid #c8860a' : '1px solid rgba(28,8,0,0.10)',
              boxShadow: s.highlight ? '0 8px 32px rgba(200,134,10,0.20)' : '0 2px 12px rgba(28,8,0,0.07)',
              background: '#fff',
              display: 'flex', flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = s.highlight ? '0 16px 48px rgba(200,134,10,0.28)' : '0 12px 36px rgba(28,8,0,0.12)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = s.highlight ? '0 8px 32px rgba(200,134,10,0.20)' : '0 2px 12px rgba(28,8,0,0.07)'
              }}
            >
              {/* Görsel */}
              <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                <img
                  src={s.img}
                  alt={s.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: s.highlight
                    ? 'linear-gradient(to bottom, transparent 20%, rgba(28,8,0,0.85) 100%)'
                    : 'linear-gradient(to bottom, transparent 20%, rgba(28,8,0,0.80) 100%)',
                }} />
                {s.highlight && (
                  <div style={{
                    position: 'absolute', top: 14, left: 14,
                    background: '#c8860a', color: '#1c0800',
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 700, fontSize: '0.72rem',
                    padding: '4px 10px', borderRadius: 4,
                  }}>
                    En Popüler
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 2 }}>
                  <div style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600, fontSize: '1.25rem',
                    color: '#fff', letterSpacing: '-0.01em',
                  }}>
                    {s.title}
                  </div>
                  <div style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)',
                    fontWeight: 400, marginTop: 4,
                  }}>
                    {s.subtitle}
                  </div>
                </div>
              </div>
              {/* İçerik */}
              <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.65,
                }}>
                  {s.desc}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(28,8,0,0.08)' }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: '#1c0800', lineHeight: 1, letterSpacing: '-0.02em' }}>
                      {s.price}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.75rem', color: '#a89080', marginTop: 2 }}>
                      {s.priceNote}
                    </div>
                  </div>
                  <Link href="/siparis" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.82rem' }}>
                    Seç
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}