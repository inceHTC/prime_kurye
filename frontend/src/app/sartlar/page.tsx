'use client'

import Link from 'next/link'
import { Zap, FileText } from 'lucide-react'
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

export default function SartlarPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#1c0800', padding: '48px 24px 56px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(200,134,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <FileText size={28} color="#c8860a" />
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: '#fff', marginBottom: 10 }}>
          Kullanım Şartları
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)' }}>
          Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 36px' }}>

          <p style={{ fontSize: '0.9rem', color: '#7a6050', lineHeight: 1.85, marginBottom: 32, padding: '16px 20px', background: '#fef8ed', borderRadius: 10 }}>
            Vın Kurye platformunu kullanmadan önce bu Kullanım Şartları'nı dikkatlice okuyunuz. Platformu kullanarak bu şartları kabul etmiş sayılırsınız.
          </p>

          <Section title="1. Hizmetin Tanımı">
            <p>Vın Kurye, İstanbul genelinde bireyler ve işletmeler için motokurye hizmeti sunan bir dijital platformdur. Platform; sipariş oluşturma, kurye eşleştirme, gerçek zamanlı takip ve güvenli ödeme hizmetleri sunar.</p>
          </Section>

          <Section title="2. Kullanıcı Hesabı">
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Platforma kayıt olmak için 18 yaşını doldurmuş olmak zorunludur.</li>
              <li>Hesap bilgilerinizin doğru ve güncel olması sizin sorumluluğunuzdadır.</li>
              <li>Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın.</li>
              <li>Bir kişi birden fazla hesap açamaz.</li>
              <li>Sahte bilgilerle açılan hesaplar derhal kapatılır.</li>
            </ul>
          </Section>

          <Section title="3. Sipariş ve Teslimat">
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Sipariş oluştururken verilen adres ve iletişim bilgilerinin doğruluğundan kullanıcı sorumludur.</li>
              <li>Yanlış adres veya iletişim bilgisi nedeniyle oluşan sorunlar platformun sorumluluğu dışındadır.</li>
              <li>Teslimat süresi tahmini olup trafik ve hava koşullarına göre değişebilir.</li>
              <li>Paketi kurye almadan önce iptal edilebilir; kurye aldıktan sonra iptal mümkün değildir.</li>
              <li>Yasadışı, tehlikeli veya patlayıcı maddeler gönderilemez.</li>
              <li>Paket içeriğinin beyanından kullanıcı sorumludur.</li>
            </ul>
          </Section>

          <Section title="4. Yasaklı İçerikler">
            <p style={{ marginBottom: 10 }}>Aşağıdaki ürünlerin gönderilmesi kesinlikle yasaktır:</p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Uyuşturucu ve psikotropik maddeler</li>
              <li>Silah, mühimmat ve patlayıcılar</li>
              <li>Canlı hayvanlar</li>
              <li>İnsan organları veya tıbbi atıklar</li>
              <li>Yanıcı ve tehlikeli kimyasallar</li>
              <li>Sahte para veya belgeler</li>
              <li>Telif hakkı ihlali oluşturan ürünler</li>
            </ul>
            <p style={{ marginTop: 10 }}>Bu kurallara aykırı gönderim yapan kullanıcıların hesabı kapatılır ve yasal işlem başlatılır.</p>
          </Section>

          <Section title="5. Ödeme Şartları">
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Ödeme, kurye paketi aldığında gerçekleşir.</li>
              <li>Para, teslimat onaylanana kadar güvenli escrow sisteminde tutulur.</li>
              <li>Onay verilmezse, 72 saat sonra otomatik olarak işlem tamamlanır.</li>
              <li>İade, yalnızca kurye paket almadan iptal yapılırsa gerçekleşir.</li>
              <li>Ödeme bilgileri üçüncü taraflarla paylaşılmaz.</li>
            </ul>
          </Section>

          <Section title="6. Sorumluluk Sınırları">
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Platform, kargo kayıp/hasarı için 10.000₺'ye kadar sigorta güvencesi sunar.</li>
              <li>Yanlış beyan edilen paket içeriğinden doğan hasarlar sigorta kapsamı dışındadır.</li>
              <li>Mücbir sebep durumlarında (deprem, sel, salgın vb.) platform sorumlu tutulamaz.</li>
              <li>Platform, teslimat süresinin aşılmasından dolayı oluşan dolaylı zararlardan sorumlu değildir.</li>
            </ul>
          </Section>

          <Section title="7. Fikri Mülkiyet">
            <p>Platform üzerindeki tüm içerikler, tasarımlar, yazılımlar ve markalar Vın Kurye'ye aittir. İzinsiz kopyalanması, dağıtılması veya kullanılması yasaktır.</p>
          </Section>

          <Section title="8. Hesap Askıya Alma ve Kapatma">
            <p>Aşağıdaki durumlarda hesabınız uyarısız kapatılabilir:</p>
            <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Bu şartların ihlali</li>
              <li>Sahte bilgi veya belge sunma</li>
              <li>Dolandırıcılık girişimi</li>
              <li>Diğer kullanıcılara zarar verme</li>
              <li>Yasadışı ürün gönderimi</li>
            </ul>
          </Section>

          <Section title="9. Değişiklikler">
            <p>Platform, bu şartları önceden bildirmeksizin güncelleme hakkını saklı tutar. Önemli değişiklikler e-posta veya uygulama bildirimi ile iletilecektir. Platformu kullanmaya devam etmeniz güncel şartları kabul ettiğiniz anlamına gelir.</p>
          </Section>

          <Section title="10. Uygulanacak Hukuk">
            <p>Bu şartlar Türk Hukuku'na tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</p>
          </Section>

          <Section title="11. İletişim">
            <p>Kullanım şartları hakkında sorularınız için:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>E-posta: destek@vinkurye.com</li>
              <li>Telefon: +90 212 123 45 67</li>
            </ul>
          </Section>

        </div>

        {/* Alt linkler */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
          <Link href="/gizlilik" style={{ fontSize: '0.875rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
            Gizlilik Politikası
          </Link>
          <span style={{ color: '#a89080' }}>·</span>
          <Link href="/kurye-sozlesmesi" style={{ fontSize: '0.875rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
            Kurye Sözleşmesi
          </Link>
          <span style={{ color: '#a89080' }}>·</span>
          <Link href="/sss" style={{ fontSize: '0.875rem', color: '#c8860a', textDecoration: 'none', fontWeight: 600 }}>
            SSS
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}