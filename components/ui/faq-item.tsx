"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export interface FAQData {
  id: string
  question: string
  answer: string
  category?: string
}

interface FAQItemProps {
  faq: FAQData
  isOpen?: boolean
  onToggle?: () => void
}

export function FAQItem({ faq, isOpen = false, onToggle }: FAQItemProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const isExpanded = onToggle ? isOpen : internalOpen
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen))

  return (
    <div className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden relative z-30">
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white/25 relative z-40"
        aria-expanded={isExpanded}
      >
        <span className="text-white font-medium pr-4">{faq.question}</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white flex-shrink-0" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-4 pt-0 relative z-40">
          <div className="text-gray-100 leading-relaxed">
            {faq.answer}
          </div>
        </div>
      )}
    </div>
  )
}