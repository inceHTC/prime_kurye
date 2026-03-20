'use client'

import Link from 'next/link'
import { Cookie } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#1c0800', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(28,8,0,0.06)' }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.9rem', color: '#4a3020', lineHeight: 1.85 }}>{children}</div>
    </div>
  )
}

const cookies = [
  { name: 'session_token', type: 'Zorunlu', purpose: 'Oturum yönetimi', duration: 'Oturum süresi' },
  { name: 'auth_token', type: 'Zorunlu', purpose: 'Kimlik doğrulama', duration: '7 gün' },
  { name: 'refresh_token', type: 'Zorunlu', purpose: 'Token yenileme', duration: '30 gün' },
  { name: '_ga', type: 'Analitik', purpose: 'Google Analytics', duration: '2 yıl' },
  { name: 'lang_pref', type: 'Tercih', purpose: 'Dil tercihi', duration: '1 yıl' },
]

export default function CerezPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <div style={{ background: '#1c0800', padding: '56px 24px 64px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: '#fff', marginBottom: 10 }}>
          Çerez Politikası
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)' }}>
          Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,8,0,0.08)', padding: '40px 36px' }}>

          <Section title="1. Çerez Nedir?">
            <p>Çerezler, web sitelerinin tarayıcınıza yerleştirdiği küçük metin dosyalarıdır. Oturum bilgilerinizi hatırlamak, tercihlerinizi kaydetmek ve site deneyiminizi iyileştirmek amacıyla kullanılır.</p>
          </Section>

          <Section title="2. Kullandığımız Çerez Türleri">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {[
                { type: 'Zorunlu Çerezler', desc: 'Sitenin temel işlevleri için gereklidir. Oturum yönetimi ve güvenlik. Bu çerezler devre dışı bırakılamaz.' },
                { type: 'Analitik Çerezler', desc: 'Site kullanımını anonim olarak analiz etmek için kullanılır. Bu veriler siteyi iyileştirmemize yardımcı olur.' },
                { type: 'Tercih Çerezleri', desc: 'Dil, bölge ve diğer tercihlerinizi hatırlamak için kullanılır.' },
              ].map(c => (
                <div key={c.type} style={{ padding: '14px 16px', background: '#faf9f7', borderRadius: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c0800', marginBottom: 4 }}>{c.type}</p>
                  <p style={{ fontSize: '0.82rem', color: '#7a6050' }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="3. Çerez Listesi">
            <div style={{ overflowX: 'auto', marginTop: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#faf9f7' }}>
                    {['Çerez Adı', 'Tür', 'Amaç', 'Süre'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#a89080', borderBottom: '1px solid rgba(28,8,0,0.08)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cookies.map(c => (
                    <tr key={c.name} style={{ borderBottom: '1px solid rgba(28,8,0,0.05)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#c8860a' }}>{c.name}</td>
                      <td style={{ padding: '10px 14px', color: '#4a3020' }}>{c.type}</td>
                      <td style={{ padding: '10px 14px', color: '#4a3020' }}>{c.purpose}</td>
                      <td style={{ padding: '10px 14px', color: '#a89080' }}>{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="4. Çerezleri Nasıl Yönetebilirsiniz?">
            <p>Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz:</p>
            <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Chrome:</strong> Ayarlar → Gizlilik → Çerezler</li>
              <li><strong>Firefox:</strong> Ayarlar → Gizlilik → Çerezler</li>
              <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</li>
              <li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
            </ul>
            <p style={{ marginTop: 10 }}>Zorunlu çerezleri devre dışı bırakmanız site işlevselliğini olumsuz etkileyebilir.</p>
          </Section>

          <Section title="5. İletişim">
            <p>Çerez politikamız hakkında sorularınız için: <strong>destek@primekurye.com</strong></p>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  )
}