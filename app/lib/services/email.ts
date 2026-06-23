/**
 * SendGrid Email Service
 * Service for sending transactional emails using SendGrid API
 */

import { serverConfig, clientConfig } from '../../lib/config'

export interface EmailTemplate {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  templateId?: string
  dynamicTemplateData?: Record<string, any>
  attachments?: Array<{
    content: string
    filename: string
    type?: string
    disposition?: string
  }>
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  serviceType: 'property' | 'car' | 'yacht' | 'general'
  propertyId?: string
  checkIn?: string
  checkOut?: string
  guests?: number
}

export interface BookingFormData {
  name: string
  email: string
  phone: string
  serviceType: 'property' | 'car' | 'yacht'
  serviceId: string
  serviceName: string
  startDate: string
  endDate?: string
  guests?: number
  specialRequests?: string
  totalAmount?: number
}

class EmailService {
  private apiKey: string
  private fromEmail: string
  private fromName: string

  constructor() {
    this.apiKey = serverConfig.sendGrid.apiKey
    this.fromEmail = serverConfig.sendGrid.fromEmail
    this.fromName = serverConfig.sendGrid.fromName
  }

  private async sendEmail(emailData: EmailTemplate): Promise<boolean> {
    if (!this.apiKey) {
            return false
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: Array.isArray(emailData.to) 
                ? emailData.to.map(email => ({ email }))
                : [{ email: emailData.to }],
              dynamic_template_data: emailData.dynamicTemplateData || {},
            },
          ],
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          subject: emailData.subject,
          content: emailData.html ? [
            {
              type: 'text/html',
              value: emailData.html,
            },
          ] : undefined,
          template_id: emailData.templateId,
          attachments: emailData.attachments,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
                return false
      }

      return true
    } catch (error) {
            return false
    }
  }

  /**
   * Send contact form inquiry
   */
  async sendContactInquiry(data: ContactFormData): Promise<boolean> {
    const recipientEmail = this.getRecipientEmail(data.serviceType)
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Contact Inquiry</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${clientConfig.company.name}</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Contact Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
            <p><strong>Service Type:</strong> ${data.serviceType.charAt(0).toUpperCase() + data.serviceType.slice(1)}</p>
            ${data.propertyId ? `<p><strong>Property/Service ID:</strong> ${data.propertyId}</p>` : ''}
          </div>

          ${data.checkIn || data.checkOut || data.guests ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #667eea;">Booking Details</h3>
              ${data.checkIn ? `<p><strong>Check-in:</strong> ${data.checkIn}</p>` : ''}
              ${data.checkOut ? `<p><strong>Check-out:</strong> ${data.checkOut}</p>` : ''}
              ${data.guests ? `<p><strong>Guests:</strong> ${data.guests}</p>` : ''}
            </div>
          ` : ''}

          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #667eea;">Subject</h3>
            <p style="margin-bottom: 20px;">${data.subject}</p>
            
            <h3 style="color: #667eea;">Message</h3>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">This inquiry was sent from the ${clientConfig.company.name} website</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: recipientEmail,
      subject: `New ${data.serviceType} inquiry: ${data.subject}`,
      html,
    })
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(data: BookingFormData): Promise<boolean> {
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Booking Confirmation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for choosing ${clientConfig.company.name}!</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Booking Details</h2>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Service Type:</strong> ${data.serviceType.charAt(0).toUpperCase() + data.serviceType.slice(1)}</p>
            <p><strong>Start Date:</strong> ${data.startDate}</p>
            ${data.endDate ? `<p><strong>End Date:</strong> ${data.endDate}</p>` : ''}
            ${data.guests ? `<p><strong>Number of Guests:</strong> ${data.guests}</p>` : ''}
            ${data.totalAmount ? `<p><strong>Total Amount:</strong> $${data.totalAmount}</p>` : ''}
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
          </div>

          ${data.specialRequests ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">Special Requests</h3>
              <p style="white-space: pre-wrap;">${data.specialRequests}</p>
            </div>
          ` : ''}

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h3 style="color: #1976d2; margin-top: 0;">What's Next?</h3>
            <p>Our team will review your booking and contact you within 24 hours to confirm availability and finalize the details.</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Questions? Contact us at ${clientConfig.company.email} or call ${clientConfig.company.phone}</p>
        </div>
      </div>
    `

    // Send confirmation to customer
    const customerEmailSent = await this.sendEmail({
      to: data.email,
      subject: `Booking Confirmation - ${data.serviceName}`,
      html: confirmationHtml,
    })

    // Send notification to team
    const teamEmailSent = await this.sendEmail({
      to: this.getRecipientEmail(data.serviceType),
      subject: `New Booking - ${data.serviceName}`,
      html: confirmationHtml,
    })

    return customerEmailSent && teamEmailSent
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <img src="${clientConfig.brand.logo}" alt="${clientConfig.company.name}" style="max-width: 200px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to ${clientConfig.company.name}!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hello ${name}!</h2>
          <p>Thank you for your interest in ${clientConfig.company.name}. We're excited to help you discover amazing deals on luxury properties, cars, and yachts.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">What We Offer</h3>
            <ul style="line-height: 1.6;">
              <li>🏖️ Luxury vacation properties</li>
              <li>🚗 Premium car rentals</li>
              <li>⛵ Exclusive yacht charters</li>
              <li>🎫 Unbeatable deals and discounts</li>
            </ul>
          </div>
          
          <p>Our team is here to help you plan the perfect getaway. Don't hesitate to reach out if you have any questions!</p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Follow us for the latest deals and travel inspiration</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: `Welcome to ${clientConfig.company.name} - Your Gateway to Luxury Travel`,
      html,
    })
  }

  private getRecipientEmail(serviceType: string): string {
    switch (serviceType) {
      case 'property':
        return serverConfig.contactEmails.properties
      case 'car':
        return serverConfig.contactEmails.cars
      case 'yacht':
        return serverConfig.contactEmails.yachts
      default:
        return serverConfig.contactEmails.general
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService