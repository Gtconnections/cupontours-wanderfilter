import { NextResponse } from 'next/server';
import { sendMail } from '@/app/lib/services/mailer';
import { renderInquiryEmail } from '@/app/lib/services/email-template';


import { checkRateLimit, rateLimitedResponse } from '@/app/lib/rate-limit';

export async function POST(request: Request) {
  // Frena el abuso del formulario (spam / email bombing vía Gmail SMTP).
  const rl = checkRateLimit(request);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  try {
    const body = await request.json();
    const { interestType, firstName, lastName, email, phoneNumber, message } = body;

    if (!interestType || !firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // ✅ Formatear el remitente con nombre: "CuponTours <info@cupontours.com>"
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'martin@gtconnections.com';
    const fromName = process.env.SENDGRID_FROM_NAME || 'Cupon Tours';
    const from = `${fromName} <${fromEmail}>`;

    // Estructura del correo electrónico editorial de Wander
    const msg = {
      to: process.env.CONTACT_INBOX || 'info@cupontours.com',
      from: from, // ✅ Ahora es "CuponTours <info@cupontours.com>"
      replyTo: email,
      subject: `[Property Management] ${interestType} Request - ${firstName} ${lastName}`,
      text: `New property management/investment request received:\n\nInterest: ${interestType}\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phoneNumber || 'Not provided'}\n\nMessage:\n${message}`,
      html: renderInquiryEmail({
        eyebrow: 'Investment & management',
        title: 'New Investment & Management Inquiry',
        sections: [
          { rows: [
            { label: 'Interested in', value: interestType },
            { label: 'Name', value: `${firstName} ${lastName}` },
            { label: 'Email', value: email },
            { label: 'Phone', value: phoneNumber || 'Not provided' },
          ] },
        ],
        message: { label: 'Message / Property details', body: message },
      }),
    };

    await sendMail(msg);

    return NextResponse.json(
      { success: true, message: "Your investment strategy request has been submitted successfully! Our team will contact you shortly." },
      { status: 200 }
    );

  } catch (error) {
    const sgError = error as { response?: { body?: unknown }; message?: string };
    if (sgError.response) {
      console.error("SendGrid Invest Route Error Details:", sgError.response.body);
    } else {
      console.error("General Invest Route Error:", error);
    }

    return NextResponse.json(
      { success: false, message: "Failed to send your request. Please try again later." },
      { status: 500 }
    );
  }
}