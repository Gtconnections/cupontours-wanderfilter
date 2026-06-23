import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "./button"

interface ErrorMessageProps {
  title?: string
  message: string
  backHref?: string
  backLabel?: string
  className?: string
}

export function ErrorMessage({ 
  title = "Error",
  message, 
  backHref,
  backLabel = "Go Back",
  className = "" 
}: ErrorMessageProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{title}</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        {backHref && (
          <Link href={backHref}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}