'use client'

import Link from 'next/link'
import { Zap, ArrowLeft, Shield } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, fontSize: '1.1rem', color: '#1c0800',
        marginBottom: 12, paddingBottom: 8,
        borderBottom: '1px solid rgba(28,8,0,0.06)',
      }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.9rem', color: '#4a3020', lineHeight: 1.85 }}>
        {children}
      </div>
    </div>
  )
}

export default function GizlilikPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#1c0800', padding: '48px 24px 56px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(200,134,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Shield size={28} color="#c8860a" />
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: '#fff', marginBottom: 10 }}>
          Gizlilik Politikası
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)' }}>
          Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 36px' }}>

          <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.85, marginBottom: 32, padding: '16px 20px', background: '#fef8ed', borderRadius: 10 }}>
            Vın Kurye olarak kişisel verilerinizin gizliliğini ciddiye alıyoruz. Bu politika, hangi verileri topladığımızı, nasıl kullandığımızı ve haklarınızın neler olduğunu açıklamaktadır. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanmıştır.
          </p>

          <Section title="1. Veri Sorumlusu">
            <p>Kişisel verileriniz, <strong>Vın Kurye</strong> tarafından veri sorumlusu sıfatıyla işlenmektedir.</p>
            <p style={{ marginTop: 8 }}>İletişim: destek@primekurye.com | +90 212 123 45 67</p>
          </Section>

          <Section title="2. Toplanan Kişisel Veriler">
            <p style={{ marginBottom: 10 }}>Hizmetlerimizi sunmak amacıyla aşağıdaki verileri toplayabiliriz:</p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Kimlik bilgileri:</strong> Ad, soyad, T.C. kimlik numarası</li>
              <li><strong>İletişim bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
              <li><strong>Hesap bilgileri:</strong> Kullanıcı adı, şifreli hesap bilgileri</li>
              <li><strong>Sipariş bilgileri:</strong> Alım/teslimat adresleri, paket içeriği, fiyat</li>
              <li><strong>Ödeme bilgileri:</strong> Kart son 4 hanesi (tam kart bilgisi saklanmaz)</li>
              <li><strong>Konum bilgileri:</strong> Kurye için anlık konum (teslimat süresince)</li>
              <li><strong>Teknik bilgiler:</strong> IP adresi, tarayıcı türü, cihaz bilgisi</li>
              <li><strong>Kurye belgeleri:</strong> Ehliyet, ruhsat, kimlik, sabıka kaydı</li>
            </ul>
          </Section>

          <Section title="3. Verilerin İşlenme Amaçları">
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Kurye hizmeti sunmak ve siparişleri yönetmek</li>
              <li>Kullanıcı hesabı oluşturmak ve doğrulamak</li>
              <li>Ödeme işlemlerini gerçekleştirmek</li>
              <li>Gerçek zamanlı sipariş takibi sağlamak</li>
              <li>Müşteri desteği sunmak</li>
              <li>Hizmet kalitesini iyileştirmek ve analiz yapmak</li>
              <li>Yasal yükümlülükleri yerine getirmek</li>
              <li>Güvenlik önlemleri almak ve doğrulama yapmak</li>
            </ul>
          </Section>

          <Section title="4. Verilerin Paylaşılması">
            <p>Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:</p>
            <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Kurye — Müşteri:</strong> Teslimat için gerekli iletişim bilgileri</li>
              <li><strong>Ödeme sağlayıcısı:</strong> İyzico (PCI DSS uyumlu)</li>
              <li><strong>Yasal zorunluluk:</strong> Mahkeme kararı veya resmi talep</li>
              <li><strong>İş ortakları:</strong> Yalnızca hizmet sunumu için gerekli ölçüde</li>
            </ul>
            <p style={{ marginTop: 10 }}>Verileriniz <strong>asla</strong> reklam amaçlı üçüncü taraflarla paylaşılmaz veya satılmaz.</p>
          </Section>

          <Section title="5. Verilerin Saklanma Süresi">
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Hesap verileri: Hesap silinene kadar</li>
              <li>Sipariş kayıtları: 10 yıl (vergi mevzuatı gereği)</li>
              <li>Ödeme kayıtları: 10 yıl</li>
              <li>Konum verileri: Teslimat tamamlandıktan 30 gün sonra</li>
              <li>Kurye belgeleri: Sözleşme sona erişinden itibaren 5 yıl</li>
            </ul>
          </Section>

          <Section title="6. Çerezler (Cookies)">
            <p>Web sitemizde şu amaçlarla çerez kullanıyoruz:</p>
            <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Zorunlu çerezler:</strong> Oturum yönetimi ve güvenlik</li>
              <li><strong>Analitik çerezler:</strong> Site kullanımını anlama (anonim)</li>
              <li><strong>Tercih çerezleri:</strong> Dil ve ayar tercihleri</li>
            </ul>
            <p style={{ marginTop: 10 }}>Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.</p>
          </Section>

          <Section title="7. KVKK Kapsamındaki Haklarınız">
            <p style={{ marginBottom: 10 }}>6698 sayılı KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenen verileriniz hakkında bilgi talep etme</li>
              <li>Verilerin işlenme amacını ve amaca uygun kullanımını öğrenme</li>
              <li>Yurt içi/yurt dışı aktarım bilgisi talep etme</li>
              <li>Eksik veya yanlış verilerin düzeltilmesini isteme</li>
              <li>Verilerin silinmesini veya yok edilmesini talep etme</li>
              <li>Otomatik sistemler aracılığıyla aleyhinize sonuç oluşmasına itiraz etme</li>
              <li>Zararın giderilmesini talep etme</li>
            </ul>
            <p style={{ marginTop: 12 }}>Haklarınızı kullanmak için <strong>kvkk@primekurye.com</strong> adresine yazabilirsiniz.</p>
          </Section>

          <Section title="8. Veri Güvenliği">
            <p>Verilerinizi korumak için şu önlemleri alıyoruz:</p>
            <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>256-bit SSL/TLS şifreleme</li>
              <li>Şifrelerin hash'lenerek saklanması (bcrypt)</li>
              <li>JWT tabanlı güvenli kimlik doğrulama</li>
              <li>Düzenli güvenlik denetimleri</li>
              <li>Erişim kontrolleri ve yetkilendirme</li>
              <li>Ödeme verilerinin PCI DSS uyumlu sistemde işlenmesi</li>
            </ul>
          </Section>

          <Section title="9. Politika Değişiklikleri">
            <p>Bu politikada yapılacak önemli değişiklikler e-posta veya uygulama bildirimi ile size iletilecektir. Güncel politikayı her zaman bu sayfada bulabilirsiniz.</p>
          </Section>

          <Section title="10. İletişim">
            <p>Gizlilik konularında sorularınız için:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>E-posta: kvkk@primekurye.com</li>
              <li>Telefon: +90 212 123 45 67</li>
              <li>Adres: İstanbul, Türkiye</li>
            </ul>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  )
}