"use client"

interface StatCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function StatCard({ icon, title, description, className = "" }: StatCardProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-200 text-sm leading-relaxed">{description}</p>
    </div>
  )
}