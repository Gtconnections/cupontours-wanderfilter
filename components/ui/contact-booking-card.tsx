"use client"

import { useEffect, useRef } from "react"
import { Star, Calendar, Phone, Mail } from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

interface ContactBookingCardProps {
  price: string
  priceLabel?: string
  rating?: number
  reviewCount?: number
  additionalFees?: Array<{
    label: string
    amount: string
  }>
  onBooking: () => void
  onContact: () => void
  contactMethods?: {
    showCall?: boolean
    showEmail?: boolean
    phoneNumber?: string
  }
  itemType: "property" | "car" | "yacht"
  className?: string
}

export function ContactBookingCard({
  price,
  priceLabel = "/ night",
  rating = 5.0,
  reviewCount,
  additionalFees = [],
  onBooking,
  onContact,
  contactMethods = {
    showCall: true,
    showEmail: true,
    phoneNumber: "+15551234567"
  },
  itemType,
  className = "",
  hostawayWidgetProps
}: ContactBookingCardProps & { hostawayWidgetProps?: any }) {

  // Initialize Hostaway widget exactly as shown in official documentation
  useEffect(() => {
    if (!hostawayWidgetProps) return

    // Load script and initialize - following official docs exactly
    const script = document.createElement('script')
    script.src = 'https://d2q3n06xhbi0am.cloudfront.net/calendar.js'
    script.onload = () => {
      // Call the function exactly as shown in documentation
      if ((window as any).hostawayCalendarWidget) {
        ;(window as any).hostawayCalendarWidget({
          baseUrl: hostawayWidgetProps.baseUrl || 'https://www.cupontours.com/',
          listingId: hostawayWidgetProps.listingId,
          numberOfMonths: hostawayWidgetProps.numberOfMonths || 2,
          openInNewTab: hostawayWidgetProps.openInNewTab !== false,
          font: hostawayWidgetProps.font || 'Open Sans',
          rounded: hostawayWidgetProps.rounded !== false,
          button: {
            action: hostawayWidgetProps.button?.action || 'checkout',
            text: hostawayWidgetProps.button?.text || 'Book now'
          },
          clearButtonText: hostawayWidgetProps.clearButtonText || 'Clear dates',
          color: {
            mainColor: hostawayWidgetProps.color?.mainColor || '#0762c8',
            frameColor: hostawayWidgetProps.color?.frameColor || '#FED141',
            textColor: hostawayWidgetProps.color?.textColor || '#071D49'
          }
        })
      }
    }

    // Only add script if it doesn't exist
    const existing = document.querySelector('script[src="https://d2q3n06xhbi0am.cloudfront.net/calendar.js"]')
    if (!existing) {
      document.head.appendChild(script)
    } else {
      // Script exists, try to initialize
      setTimeout(() => {
        if ((window as any).hostawayCalendarWidget) {
          ;(window as any).hostawayCalendarWidget({
            baseUrl: hostawayWidgetProps.baseUrl || 'https://www.cupontours.com/',
            listingId: hostawayWidgetProps.listingId,
            numberOfMonths: hostawayWidgetProps.numberOfMonths || 2,
            openInNewTab: hostawayWidgetProps.openInNewTab !== false,
            font: hostawayWidgetProps.font || 'Open Sans',
            rounded: hostawayWidgetProps.rounded !== false,
            button: {
              action: hostawayWidgetProps.button?.action || 'checkout',
              text: hostawayWidgetProps.button?.text || 'Book now'
            },
            clearButtonText: hostawayWidgetProps.clearButtonText || 'Clear dates',
            color: {
              mainColor: hostawayWidgetProps.color?.mainColor || '#0762c8',
              frameColor: hostawayWidgetProps.color?.frameColor || '#FED141',
              textColor: hostawayWidgetProps.color?.textColor || '#071D49'
            }
          })
        }
      }, 500)
    }
  }, [hostawayWidgetProps])
  const getBookingButtonText = () => {
    switch (itemType) {
      case "car":
        return "Book Rental"
      case "yacht":
        return "Book Charter"
      case "property":
      default:
        return "Check Availability"
    }
  }

  const getContactButtonText = () => {
    switch (itemType) {
      case "car":
        return "Email Quote"
      case "yacht":
        return "Request Quote"
      case "property":
      default:
        return "Contact Host"
    }
  }

  const getContactText = () => {
    switch (itemType) {
      case "car":
        return "Contact us for rental availability"
      case "yacht":
        return "Contact us for charter availability"
      case "property":
      default:
        return "Contact us for booking and availability"
    }
  }

  return (
    <Card className={`sticky top-6 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-price">
            {price}
            <span className="text-label"> {priceLabel}</span>
          </span>
          {rating && (
            <div className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '2px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-rating">{rating}</span>
              {reviewCount && (
                <span className="text-sm text-gray-500">({reviewCount})</span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Additional Fees */}
        {additionalFees.length > 0 && (
          <div className="text-sm text-gray-600 space-y-1">
            {additionalFees.map((fee, index) => (
              <div key={index} className="text-fee">
                <span>{fee.label}</span>
                <span>{fee.amount}</span>
              </div>
            ))}
          </div>
        )}

        {/* Hostaway Calendar Widget (only for property) */}
        {hostawayWidgetProps ? (
          <div className="mb-4 w-full">
            
            {/* Div exactly as required by official Hostaway documentation */}
            <div
              id="hostaway-calendar-widget"
              className=""
              style={{ minWidth: 0 }}
            />
          </div>
        ) : (
          <div className="border-t pt-4">
            <div className="text-center text-gray-600 text-sm mb-4">
              {getContactText()}
            </div>
            <div className="space-y-2">
              {/* Main Booking Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={onBooking}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {getBookingButtonText()}
              </Button>
              {/* Contact Methods */}
              <div className={`flex ${contactMethods.showCall && contactMethods.showEmail ? 'space-x-2' : ''}`}>
                {contactMethods.showCall && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <a href={`tel:${contactMethods.phoneNumber}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Us
                    </a>
                  </Button>
                )}
                {contactMethods.showEmail && (
                  <Button
                    variant="outline"
                    className={`${contactMethods.showCall ? 'flex-1' : 'w-full'}`}
                    onClick={onContact}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {getContactButtonText()}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}