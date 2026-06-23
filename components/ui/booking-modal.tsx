"use client"

import { useState } from "react"
import { X, Calendar, Mail, Phone, User, MessageSquare, Car, Ship, Home, Star, DollarSign, Users } from "lucide-react"
// ...existing code...

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  itemTitle: string
  itemType: "car" | "yacht" | "property"
  itemPrice?: string
  itemDetails?: {
    guests?: number
    length?: string
    staterooms?: number
    bathrooms?: number
    crew?: boolean
    captain?: boolean
    year?: number
    make?: string
    model?: string
    seats?: number
    transmission?: string
    fuel_type?: string
  }
}

  // ...existing code...
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

// ...existing code...

export function BookingModal({ isOpen, onClose, itemTitle, itemType, itemPrice, itemDetails }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    startDate: "",
    endDate: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Frontend validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.startDate) {
      alert("Please fill in all required fields.")
      setIsSubmitting(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.")
      setIsSubmitting(false)
      return
    }

    try {
      // Determine the appropriate endpoint
      const endpoint = itemType === "yacht" ? "/api/booking/yacht" : 
                     itemType === "car" ? "/api/booking/car" : 
                     "/api/contact"

      // Prepare the request data based on item type
      const requestData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || "",
        startDate: formData.startDate,
        endDate: formData.endDate || "",
        message: formData.message?.trim() || "",
        
        // Yacht-specific fields
        ...(itemType === "yacht" && {
          yachtTitle: itemTitle,
          yachtPrice: itemPrice,
          yachtDetails: itemDetails
        }),
        
        // Car-specific fields
        ...(itemType === "car" && {
          carTitle: itemTitle,
          carPrice: itemPrice,
          carDetails: itemDetails
        }),
        
        // Fallback for properties or general contact
        ...(itemType === "property" && {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: `Property Booking Inquiry - ${itemTitle}`,
          serviceType: "property"
        })
      }

      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setSubmitted(true)
        setTimeout(() => {
          onClose()
          setSubmitted(false)
          setFormData({
            name: "",
            email: "",
            phone: "",
            startDate: "",
            endDate: "",
            message: ""
          })
        }, 3000)
      } else {
                alert(result.error || result.details || "Error sending booking inquiry. Please try again.")
      }
    } catch (error) {
            alert("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
            <p className="text-gray-600">
              Thank you for your interest. We'll get back to you within 24 hours.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getItemIcon = () => {
    switch (itemType) {
      case "car":
        return <Car className="w-5 h-5 text-blue-600" />
      case "yacht":
        return <Ship className="w-5 h-5 text-blue-600" />
      case "property":
        return <Home className="w-5 h-5 text-blue-600" />
      default:
        return <Home className="w-5 h-5 text-blue-600" />
    }
  }

  const getItemTypeLabel = () => {
    switch (itemType) {
      case "car":
        return "Luxury Car Rental"
      case "yacht":
        return "Yacht Charter"
      case "property":
        return "Property Booking"
      default:
        return "Booking"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-0">
          {/* Enhanced Header with Item Info */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getItemIcon()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {itemType === "car" ? "Rent This Car" : itemType === "yacht" ? "Charter This Yacht" : "Book This Property"}
                    </h2>
                    <p className="text-sm text-blue-600 font-medium">{getItemTypeLabel()}</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{itemTitle}</h3>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">Premium Experience</span>
                      </div>
                    </div>
                    {itemPrice && (
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">{itemPrice}</span>
                        </div>
                        <p className="text-xs text-gray-500">Starting price</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Item-specific details */}
                  {itemDetails && itemType === "yacht" && (
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                      {itemDetails.length && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Ship className="w-3 h-3" />
                          <span>{itemDetails.length} yacht</span>
                        </div>
                      )}
                      {itemDetails.guests && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-3 h-3" />
                          <span>Up to {itemDetails.guests} guests</span>
                        </div>
                      )}
                      {itemDetails.staterooms && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Home className="w-3 h-3" />
                          <span>{itemDetails.staterooms} staterooms</span>
                        </div>
                      )}
                      {itemDetails.bathrooms && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Home className="w-3 h-3" />
                          <span>{itemDetails.bathrooms} bathrooms</span>
                        </div>
                      )}
                    </div>
                  )}

                  {itemDetails && itemType === "car" && (
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Car className="w-3 h-3" />
                        <span>Luxury vehicle</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>4-5 passengers</span>
                      </div>
                    </div>
                  )}

                  {itemDetails && itemType === "property" && (
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                      {itemDetails.guests && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-3 h-3" />
                          <span>Up to {itemDetails.guests} guests</span>
                        </div>
                      )}
                      {itemDetails.staterooms && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Home className="w-3 h-3" />
                          <span>{itemDetails.staterooms} bedrooms</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onClose} className="ml-4">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you with availability and pricing details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  Full Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                    <Mail className="w-3 h-3 text-green-600" />
                  </div>
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center">
                    <Phone className="w-3 h-3 text-purple-600" />
                  </div>
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-orange-600" />
                  </div>
                  {itemType === "car" ? "Pickup Date" : itemType === "yacht" ? "Charter Date" : "Check-in Date"} *
                </label>
                <Input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="w-5 h-5 bg-teal-100 rounded flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-teal-600" />
                  </div>
                  {itemType === "car" ? "Return Date" : itemType === "yacht" ? "End Date" : "Check-out Date"}
                </label>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-indigo-600" />
                </div>
                Special Requests & Additional Information
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={`Tell us more about your ${itemType === "car" ? "rental" : itemType === "yacht" ? "charter" : "booking"} needs, group size, special occasions, or any specific requirements...`}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-3 h-3 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">What happens next?</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• We'll review your request within 2 hours</li>
                    <li>• You'll receive a detailed quote with availability</li>
                    <li>• Our team will contact you to finalize details</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Sending Request..." : "Send Inquiry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}