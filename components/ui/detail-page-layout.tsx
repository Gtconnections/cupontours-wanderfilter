import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "./button"

interface DetailPageLayoutProps {
  backHref: string
  backLabel: string
  children: React.ReactNode
  className?: string
  showGradientBackground?: boolean
}

export function DetailPageLayout({ 
  backHref, 
  backLabel, 
  children, 
  className = "",
  showGradientBackground = false 
}: DetailPageLayoutProps) {
  const containerClass = showGradientBackground 
    ? "min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
    : "container mx-auto px-4 py-8"

  const headerClass = showGradientBackground
    ? "bg-white shadow-sm border-b"
    : ""

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <div className="container mx-auto px-4 py-4">
          <Link 
            href={backHref} 
            className={showGradientBackground 
              ? "inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              : ""
            }
          >
            {showGradientBackground ? (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </>
            ) : (
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backLabel}
              </Button>
            )}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className={showGradientBackground ? "container mx-auto px-4 py-8" : ""}>
        <div className={className}>
          {children}
        </div>
      </div>
    </div>
  )
}