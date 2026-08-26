import { NextResponse } from 'next/server';
import { sendMail } from '@/app/lib/services/mailer';
import { renderInquiryEmail } from '@/app/lib/services/email-template';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, message } = body;

    // Validación básica de campos requeridos
    if (!firstName || !lastName || !email || !message) {
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
      subject: `New Contact Request: ${firstName} ${lastName}`,
      text: `New contact request received from your website:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phoneNumber || 'Not provided'}\n\nMessage:\n${message}`,
      html: renderInquiryEmail({
        eyebrow: 'Website inquiry',
        title: 'New Contact Request',
        sections: [
          { rows: [
            { label: 'Name', value: `${firstName} ${lastName}` },
            { label: 'Email', value: email },
            { label: 'Phone', value: phoneNumber || 'Not provided' },
          ] },
        ],
        message: { label: 'Message', body: message },
      }),
    };

    // Envío del correo vía SendGrid
    await sendMail(msg);

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully straight through our platform setup!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("SendGrid route handler error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to process the email delivery via Next.js server handles." },
      { status: 500 }
    );
  }
}