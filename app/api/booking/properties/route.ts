import { NextResponse } from 'next/server';
import { sendMail } from '@/app/lib/services/mailer';
import { renderInquiryEmail } from '@/app/lib/services/email-template';

// Consulta de una propiedad (reusa el mismo recurso de correo que autos/yates).
import { checkRateLimit, rateLimitedResponse } from '@/app/lib/rate-limit';

export async function POST(request: Request) {
  // Frena el abuso del formulario (spam / email bombing vía Gmail SMTP).
  const rl = checkRateLimit(request);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  try {
    const body = await request.json();
    const { propertyId, propertyName, checkIn, checkOut, client } = body;

    if (!propertyId || !client || !client.fullName || !client.email) {
      return NextResponse.json(
        { success: false, message: "Missing required property or client fields." },
        { status: 400 }
      );
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'martin@gtconnections.com';
    const fromName = process.env.SENDGRID_FROM_NAME || 'Cupon Tours';
    const from = `${fromName} <${fromEmail}>`;
    const title = propertyName || `Property #${propertyId}`;

    const msg = {
      to: process.env.CONTACT_INBOX || 'info@cupontours.com',
      from,
      replyTo: client.email,
      subject: `[Property Inquiry] ${title} - ${client.fullName}`,
      text: `New property inquiry received:\n\nPROPERTY:\nID: ${propertyId}\nName: ${title}\n\nDATES:\nCheck-in: ${checkIn || 'Not specified'}\nCheck-out: ${checkOut || 'Not specified'}\n\nCLIENT INFO:\nName: ${client.fullName}\nEmail: ${client.email}\nPhone: ${client.phoneNumber || 'Not provided'}\nMessage:\n${client.message || 'None'}`,
      html: renderInquiryEmail({
        eyebrow: 'Vacation rental',
        title: 'New Property Inquiry',
        sections: [
          { heading: 'Property Info', rows: [
            { label: 'Property', value: `${title} (ID: ${propertyId})` },
          ] },
          { heading: 'Requested Dates', rows: [
            { label: 'Check-in', value: checkIn || 'Not specified' },
            { label: 'Check-out', value: checkOut || 'Not specified' },
          ] },
          { heading: 'Client Information', rows: [
            { label: 'Full Name', value: client.fullName },
            { label: 'Email Address', value: client.email },
            { label: 'Phone Number', value: client.phoneNumber || 'Not provided' },
          ] },
        ],
        message: { label: 'Message', body: client.message || 'No message provided.' },
      }),
    };

    await sendMail(msg);

    return NextResponse.json(
      { success: true, message: "Your inquiry was sent successfully! Our team will contact you soon." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Booking properties route error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send your inquiry. Please try again later." },
      { status: 500 }
    );
  }
}
