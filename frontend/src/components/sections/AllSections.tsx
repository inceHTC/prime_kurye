'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

// ================================
// HOW IT WORKS
// ================================
export function HowItWorksSection() {
  return (
    <section id="nasil-calisir" style={{ padding: '96px 24px', background: '#faf9f7' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="how-grid">

          {/* Sol — görsel */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(28,8,0,0.18)' }}>
              <img
                src="/images/nasil-calisir.png"
                alt="Motokurye teslimat yapıyor"
                style={{ width: '100%', height: 480, objectFit: 'cover', display: 'block' }}
              />
            </div>
            {/* Üstündeki kart */}
            <div style={{
              position: 'absolute', bottom: -20, right: -20,
              background: '#c8860a',
              borderRadius: 10, padding: '20px 24px',
              boxShadow: '0 8px 32px rgba(200,134,10,0.40)',
              minWidth: 160,
            }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '2.5rem', color: '#1c0800', lineHeight: 1 }}>
                2 dk
              </div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem', color: 'rgba(28,8,0,0.70)', fontWeight: 600, marginTop: 4, letterSpacing: '0.04em' }}>
                Kurye atama süresi
              </div>
            </div>
          </div>

          {/* Sağ — adımlar */}
          <div>
            <div style={{
              display: 'inline-block', background: '#fef8ed', color: '#c8860a',
              fontFamily: "'Barlow', sans-serif", fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '0.1em',
              padding: '5px 12px', borderRadius: 4, marginBottom: 16,
              border: '1px solid rgba(200,134,10,0.20)',
            }}>
              Nasıl Çalışır?
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(36px, 4vw, 52px)',
              fontWeight: 800,
              color: '#1c0800', marginBottom: 40,
            }}>
              4 Adımda<br />Teslimat
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                { n: '01', title: 'Sipariş Oluştur', desc: 'Web veya uygulama üzerinden alım ve teslimat adresini gir, paket bilgilerini ekle.' },
                { n: '02', title: '2 Dakikada Kurye', desc: 'Sistemimiz en yakın müsait motokurye\'yi bulur ve atar. SMS bildirimi alırsın.' },
                { n: '03', title: 'Canlı Takip Et', desc: 'Harita üzerinden motokurye\'nin konumunu gerçek zamanlı olarak takip et.' },
                { n: '04', title: 'Teslim Edildi', desc: 'Alıcı paketi teslim alır, fotoğraflı onay kaydedilir. Tamamdır.' },
              ].map((step, i) => (
                <div key={step.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                    background: i === 0 ? '#c8860a' : '#f5f3ef',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800, fontSize: '1.1rem',
                      color: i === 0 ? '#1c0800' : '#a89080',
                    }}>
                      {step.n}
                    </span>
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700, fontSize: '1.15rem',
                      color: '#1c0800',
                      marginBottom: 6,
                    }}>
                      {step.title}
                    </h3>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.65 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40 }}>
              <Link href="/siparis" className="btn-primary" style={{ padding: '14px 28px' }}>
                Hemen Başla <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .how-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  )
}

// ================================
// FOR BUSINESSES
// ================================
export function ForBusinessesSection() {
  return (
    <section id="isletmeler" style={{ padding: '96px 24px', background: '#1c0800' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="biz-grid">

          {/* Sol — metin */}
          <div>
            <div style={{
              display: 'inline-block', background: 'rgba(200,134,10,0.15)',
              color: '#c8860a', fontFamily: "'Barlow', sans-serif",
              fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em',
              padding: '5px 12px', borderRadius: 4,
              marginBottom: 16, border: '1px solid rgba(200,134,10,0.25)',
            }}>
              İşletmeler İçin
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(36px, 4vw, 52px)',
              fontWeight: 800,
              color: '#fff', marginBottom: 20, lineHeight: 1.05,
            }}>
              İşletmenizin<br />
              <span style={{ color: '#c8860a' }}>Teslimat Çözümü</span>
            </h2>
            <p style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: '1rem', color: 'rgba(255,255,255,0.60)',
              lineHeight: 1.70, marginBottom: 36,
            }}>
              E-ticaret, restoran, eczane, butik — her türlü işletme için
              ölçeklenebilir motokurye çözümü. Toplu sipariş,
              API entegrasyonu ve özel fatura seçeneği.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              {[
                'Toplu sipariş yönetimi',
                'API & e-ticaret entegrasyonu',
                'Aylık fatura ve kurumsal ödeme',
                'Özel hesap yöneticisi',
                'Detaylı raporlama ve analitik',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={16} style={{ color: '#c8860a', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.9375rem', color: 'rgba(255,255,255,0.75)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/kayit" className="btn-primary" style={{ padding: '14px 28px' }}>
                İşletme Hesabı Aç
              </Link>
              <Link href="/entegrasyon" className="btn-outline-light" style={{ padding: '13px 24px', fontSize: '0.85rem' }}>
                API Dökümantasyonu
              </Link>
            </div>
          </div>

          {/* Sağ — görsel */}
          <div>
            <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.40)' }}>
              <img
                src="/images/for-businesses.png"
                alt="İşletme paketi hazırlama"
                style={{ width: '100%', height: 480, objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .biz-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  )
}

// ================================
// FEATURES
// ================================
export function FeaturesSection() {
  const features = [
    { icon: '📍', title: 'Gerçek Zamanlı Takip', desc: 'Motokuryenin konumunu harita üzerinde canlı takip edin. Her 10 saniyede güncellenir.' },
    { icon: '🔔', title: 'Anlık Bildirimler', desc: 'Her durum değişikliğinde SMS ve e-posta. Siz sormadan haberdar olursunuz.' },
    { icon: '💳', title: 'Online Ödeme', desc: 'Kredi kartı veya banka kartı ile güvenli ödeme. Her işlem için otomatik makbuz.' },
    { icon: '📊', title: 'Detaylı Raporlar', desc: 'Sipariş geçmişi, teslimat süreleri ve harcama analizi. Excel/PDF export.' },
    { icon: '🎧', title: 'Destek Hattı', desc: 'Hafta içi 08:00–19:00, hafta sonu 09:00–18:00. WhatsApp ve telefon desteği.' },
    { icon: '🛡️', title: '10.000₺ Güvence', desc: 'Paket sigortası her siparişte dahil. Hasar ya da kayıpta tam tazminat.' },
  ]

  return (
    <section style={{ padding: '96px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-block', background: '#fef8ed', color: '#c8860a',
            fontFamily: "'Barlow', sans-serif", fontWeight: 700,
            fontSize: '0.75rem', letterSpacing: '0.1em',
            padding: '5px 12px', borderRadius: 4, marginBottom: 14,
            border: '1px solid rgba(200,134,10,0.20)',
          }}>
            Neden Vın Kurye?
          </div>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 700,
            color: '#1c0800',
            lineHeight: 1.2,
          }}>
            Her Detayı Düşündük,<br />Farkı Hissedeceksiniz
          </h2>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: 'rgba(28,8,0,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          {features.map(f => (
            <div
              key={f.title}
              style={{ padding: '36px 30px', background: '#fff', transition: 'background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: '1.1rem',
                color: '#1c0800', marginBottom: 10,
              }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
  @media (max-width: 900px) {
    .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 500px) {
    .features-grid { grid-template-columns: 1fr !important; }
  }
`}</style>
    </section>
  )
}

// ================================
// PRICING
// ================================
export function PricingSection() {
  return (
    <section id="fiyatlar" style={{ padding: '96px 24px', background: '#faf9f7' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="price-grid">

          {/* Sol */}
          <div>
            <div style={{
              display: 'inline-block', background: '#fef8ed', color: '#c8860a',
              fontFamily: "'Barlow', sans-serif", fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '0.1em',
              padding: '5px 12px', borderRadius: 4, marginBottom: 16,
              border: '1px solid rgba(200,134,10,0.20)',
            }}>
              Fiyatlar
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(36px, 4vw, 52px)',
              fontWeight: 800,
              color: '#1c0800', marginBottom: 16,
            }}>
              Şeffaf Fiyat,<br />Süpriz Yok
            </h2>
            <p style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: '1rem', color: '#7a6050',
              lineHeight: 1.65, marginBottom: 36,
            }}>
              Sipariş vermeden önce tam fiyatı görürsünüz.
              Mesafe ve hız tipine göre otomatik hesaplanır.
              Gizli ücret, yakıt zammı veya ek ücret yoktur.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'KDV dahil fiyatlar',
                'İlk siparişe %20 indirim',
                'Paket sigortası dahil',
                'Minimum sipariş yok',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={16} style={{ color: '#c8860a', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', color: '#4a3020' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ — tablo */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.10)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(28,8,0,0.08)' }}>
            <div style={{ background: '#1c0800', padding: '18px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16 }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.78rem', color: 'rgba(255,255,255,0.50)', }}>Hizmet</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.78rem', color: 'rgba(255,255,255,0.50)', }}>Min. Fiyat</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.78rem', color: 'rgba(255,255,255,0.50)', }}>Katsayı</span>
              </div>
            </div>
            {[
              { name: 'Ekspres', base: '110 ₺', km: '×1,40', highlight: true },
              { name: 'Aynı Gün', base: '80 ₺', km: '×1,00', highlight: false },
              { name: 'Planlanmış', base: '68 ₺', km: '×0,85', highlight: false },
            ].map((row, i) => (
              <div
                key={row.name}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16,
                  padding: '18px 28px',
                  borderBottom: i < 2 ? '1px solid rgba(28,8,0,0.07)' : 'none',
                  background: row.highlight ? '#fef8ed' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!row.highlight) (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                onMouseLeave={e => { if (!row.highlight) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.9rem', color: '#1c0800' }}>{row.name}</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#1c0800' }}>{row.base}</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.9rem', color: '#c8860a' }}>{row.km}</span>
              </div>
            ))}
            <div style={{ padding: '12px 28px', background: '#f5f3ef', borderTop: '1px solid rgba(28,8,0,0.08)' }}>
              <p style={{ fontSize: '0.7rem', color: '#a89080', marginBottom: 10 }}>
                65₺ baz + kademeli km ücreti (9₺→7₺→5₺). Karşı yaka geçişinde ×1,85 mesafe katsayısı uygulanır.
              </p>
              <Link href="/hesapla" className="btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                Fiyat Hesapla
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .price-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  )
}

// ================================
// TESTIMONIALS
// ================================
export function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'Günde en az 15 siparişimi Vın Kurye ile gönderiyorum. Teslimat süreleri çok tutarlı, müşteri şikayeti neredeyse sıfır.',
      name: 'Derya K.', role: 'Bloom Butik Sahibi', city: 'Beşiktaş',
      avatar: '/images/1.png',
    },
    {
      quote: 'API entegrasyonu 1 günde kuruldu. Vın Kurye ile şimdi siparişler zamanında teslim ediliyor. ',
      name: 'Gökhan A.', role: 'E-ticaret Girişimcisi', city: 'Şişli',
      avatar: '/images/2.png',
    },
    {
      quote: 'Altın ve değerli taş ürünlerin siparişlerinde teslimat çok riskli. Ekspres seçeneğiyle müşterilerim en güvenilir şekilde ürünleri teslim alıyor.',
      name: 'Yavuz D.', role: 'Kuyumcu İşletmecisi', city: 'Kadıköy',
      avatar: '/images/3.png',
    },
  ]

  return (
    <section style={{ padding: '96px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-block', background: '#fef8ed', color: '#c8860a',
            fontFamily: "'Barlow', sans-serif", fontWeight: 700,
            fontSize: '0.75rem', letterSpacing: '0.1em',
            padding: '5px 12px', borderRadius: 4, marginBottom: 14,
            border: '1px solid rgba(200,134,10,0.20)',
          }}>
            Müşteri Yorumları
          </div>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(36px, 4vw, 52px)',
            fontWeight: 800, color: '#1c0800',
          }}>
            5.000+ İşletme<br />Bize Güveniyor
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{
              padding: '32px 28px',
              background: '#faf9f7',
              borderRadius: 10, border: '1px solid rgba(28,8,0,0.08)',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              {/* Yıldızlar */}
              <div style={{ display: 'flex', gap: 3 }}>
                {Array(5).fill(0).map((_, i) => (
                  <span key={i} style={{ color: '#c8860a', fontSize: '1rem' }}>★</span>
                ))}
              </div>
              <p style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: '0.9375rem', color: '#4a3020',
                lineHeight: 1.70, flex: 1,
                fontStyle: 'italic',
              }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={t.avatar} alt={t.name}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(200,134,10,0.25)' }}
                />
                <div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#1c0800' }}>{t.name}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.78rem', color: '#a89080', marginTop: 1 }}>{t.role} · {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ================================
// CTA
// ================================
export function CtaSection() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'relative', minHeight: 480,
        display: 'flex', alignItems: 'center',
        background: '#1c0800',
      }}>
        <img
          src="/images/cta-bg.png"
          alt="Şehir teslimat"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.80,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(28,8,0,0.95) 0%, rgba(28,8,0,0.75) 100%)' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(32px, 4vw, 56px)',
            fontWeight: 700,
            color: '#fff', marginBottom: 16, lineHeight: 1.2,
          }}>
            Bugün Başlayın,{' '} <br />
            <span style={{ color: '#c8860a' }}>İlk Siparişe %20 İndirim</span>
          </h2>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: '1.0625rem', color: 'rgba(255,255,255,0.60)',
            marginBottom: 40, lineHeight: 1.65,
          }}>
            Kayıt ücreti yok. Minimum sipariş yok. İstediğiniz zaman iptal edin.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/kayit" className="btn-primary" style={{ padding: '16px 36px', fontSize: '0.95rem' }}>
              Ücretsiz Hesap Oluştur <ArrowRight size={16} />
            </Link>
            <Link href="/siparis" className="btn-outline-light" style={{ padding: '15px 32px', fontSize: '0.95rem' }}>
              Hemen Kurye Çağır
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}