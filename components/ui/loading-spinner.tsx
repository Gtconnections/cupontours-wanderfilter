interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ 
  message = "Loading...", 
  size = "md",
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-32 w-32", 
    lg: "h-48 w-48"
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizeClasses[size]}`}></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  )
}