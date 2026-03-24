'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, ChevronDown, ChevronUp, Search, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const categories = [
  {
    id: 'genel',
    label: 'Genel',
    icon: '💡',
    questions: [
      {
        q: 'Vın Kurye nedir?',
        a: 'Vın Kurye, İstanbul genelinde bireyler ve işletmeler için motokurye hizmeti sunan bir platformdur. Sipariş oluşturur, en yakın kuryemizi atarız ve paketiniz 60-90 dakika içinde teslim edilir.',
      },
      {
        q: 'Hizmet bölgeniz neresi?',
        a: 'Şu an yalnızca İstanbul içinde hizmet veriyoruz. Tüm ilçelere teslimat yapıyoruz. İleride diğer şehirlere de genişlemeyi planlıyoruz.',
      },
      {
        q: 'Hangi saatlerde hizmet veriyorsunuz?',
        a: 'Hafta içi 08:00-19:00, hafta sonu 09:00-18:00 saatleri arasında hizmet veriyoruz.',
      },
      {
        q: 'Kurye uygulamanız var mı?',
        a: 'Web uygulamamız tüm cihazlarda çalışmaktadır. iOS ve Android uygulamalarımız çok yakında yayınlanacak.',
      },
    ],
  },
  {
    id: 'siparis',
    label: 'Sipariş',
    icon: '📦',
    questions: [
      {
        q: 'Sipariş nasıl oluşturabilirim?',
        a: 'Kayıt olduktan sonra "Kurye Çağır" butonuna tıklayın. Alım ve teslimat adreslerini, paket bilgilerini girin. Fiyat hesaplanır ve onayladığınızda siparişiniz oluşturulur.',
      },
      {
        q: 'Kaç dakikada teslim ediliyor?',
        a: 'Ekspres teslimat seçeneğinde ortalama 60-90 dakika içinde teslim ediyoruz. Mesafe ve trafik durumuna göre değişebilir.',
      },
      {
        q: 'Siparişimi iptal edebilir miyim?',
        a: 'Evet, kurye henüz paketi almadan önce siparişinizi iptal edebilirsiniz. Dashboard\'dan siparişinizin yanındaki "İptal et" seçeneğini kullanabilirsiniz.',
      },
      {
        q: 'Aynı anda birden fazla sipariş verebilir miyim?',
        a: 'Evet, istediğiniz kadar sipariş oluşturabilirsiniz. Her sipariş ayrı bir kurye tarafından teslim edilir.',
      },
      {
        q: 'Teslimat saatini belirleyebilir miyim?',
        a: '"Planlanmış Teslimat" seçeneğiyle belirli bir saatte teslimat talep edebilirsiniz. Kurye belirlediğiniz saatte paketi alır.',
      },
      {
        q: 'Ne tür paketler gönderebilirim?',
        a: 'Belgeler, giysiler, elektronik ürünler, yiyecek ve içecek, küçük ev eşyaları ve daha fazlasını gönderebilirsiniz. Tehlikeli madde, silah ve yasadışı ürünler kabul edilmez.',
      },
    ],
  },
  {
    id: 'odeme',
    label: 'Ödeme',
    icon: '💳',
    questions: [
      {
        q: 'Ne zaman ödeme yapıyorum?',
        a: 'Kurye paketinizi aldığında ödeme yaparsınız. Paranız güvenli bir havuzda tutulur. Teslim onayını verdikten sonra para kuryeye aktarılır.',
      },
      {
        q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
        a: 'Kredi kartı ve banka kartıyla ödeme yapabilirsiniz. Ödemeler İyzico altyapısıyla 256-bit SSL şifreleme ile güvence altında işlenir.',
      },
      {
        q: 'Ödeme güvenli mi?',
        a: 'Evet. Kart bilgileriniz sistemimizde saklanmaz. Tüm ödemeler PCI DSS uyumlu İyzico altyapısıyla işlenir. Ayrıca escrow sistemiyle paranız teslim onayına kadar güvencede tutulur.',
      },
      {
        q: 'Fatura alabilir miyim?',
        a: 'İşletme hesaplarında e-fatura düzenlenebilmektedir. Profil sayfanızdan vergi bilgilerinizi ekleyerek fatura talep edebilirsiniz.',
      },
      {
        q: 'İade politikanız nedir?',
        a: 'Teslimat gerçekleşmeden iptal edilirse ödeme iadesi yapılır. Sorunlu teslimatlar için destek ekibimizle iletişime geçin.',
      },
    ],
  },
  {
    id: 'takip',
    label: 'Takip',
    icon: '📍',
    questions: [
      {
        q: 'Siparişimi nasıl takip edebilirim?',
        a: 'Sipariş oluşturduktan sonra size verilen takip koduyla primekurye.com/takip adresinden veya dashboard\'unuzdan canlı olarak takip edebilirsiniz.',
      },
      {
        q: 'Takip kodum nerede?',
        a: 'Sipariş oluşturduktan sonra ekranda gösterilir. Ayrıca Dashboard\'unuzdaki sipariş listesinden de ulaşabilirsiniz.',
      },
      {
        q: 'Kurye nerede görebilir miyim?',
        a: 'Kurye paketi aldıktan sonra takip sayfasında harita üzerinde konumunu görebilirsiniz. Konum 15 saniyede bir güncellenir.',
      },
    ],
  },
  {
    id: 'kurye',
    label: 'Kurye Olmak',
    icon: '🏍️',
    questions: [
      {
        q: 'Kurye olma şartları nelerdir?',
        a: '18 yaşında olmak, geçerli motosiklet ehliyeti, kendi motosikletiniz ve İstanbul\'da ikamet etmek yeterlidir.',
      },
      {
        q: 'Ne kadar kazanabilirim?',
        a: 'Her teslimat ücretinin %80\'ini alırsınız. Aktif bir kurye günde 5-10 teslimat yaparak aylık 15.000-25.000₺ kazanabilir.',
      },
      {
        q: 'Ödemeler ne zaman yapılır?',
        a: 'Haftalık olarak her Pazartesi banka hesabınıza aktarım yapılır. Kazançlarınızı kurye panelinizden takip edebilirsiniz.',
      },
      {
        q: 'Başvurum ne kadar sürer?',
        a: 'Başvurunuzu aldıktan sonra 24 saat içinde sizi ararız. Belgelerin onaylanmasının ardından aynı gün çalışmaya başlayabilirsiniz.',
      },
    ],
  },
  {
    id: 'isletme',
    label: 'İşletmeler',
    icon: '🏢',
    questions: [
      {
        q: 'İşletme hesabı avantajları nelerdir?',
        a: 'Toplu sipariş yönetimi, detaylı raporlama, fatura, özel fiyatlandırma ve öncelikli kurye atama gibi avantajlardan yararlanırsınız.',
      },
      {
        q: 'API entegrasyonu var mı?',
        a: 'Evet! REST API\'miz sayesinde kendi sisteminizle entegre olabilirsiniz. API dokümantasyonumuza primekurye.com/api-docs adresinden ulaşabilirsiniz.',
      },
      {
        q: 'Kurumsal fiyatlandırma var mı?',
        a: 'Yüksek hacimli işletmeler için özel fiyatlandırma sunuyoruz. Detaylar için destek@vinkurye.com adresine yazın.',
      },
    ],
  },
]

export default function SSSPage() {
  const [activeCategory, setActiveCategory] = useState('genel')
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const activeQuestions = search
    ? categories.flatMap(c => c.questions).filter(q =>
      q.q.toLowerCase().includes(search.toLowerCase()) ||
      q.a.toLowerCase().includes(search.toLowerCase())
    )
    : categories.find(c => c.id === activeCategory)?.questions || []

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#1c0800', padding: '56px 24px 64px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#fff', marginBottom: 12 }}>
          Sık Sorulan Sorular
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>
          Aradığınız cevabı bulamadıysanız bize ulaşın
        </p>

        {/* Arama */}
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <Search size={18} color="#a89080" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Soru ara..."
            style={{
              width: '100%', padding: '14px 16px 14px 46px',
              borderRadius: 10, border: 'none', outline: 'none',
              fontFamily: "'Barlow', sans-serif", fontSize: '0.95rem',
              background: '#fff', color: '#1c0800',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px' }}>

        {!search && (
          /* Kategori sekmeleri */
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.85rem',
                  background: activeCategory === cat.id ? '#1c0800' : '#fff',
                  color: activeCategory === cat.id ? '#fff' : '#4a3020',
                  transition: 'all 0.15s',
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {search && (
          <p style={{ fontSize: '0.875rem', color: '#a89080', marginBottom: 20 }}>
            "{search}" için {activeQuestions.length} sonuç bulundu
          </p>
        )}

        {/* Sorular */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#a89080' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Sonuç bulunamadı</p>
              <p style={{ fontSize: '0.875rem' }}>Farklı bir kelime deneyin veya bize yazın</p>
            </div>
          ) : (
            activeQuestions.map((item, i) => {
              const key = `${activeCategory}-${i}`
              const isOpen = openQuestion === key
              return (
                <div key={key} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(28,8,0,0.08)', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenQuestion(isOpen ? null : key)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', fontFamily: "'Barlow', sans-serif",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1c0800', flex: 1, paddingRight: 16 }}>
                      {item.q}
                    </span>
                    {isOpen
                      ? <ChevronUp size={18} color="#c8860a" style={{ flexShrink: 0 }} />
                      : <ChevronDown size={18} color="#a89080" style={{ flexShrink: 0 }} />
                    }
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(28,8,0,0.06)' }}>
                      <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.75, paddingTop: 14 }}>
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Hala sorun var mı */}
        <div style={{ marginTop: 48, background: '#1c0800', borderRadius: 14, padding: '28px 32px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>
            Aradığınızı bulamadınız mı?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', marginBottom: 20 }}>
            Destek ekibimiz size yardımcı olmaktan mutluluk duyar
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:destek@vinkurye.com" style={{
              padding: '11px 22px', background: '#c8860a', color: '#1c0800',
              borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
            }}>
              E-posta Gönder
            </a>
            <a href="tel:+902121234567" style={{
              padding: '11px 22px', background: 'rgba(255,255,255,0.10)', color: '#fff',
              borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
            }}>
              Bizi Ara
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}