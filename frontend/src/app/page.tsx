import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import {
  HowItWorksSection,
  ForBusinessesSection,
  FeaturesSection,
  PricingSection,
  TestimonialsSection,
  CtaSection,
} from '@/components/sections/AllSections'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <ForBusinessesSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </main>
  )
}