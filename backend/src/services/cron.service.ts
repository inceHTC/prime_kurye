import { checkOrderTimeouts } from '../services/courierMatching.service'
import { autoConfirmDeliveries } from '../controllers/order.controller'

// ================================
// CRON JOB — Her 5 dakikada bir çalışır
// ================================
export function startCronJobs(): void {
  console.log('⏰ Cron jobs başlatıldı')

  // Her 5 dakikada zaman aşımı kontrolü
  setInterval(async () => {
    try {
      await checkOrderTimeouts()
    } catch (error) {
      console.error('Cron: checkOrderTimeouts hatası:', error)
    }
  }, 5 * 60 * 1000)

  // Her 10 dakikada otomatik onay kontrolü
  setInterval(async () => {
    try {
      await autoConfirmDeliveries()
    } catch (error) {
      console.error('Cron: autoConfirmDeliveries hatası:', error)
    }
  }, 10 * 60 * 1000)

  // İlk çalıştırma — başlangıçta bir kez
  setTimeout(async () => {
    await checkOrderTimeouts()
    await autoConfirmDeliveries()
  }, 5000)
}