'use client'


import Link from 'next/link'

const cols = {
  'Hizmetler': [

    { label: 'API Entegrasyonu', href: '/entegrasyon' },
    { label: 'İşletme Hesabı', href: '/kayit' },
    { label: 'Paket Sigortası', href: '/sigorta' },
  ],
  'İşlemler': [
    { label: 'Nasıl Çalışır?', href: '#nasil-calisir' },
    { label: 'Fiyat Hesapla', href: '/hesapla' },
    { label: 'Gönderi Takip', href: '/takip' },

    { label: 'SSS', href: '/sss' },
  ],
  'Kurumsal': [
    { label: 'Hakkımızda', href: '/hakkimizda' },
    { label: 'İletişim', href: '/iletisim' },
  ],
  'Destek': [
    { label: 'Yardım Merkezi', href: '/yardim' },
    { label: 'Kurye Ol', href: '/kurye-ol' },
    { label: 'Gizlilik Politikası', href: '/gizlilik' },
    { label: 'Kullanım Şartları', href: '/sartlar' },
    { label: 'Çerez Politikası', href: '/cerez' },
  ],
}

export function Footer() {
  return (
    <footer style={{ background: '#140500', color: 'rgba(255,255,255,0.45)', fontFamily: "'Barlow', sans-serif" }}>

      {/* Üst şerit */}
      <div style={{ background: '#c8860a', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#1c0800', }}>
              Uygulamayı İndirin
            </span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(28,8,0,0.65)' }}>iOS ve Android</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['App Store', 'Google Play'].map(store => (
              <Link key={store} href="/mobil-uygulama" style={{
                background: '#1c0800', color: '#fff',
                padding: '9px 18px', borderRadius: 6,
                fontSize: '0.82rem', fontWeight: 700,
                textDecoration: 'none', letterSpacing: '0.03em',
                fontFamily: "'Barlow', sans-serif",
              }}>
                {store}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Ana footer */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40, marginBottom: 60 }} className="footer-cols">

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M13 3L6 14h6l-1 7 7-11h-6l1-7z" fill="white" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1 }}>
                  VIN<span style={{ color: '#c8860a' }}>KURYE</span>
                </div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginTop: 2 }}>
                  Motokurye Hizmeti
                </div>
              </div>
            </Link>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.70, maxWidth: 260, marginBottom: 24, color: 'rgba(255,255,255,0.45)' }}>
              İstanbul'da bireysel ve kurumsal motokurye hizmeti.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="tel:+902121234567" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>📞 0212 123 45 67</a>
              <a href="mailto:destek@vinkurye.com" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>✉️ destek@vinkurye.com</a>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)' }}>📍 İstanbul, Türkiye</span>
            </div>
          </div>

          {/* Kolonlar */}
          {Object.entries(cols).map(([title, items]) => (
            <div key={title}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.60)', letterSpacing: '0.08em', marginBottom: 16 }}>
                {title}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.40)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = '#c8860a' }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.40)' }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Alt çizgi */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.30)' }}>
            © {new Date().getFullYear()} Vın Kurye. Tüm hakları saklıdır.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Gizlilik', 'Şartlar', 'Çerez'].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.30)', textDecoration: 'none' }}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-cols { grid-template-columns: 1fr 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .footer-cols { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
