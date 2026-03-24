import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'VinKurye <noreply@primekurye.com>'

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f0ede8; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 32px auto; }
    .card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(28,8,0,0.08); }
    .header { background: #1c0800; padding: 24px 32px; display: flex; align-items: center; gap: 10px; }
    .logo { font-size: 20px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
    .logo span { color: #c8860a; }
    .body { padding: 32px; }
    .badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 18px; }
    h2 { font-size: 20px; color: #1c0800; margin: 0 0 10px; }
    p { font-size: 14px; color: #5a4030; line-height: 1.7; margin: 0 0 12px; }
    .info-box { background: #faf9f6; border-radius: 10px; padding: 16px 20px; margin: 18px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(28,8,0,0.06); font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #a89080; }
    .info-value { color: #1c0800; font-weight: 600; }
    .tracking { text-align: center; margin: 20px 0; }
    .tracking-code { display: inline-block; background: #1c0800; color: #c8860a; padding: 10px 24px; border-radius: 8px; font-size: 18px; font-weight: 800; letter-spacing: 2px; font-family: monospace; }
    .btn { display: block; width: fit-content; margin: 20px auto 0; background: #c8860a; color: #1c0800; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 800; font-size: 14px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #a89080; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">VIN<span>KURYE</span></div>
      </div>
      <div class="body">
        ${content}
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} VinKurye · İstanbul, Türkiye<br/>
      Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayın.
    </div>
  </div>
</body>
</html>`
}

// Sipariş oluşturuldu
export async function sendOrderCreatedEmail(to: string, data: {
  fullName: string
  trackingCode: string
  recipientName: string
  recipientAddress: string
  price: number
  deliveryType: string
}) {
  const typeLabel: Record<string, string> = {
    EXPRESS: 'Ekspres (1-2 saat)', SAME_DAY: 'Aynı Gün', SCHEDULED: 'Planlı',
  }
  const content = `
    <div class="badge" style="background:#fef8ed;color:#c8860a;">📦 Yeni Sipariş</div>
    <h2>Siparişiniz alındı!</h2>
    <p>Merhaba <strong>${data.fullName}</strong>, siparişiniz başarıyla oluşturuldu ve kurye eşleştirmesi başlatıldı.</p>
    <div class="tracking">
      <p style="font-size:12px;color:#a89080;margin-bottom:8px;">TAKİP KODUNUZ</p>
      <div class="tracking-code">${data.trackingCode}</div>
    </div>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Alıcı</span><span class="info-value">${data.recipientName}</span></div>
      <div class="info-row"><span class="info-label">Teslimat Adresi</span><span class="info-value">${data.recipientAddress}</span></div>
      <div class="info-row"><span class="info-label">Teslimat Türü</span><span class="info-value">${typeLabel[data.deliveryType] || data.deliveryType}</span></div>
      <div class="info-row"><span class="info-label">Tutar</span><span class="info-value">${data.price.toFixed(2)} ₺</span></div>
    </div>
    <a href="${process.env.CLIENT_URL || 'https://prime-kurye.vercel.app'}/takip/${data.trackingCode}" class="btn">Siparişi Takip Et →</a>
  `
  await resend.emails.send({ from: FROM, to, subject: `Siparişiniz Alındı · ${data.trackingCode}`, html: baseTemplate(content) })
}

// Kurye atandı / yola çıktı
export async function sendCourierAssignedEmail(to: string, data: {
  fullName: string
  trackingCode: string
  courierName: string
}) {
  const content = `
    <div class="badge" style="background:#eff6ff;color:#2563eb;">🏍️ Kurye Atandı</div>
    <h2>Kuryeniz yola çıktı!</h2>
    <p>Merhaba <strong>${data.fullName}</strong>, siparişiniz için kurye atandı ve paketinizi almaya geliyor.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Kurye</span><span class="info-value">${data.courierName}</span></div>
      <div class="info-row"><span class="info-label">Durum</span><span class="info-value">Paketi almaya geliyor</span></div>
    </div>
    <a href="${process.env.CLIENT_URL || 'https://prime-kurye.vercel.app'}/takip/${data.trackingCode}" class="btn">Canlı Takip Et →</a>
  `
  await resend.emails.send({ from: FROM, to, subject: `Kuryeniz Yolda · ${data.trackingCode}`, html: baseTemplate(content) })
}

// Kurye paketi aldı / teslimat başladı
export async function sendPickedUpEmail(to: string, data: {
  fullName: string
  trackingCode: string
  recipientName: string
  recipientAddress: string
}) {
  const content = `
    <div class="badge" style="background:#ffedd5;color:#9a3412;">🚀 Teslimatta</div>
    <h2>Paketiniz yolda!</h2>
    <p>Merhaba <strong>${data.fullName}</strong>, kuryeniz paketinizi alıp teslim noktasına doğru yola çıktı.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Alıcı</span><span class="info-value">${data.recipientName}</span></div>
      <div class="info-row"><span class="info-label">Teslimat Adresi</span><span class="info-value">${data.recipientAddress}</span></div>
      <div class="info-row"><span class="info-label">Durum</span><span class="info-value">Teslimatta</span></div>
    </div>
    <a href="${process.env.CLIENT_URL || 'https://prime-kurye.vercel.app'}/takip/${data.trackingCode}" class="btn">Anlık Konumu Gör →</a>
  `
  await resend.emails.send({ from: FROM, to, subject: `Paketiniz Yolda · ${data.trackingCode}`, html: baseTemplate(content) })
}

// Teslim edildi
export async function sendDeliveredEmail(to: string, data: {
  fullName: string
  trackingCode: string
  recipientName: string
  price: number
}) {
  const content = `
    <div class="badge" style="background:#dcfce7;color:#166534;">✅ Teslim Edildi</div>
    <h2>Paketiniz teslim edildi!</h2>
    <p>Merhaba <strong>${data.fullName}</strong>, <strong>${data.recipientName}</strong> adına siparişiniz başarıyla teslim edildi.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Alıcı</span><span class="info-value">${data.recipientName}</span></div>
      <div class="info-row"><span class="info-label">Tutar</span><span class="info-value">${data.price.toFixed(2)} ₺</span></div>
      <div class="info-row"><span class="info-label">Durum</span><span class="info-value">✅ Teslim Edildi</span></div>
    </div>
    <p style="font-size:13px;color:#a89080;">Teslimi onaylayarak kuryenizin ödemesini almasına yardımcı olun.</p>
    <a href="${process.env.CLIENT_URL || 'https://prime-kurye.vercel.app'}/takip/${data.trackingCode}" class="btn">Teslimi Onayla →</a>
  `
  await resend.emails.send({ from: FROM, to, subject: `Teslim Edildi · ${data.trackingCode}`, html: baseTemplate(content) })
}

// İptal edildi
export async function sendCancelledEmail(to: string, data: {
  fullName: string
  trackingCode: string
}) {
  const content = `
    <div class="badge" style="background:#fee2e2;color:#991b1b;">❌ İptal Edildi</div>
    <h2>Siparişiniz iptal edildi</h2>
    <p>Merhaba <strong>${data.fullName}</strong>, <strong>${data.trackingCode}</strong> numaralı siparişiniz iptal edildi.</p>
    <p>Herhangi bir ödeme yapıldıysa 3-5 iş günü içinde iade edilecektir.</p>
    <p>Yeni bir sipariş vermek için aşağıdaki bağlantıyı kullanabilirsiniz.</p>
    <a href="${process.env.CLIENT_URL || 'https://prime-kurye.vercel.app'}/siparis" class="btn">Yeni Sipariş Ver →</a>
  `
  await resend.emails.send({ from: FROM, to, subject: `Sipariş İptal · ${data.trackingCode}`, html: baseTemplate(content) })
}
