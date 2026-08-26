import { NextResponse } from 'next/server';
import { sendMail } from '@/app/lib/services/mailer';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, message } = body;

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
      subject: `Work With Us Request: ${firstName} ${lastName}`,
      text: `New alliance request received from your website:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phoneNumber || 'Not provided'}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111111; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px;">
          <h2 style="font-size: 20px; font-weight: 700; border-bottom: 1px solid #ebebeb; padding-bottom: 12px; color: #111111;">New Alliance Request</h2>
          <p style="font-size: 14px; margin: 16px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="font-size: 14px; margin: 16px 0;"><strong>Email:</strong> ${email}</p>
          <p style="font-size: 14px; margin: 16px 0;"><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Property/Alliance Details:</p>
            <p style="font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    };

    await sendMail(msg);

    return NextResponse.json(
      { success: true, message: "Your request has been submitted successfully! Our dream team will contact you shortly." },
      { status: 200 }
    );

  } catch (error) {
    const sgError = error as { response?: { body?: unknown }; message?: string };
    if (sgError.response) {
      console.error("SendGrid Alliance Error Details:", sgError.response.body);
    } else {
      console.error("General Alliance Route Error:", error);
    }

    return NextResponse.json(
      { success: false, message: sgError.message || "Failed to process the email delivery via Next.js handles." },
      { status: 500 }
    );
  }
}