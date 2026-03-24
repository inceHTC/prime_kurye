'use client'

import Link from 'next/link'
import { Zap, ArrowLeft, FileText, Shield, AlertCircle } from 'lucide-react'

export default function KuryeSozlesmesiPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#1c0800', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 40 }}>
        <Link href="/kurye-ol" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', padding: 6 }}>
          <ArrowLeft size={20} />
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: '#c8860a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#1c0800" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff' }}>
            VIN<span style={{ color: '#c8860a' }}>KURYE</span>
          </span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>· Kurye Hizmet Sözleşmesi</span>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Uyarı */}
        <div style={{ background: '#fef9c3', border: '1px solid rgba(234,179,8,0.30)', borderRadius: 10, padding: '14px 18px', marginBottom: 28, display: 'flex', gap: 10 }}>
          <AlertCircle size={18} color="#854d0e" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.85rem', color: '#854d0e', lineHeight: 1.6 }}>
            Bu sözleşme taslak niteliğindedir. Yayına geçmeden önce bir hukuk bürosundan onay alınması zorunludur.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 36px' }}>

          {/* Başlık */}
          <div style={{ textAlign: 'center', marginBottom: 36, paddingBottom: 28, borderBottom: '2px solid rgba(28,8,0,0.08)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: '#fef8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <FileText size={26} color="#c8860a" />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#1c0800', marginBottom: 6 }}>
              KURYE HİZMET SÖZLEŞMESİ
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#a89080' }}>
              Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </p>
          </div>

          {/* İçerik */}
          <div style={{ fontSize: '0.9rem', color: '#4a3020', lineHeight: 1.85 }}>

            <Section title="1. TARAFLAR">
              <p>İşbu Kurye Hizmet Sözleşmesi ("Sözleşme"), aşağıda "Platform" olarak anılacak Vın Kurye ile kurye olarak başvuran kişi ("Kurye") arasında akdedilmiştir.</p>
            </Section>

            <Section title="2. SÖZLEŞMENİN KONUSU">
              <p>Bu Sözleşme, Kurye'nin Vın Kurye platformu üzerinden sunulan kurye hizmetlerini gerçekleştirmesine ilişkin hak ve yükümlülükleri düzenlemektedir. Kurye, Platform üzerinden gelen siparişleri kabul ederek, belirtilen adresten paketi alıp teslimat adresine ulaştırmayı taahhüt eder.</p>
            </Section>

            <Section title="3. KURYE'NİN YÜKÜMLÜLÜKLERİ">
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Geçerli motosiklet sürücü belgesi ve araç ruhsatına sahip olmak ve bunları güncel tutmak</li>
                <li>Zorunlu trafik sigortası ve kasko yaptırmak</li>
                <li>Teslimatları özenle ve zamanında gerçekleştirmek</li>
                <li>Paketlere zarar vermemek; hasar durumunda sorumluluğu kabul etmek</li>
                <li>Platform kurallarına ve etik kurallara uymak</li>
                <li>Müşterilere karşı saygılı ve profesyonel davranmak</li>
                <li>Kişisel verilerin gizliliğine uymak (KVKK)</li>
                <li>Alkol veya uyuşturucu etkisi altında araç kullanmamak</li>
                <li>Trafik kurallarına uymak</li>
                <li>Platform uygulamasında konumunu açık tutmak</li>
              </ul>
            </Section>

            <Section title="4. PLATFORM'UN YÜKÜMLÜLÜKLERİ">
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Siparişleri adil ve şeffaf şekilde dağıtmak</li>
                <li>Kurye kazançlarını haftada bir banka hesabına aktarmak</li>
                <li>10.000₺ kargo kayıp/hasar sigortası sağlamak</li>
                <li>Kurye desteği ve eğitim materyali sunmak</li>
                <li>Kurye kişisel verilerini korumak</li>
              </ul>
            </Section>

            <Section title="5. ÜCRET VE ÖDEME">
              <p>Kurye, her başarılı teslimat için müşteriden tahsil edilen hizmet bedelinin <strong>%80'ini</strong> alır. Kalan %20, platform komisyonu ve vergi karşılığı olarak düşülür.</p>
              <p style={{ marginTop: 8 }}>Ödemeler her hafta Pazartesi günü, Kurye'nin sisteme kayıtlı banka hesabına aktarılır. Asgari ödeme tutarı 100₺ olup bu tutara ulaşılmayan kazançlar bir sonraki haftaya aktarılır.</p>
            </Section>

            <Section title="6. BAĞIMSIZ ÇALIŞAN STATÜSÜ">
              <p>Kurye, Platform ile bağımsız hizmet sağlayıcı ilişkisi içindedir. Bu Sözleşme, bir işçi-işveren ilişkisi tesis etmez. Kurye; SGK, vergi ve diğer yasal yükümlülüklerden bizzat sorumludur. Kurye, kendi adına serbest meslek makbuzu veya fatura düzenlemekle yükümlüdür.</p>
            </Section>

            <Section title="7. VERİ GİZLİLİĞİ VE KVKK">
              <p>Kurye, görev sırasında öğrendiği müşteri bilgilerini (isim, adres, telefon) hiçbir üçüncü tarafla paylaşamaz. Kişisel Verilerin Korunması Kanunu (6698 sayılı KVKK) kapsamındaki yükümlülüklere uymayı kabul eder.</p>
            </Section>

            <Section title="8. SİGORTA VE SORUMLULUK">
              <p>Kurye, kendi aracı için zorunlu trafik sigortasını yaptırmak zorundadır. Platform, kargo kayıp/hasar durumları için sigorta sağlar. Trafik kazaları ve üçüncü şahıslara verilen zararlar kurye'nin sorumluluğundadır.</p>
            </Section>

            <Section title="9. HESAP ASKIYA ALMA VE FESİH">
              <p>Platform, aşağıdaki durumlarda Kurye hesabını geçici olarak askıya alabilir veya kalıcı olarak kapatabilir:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>Müşteri şikayeti veya düşük puan ortalaması (4.0 altı)</li>
                <li>Paket hasarı veya kayıp</li>
                <li>Trafik kuralları ihlali</li>
                <li>Platform kurallarının ihlali</li>
                <li>Sahte belge sunma</li>
                <li>Yasadışı faaliyetlerde bulunma</li>
              </ul>
            </Section>

            <Section title="10. UYUŞMAZLIK ÇÖZÜMÜ">
              <p>İşbu Sözleşme'den doğan uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir. Türk Hukuku uygulanır.</p>
            </Section>

            <Section title="11. YÜRÜRLÜK">
              <p>Bu Sözleşme, Kurye tarafından dijital olarak onaylandığı tarihte yürürlüğe girer ve taraflardan birinin feshi ile sona erer.</p>
            </Section>

          </div>

          {/* İletişim */}
          <div style={{ marginTop: 32, padding: '16px 20px', background: '#faf9f7', borderRadius: 10, fontSize: '0.82rem', color: '#a89080' }}>
            <strong style={{ color: '#4a3020' }}>İletişim:</strong> Vın Kurye · destek@vinkurye.com · +90 212 123 45 67
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/kurye-ol" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', background: '#1c0800', color: '#fff',
            borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
          }}>
            <ArrowLeft size={16} /> Başvuru Formuna Dön
          </Link>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#1c0800', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(28,8,0,0.06)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}