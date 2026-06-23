"use client"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function ServiceCard({ icon, title, description, className = "" }: ServiceCardProps) {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}