"use client"

interface StepCardProps {
  number: string
  title: string
  description: string
  icon?: React.ReactNode
  className?: string
}

export function StepCard({ number, title, description, icon, className = "" }: StepCardProps) {
  return (
    <div className={`bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {number}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {icon && (
              <div className="w-6 h-6 mr-2 text-primary">
                {icon}
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}