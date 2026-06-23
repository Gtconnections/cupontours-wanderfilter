"use client"

interface PricingCardProps {
  title: string
  price: string
  duration: string
  description: string
  highlight?: boolean
  className?: string
}

export function PricingCard({ 
  title, 
  price, 
  duration, 
  description, 
  highlight = false,
  className = "" 
}: PricingCardProps) {
  return (
    <div className={`text-center p-6 rounded-lg ${highlight ? 'bg-primary text-white' : 'bg-white border border-gray-200'} ${className}`}>
      <h3 className={`text-lg font-semibold mb-2 ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <div className="mb-4">
        <span className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-primary'}`}>
          {price}
        </span>
        <span className={`text-sm ${highlight ? 'text-gray-100' : 'text-gray-600'}`}>
          *
        </span>
      </div>
      <p className={`text-sm leading-relaxed ${highlight ? 'text-gray-100' : 'text-gray-600'}`}>
        {description}
      </p>
      <p className={`text-xs mt-2 ${highlight ? 'text-gray-200' : 'text-gray-500'}`}>
        {duration}
      </p>
    </div>
  )
}