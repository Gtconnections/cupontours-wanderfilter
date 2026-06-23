import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "./button"
import { logger } from "@/lib/utils/logger"

interface FavoriteButtonProps {
  itemId: string | number
  itemName?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function FavoriteButton({ 
  itemId, 
  itemName, 
  variant = "outline", 
  size = "sm", 
  className = "" 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // Here you could add logic to save/remove from favorites
    // localStorage, API call, etc.
    logger.log(`${isFavorite ? 'Removed from' : 'Added to'} favorites:`, itemName || `Item ${itemId}`)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      className={`${isFavorite ? "text-red-500 border-red-500" : ""} ${className}`}
    >
      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "Saved" : "Save"}
    </Button>
  )
}