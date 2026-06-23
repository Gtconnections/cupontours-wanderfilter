import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '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');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interestType, firstName, lastName, email, phoneNumber, message } = body;

    if (!interestType || !firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const msg = {
      to: 'jimenito.2014.mj@gmail.com', 
      from: 'martin@gtconnections.com', // Remitente verificado en tu cuenta de SendGrid
      replyTo: email,
      subject: `[Property Management] ${interestType} Request - ${firstName} ${lastName}`,
      text: `New property management/investment request received:\n\nInterest: ${interestType}\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phoneNumber || 'Not provided'}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111111; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px;">
          <h2 style="font-size: 20px; font-weight: 700; border-bottom: 1px solid #ebebeb; padding-bottom: 12px; color: #111111;">New Investment & Management Inquiry</h2>
          <p style="font-size: 14px; margin: 16px 0;"><strong>Interested In:</strong> <span style="background-color: #f4f4f5; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${interestType}</span></p>
          <p style="font-size: 14px; margin: 16px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="font-size: 14px; margin: 16px 0;"><strong>Email:</strong> ${email}</p>
          <p style="font-size: 14px; margin: 16px 0;"><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Message / Property Details:</p>
            <p style="font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json(
      { success: true, message: "Your investment strategy request has been submitted successfully! Our team will contact you shortly." },
      { status: 200 }
    );

  } catch (error: any) {
    if (error.response) {
      console.error("SendGrid Invest Route Error Details:", error.response.body);
    } else {
      console.error("General Invest Route Error:", error);
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to process the email delivery via Next.js handles." },
      { status: 500 }
    );
  }
}