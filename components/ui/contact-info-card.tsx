import { LucideIcon } from "lucide-react"

interface ContactInfoCardProps {
  icon: LucideIcon
  title: string
  description: string[]
  contactInfo: string
}

export function ContactInfoCard({ icon: Icon, title, description, contactInfo }: ContactInfoCardProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <div className="space-y-1 mb-4">
        {description.map((line, index) => (
          <p key={index} className="text-gray-600 text-sm">
            {line}
          </p>
        ))}
      </div>
      <p className="text-gray-900 font-medium">{contactInfo}</p>
    </div>
  )
}