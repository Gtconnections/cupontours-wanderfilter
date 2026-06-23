"use client"

import { useEffect, useState } from "react"

interface CopyrightProps {
  companyName: string
  className?: string
}

/**
 * Copyright Component - Handles year display safely for hydration
 */
export function Copyright({ companyName, className }: CopyrightProps) {
  const [year, setYear] = useState(2025) // Default to current year
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setYear(new Date().getFullYear())
  }, [])

  // For SSR, show default content
  if (!mounted) {
    return (
      <p className={className}>
        © 2025 <b>GT Connections LLC</b>. All rights reserved.
      </p>
    )
  }

  return (
    <p className={className}>
      © {year} <b>GT Connections LLC</b>. All rights reserved.
    </p>
  )
}

export default Copyright