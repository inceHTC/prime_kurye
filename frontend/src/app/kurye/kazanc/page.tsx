'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function KuryeKazancRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/kurye')
  }, [router])
  return null
}
