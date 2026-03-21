"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const courierMatching_service_1 = require("../services/courierMatching.service");
const order_controller_1 = require("../controllers/order.controller");
// ================================
// CRON JOB — Her 5 dakikada bir çalışır
// ================================
function startCronJobs() {
    console.log('⏰ Cron jobs başlatıldı');
    // Her 5 dakikada zaman aşımı kontrolü
    setInterval(async () => {
        try {
            await (0, courierMatching_service_1.checkOrderTimeouts)();
        }
        catch (error) {
            console.error('Cron: checkOrderTimeouts hatası:', error);
        }
    }, 5 * 60 * 1000);
    // Her 10 dakikada otomatik onay kontrolü
    setInterval(async () => {
        try {
            await (0, order_controller_1.autoConfirmDeliveries)();
        }
        catch (error) {
            console.error('Cron: autoConfirmDeliveries hatası:', error);
        }
    }, 10 * 60 * 1000);
    // İlk çalıştırma — başlangıçta bir kez
    setTimeout(async () => {
        await (0, courierMatching_service_1.checkOrderTimeouts)();
        await (0, order_controller_1.autoConfirmDeliveries)();
    }, 5000);
}
