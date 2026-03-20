'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Zap, Clock, ShieldCheck } from 'lucide-react';

const OrderCalculator = () => {
  const [formData, setFormData] = useState({
    serviceType: 'EXPRESS',
    isFragile: false,
    packageValue: 0
  });

  const [estimate, setEstimate] = useState({ price: 298.50, distance: 15, time: 45 });

  // Mobil uyumlu stil objeleri
  const styles = {
    container: {
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '15px',
    },
    // Ana Grid: Mobilde flex-column, Masaüstünde row
    wrapper: {
      display: 'flex',
      flexDirection: 'column' as any, // Mobilde üst üste
      gap: '20px',
      background: '#fff',
      borderRadius: '24px',
      padding: '20px',
      boxShadow: '0 15px 35px rgba(28,8,0,0.08)',
      // Medya sorgusunu JS içinde simüle ediyoruz (Veya CSS dosyasına taşıyabilirsin)
    },
    inputSection: {
      display: 'flex',
      flexDirection: 'column' as any,
      gap: '20px',
    },
    // Adres kutuları mobilde alt alta
    addressGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr', // Varsayılan mobil
      gap: '15px',
    },
    // Siyah Özet Paneli
    summaryPanel: {
      background: '#1c0800',
      borderRadius: '20px',
      padding: '25px',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column' as any,
      gap: '20px',
    }
  };

  return (
    <div style={styles.container}>
      {/* DİKKAT: Masaüstü için @media sorgusu kullanamadığımız için 
          stil içine inline responsive mantığı ekliyoruz 
      */}
      <div className="calculator-wrapper">
        <style dangerouslySetInnerHTML={{ __html: `
          .calculator-wrapper {
            display: flex;
            flex-direction: column;
            gap: 20px;
            background: #fff;
            border-radius: 24px;
            padding: 20px;
            box-shadow: 0 15px 35px rgba(28,8,0,0.08);
          }
          @min-width: 992px) {
            .calculator-wrapper {
              flex-direction: row !important;
              padding: 40px !important;
            }
            .address-grid {
              grid-template-columns: 1fr 1fr !important;
            }
            .left-side { flex: 1.5; }
            .right-side { flex: 1; }
          }
          .service-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 10px;
          }
          @media (max-width: 480px) {
            .service-grid {
              grid-template-columns: 1fr; /* Çok küçük ekranlarda servisler alt alta */
            }
          }
        `}} />

        {/* Sol Kolon */}
        <div className="left-side" style={styles.inputSection}>
          <div className="address-grid" style={styles.addressGrid}>
            <InputGroup label="Alım Adresi" placeholder="Beşiktaş..." />
            <InputGroup label="Teslimat Adresi" placeholder="Kadıköy..." />
          </div>

          <div>
            <label style={labelStyle}>Hizmet Tipi</label>
            <div className="service-grid">
              <ServiceCard 
                active={formData.serviceType === 'EXPRESS'} 
                onClick={() => setFormData({...formData, serviceType: 'EXPRESS'})}
                title="Ekspres" icon={<Zap size={20} />} 
              />
              <ServiceCard 
                active={formData.serviceType === 'SAME_DAY'} 
                onClick={() => setFormData({...formData, serviceType: 'SAME_DAY'})}
                title="Aynı Gün" icon={<Clock size={20} />} 
              />
              <ServiceCard 
                active={formData.serviceType === 'SCHEDULED'} 
                onClick={() => setFormData({...formData, serviceType: 'SCHEDULED'})}
                title="Planlı" icon={<ShieldCheck size={20} />} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', background: '#fef8ed', borderRadius: '12px' }}>
             <input type="checkbox" style={{ width: 18, height: 18, accentColor: '#c8860a' }} />
             <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1c0800' }}>Hassas / Kırılabilir Paket (+25₺)</span>
          </div>
        </div>

        {/* Sağ Kolon (Siyah Panel) */}
        <div className="right-side" style={styles.summaryPanel}>
          <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Tahmini Özet</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SummaryRow label="Mesafe" value="15 KM" />
            <SummaryRow label="Süre" value="~45 Dakika" />
            <SummaryRow label="Hizmet" value="298.50 ₺" />
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Toplam</span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fdbd4a' }}>298.50 ₺</span>
            </div>
            <button style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#c8860a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              HEMEN KURYE ÇAĞIR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ... InputGroup, ServiceCard ve SummaryRow bileşenlerini buraya ekle (Öncekiyle aynı)

// Yardımcı Alt Bileşenler
const InputGroup = ({ label, icon, placeholder }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>{icon}</span>
      <input 
        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 10, border: '1px solid #ddd', fontSize: '0.9rem' }} 
        placeholder={placeholder} 
      />
    </div>
  </div>
);

const ServiceCard = ({ title, icon, active, onClick }: any) => (
  <div 
    onClick={onClick}
    style={{ 
      padding: '15px', borderRadius: 12, border: `2px solid ${active ? '#c8860a' : '#eee'}`,
      background: active ? '#fff' : '#fafafa', cursor: 'pointer', textAlign: 'center', transition: '0.2s'
    }}>
    <div style={{ color: active ? '#c8860a' : '#999', marginBottom: 5 }}>{icon}</div>
    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1c0800' }}>{title}</div>
  </div>
);

const SummaryRow = ({ label, value }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
    <span style={{ fontWeight: 600 }}>{value}</span>
  </div>
);

const labelStyle = { fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#1c0800', textTransform: 'uppercase' as any };

export default OrderCalculator;