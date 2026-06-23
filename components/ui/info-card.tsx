"use client"

interface InfoCardProps {
  icon: React.ReactNode
  title: string
  description: string
  layout?: "horizontal" | "vertical"
  background?: "white" | "transparent"
  className?: string
}

export function InfoCard({ 
  icon, 
  title, 
  description, 
  layout = "vertical",
  background = "white",
  className = "" 
}: InfoCardProps) {
  const baseClasses = background === "white" 
    ? "bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-100" 
    : "rounded-lg"

  if (layout === "horizontal") {
    return (
      <div className={`${baseClasses} p-6 ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${baseClasses} p-6 text-center ${className}`}>
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}