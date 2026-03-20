'use client'

import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import OrderCalculator from '@/components/layout/OrderCalculator'

export default function CalculatePage() {
  return (
    <>
      <Navbar />

      <main className="calculate-page">
        <section className="calculate-shell">
          <div className="calculate-heading">
            <span>Fiyat Hesaplama</span>
            <h1>Gönderi hesabınızı sade ve net biçimde oluşturun.</h1>
            <p>
              İstanbul içi alım ve teslimat ilçelerini seçin, yaklaşık tutarı görün ve doğrudan sipariş adımına geçin.
            </p>
          </div>

          <OrderCalculator />
        </section>

        <style>{`
          .calculate-page {
            min-height: 100vh;
            background: linear-gradient(180deg, #fcfaf5 0%, #f6f1e7 100%);
          }

          .calculate-shell {
            max-width: 1180px;
            margin: 0 auto;
            padding: 72px 20px 40px;
          }

          .calculate-heading {
            max-width: 760px;
            margin: 0 auto 28px;
            text-align: center;
          }

          .calculate-heading span {
            display: inline-block;
            margin-bottom: 14px;
            padding: 7px 14px;
            border-radius: 999px;
            border: 1px solid rgba(17, 17, 17, 0.12);
            background: rgba(255, 255, 255, 0.55);
            color: #111111;
            font-size: 0.76rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .calculate-heading h1 {
            margin: 0 0 14px;
            color: #111111;
            font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
            font-size: clamp(2.3rem, 4vw, 4rem);
            line-height: 1;
            letter-spacing: -0.03em;
          }

          .calculate-heading p {
            margin: 0 auto;
            max-width: 58ch;
            color: rgba(17, 17, 17, 0.7);
            font-size: 1rem;
            line-height: 1.8;
          }

          @media (max-width: 640px) {
            .calculate-shell {
              padding: 56px 16px 28px;
            }

            .calculate-heading {
              margin-bottom: 22px;
            }

            .calculate-heading p {
              font-size: 0.95rem;
            }
          }
        `}</style>
      </main>

      <Footer />
    </>
  )
}
