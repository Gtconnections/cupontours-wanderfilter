"use client"

interface BenefitCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function BenefitCard({ icon, title, description, className = "" }: BenefitCardProps) {
  return (
    <div className={`text-center p-6 ${className}`}>
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}