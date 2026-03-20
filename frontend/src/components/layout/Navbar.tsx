'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navItems = [
  { label: 'Hizmetler', href: '#hizmetler' },
  { label: 'Nasıl Çalışır', href: '#nasil-calisir' },
  { label: 'Fiyatlar', href: '#fiyatlar' },
  { label: 'İşletmeler için', href: '#isletmeler' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // ✅ hydration fix
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block bg-[#1c0800]">
        <div className="max-w-[1200px] mx-auto px-4 h-9 flex items-center justify-end gap-6">
          <Link href="/takip" className="text-white/60 hover:text-white/90 text-xs transition-colors">
            Gönderi Takip
          </Link>
          <Link href="/kurye-ol" className="text-white/60 hover:text-white/90 text-xs transition-colors">
            Kurye Ol
          </Link>
          <Link href="/giris" className="text-white/60 hover:text-white/90 text-xs transition-colors">
            Giriş Yap
          </Link>
        </div>
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-200 ${
          scrolled ? 'shadow-md' : 'border-b border-black/[0.08]'
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14 md:h-16 pr-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pl-4">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center bg-[#c8860a] shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M13 3L6 14h6l-1 7 7-11h-6l1-7z" fill="white" />
              </svg>
            </div>

            <div>
              <div className="font-condensed font-bold text-[#1c0800] text-[1.15rem] leading-none">
                PRIME<span className="text-[#c8860a]">KURYE</span>
              </div>
              <div className="hidden md:block text-[#a89080] text-[0.6rem] tracking-widest mt-0.5">
                Hızlı · Güvenilir · Profesyonel
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 px-4">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-[#4a3020] hover:bg-[#f5f3ef] hover:text-[#1c0800] transition whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <Link
              href="/siparis"
              className="btn-primary text-sm px-5 py-2.5"
            >
              Kurye Çağır
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-[#1c0800]"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden top-14">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          <div className="absolute top-0 left-0 right-0 bg-white shadow-xl border-b">
            <nav className="flex flex-col p-3 gap-1">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-semibold text-[#4a3020] hover:bg-[#f5f3ef]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="px-4 pb-6 pt-2 flex flex-col gap-3 border-t">
              <Link
                href="/siparis"
                onClick={() => setOpen(false)}
                className="btn-primary w-full text-center py-3"
              >
                Kurye Çağır
              </Link>

              <Link
                href="/giris"
                onClick={() => setOpen(false)}
                className="text-center py-3 text-sm font-semibold text-[#a89080] hover:text-[#1c0800]"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}