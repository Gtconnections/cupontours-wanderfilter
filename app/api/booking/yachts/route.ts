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
    const { yachtId, yachtName, charterStart, charterEnd, totalDays, client } = body;

    if (!yachtId || !yachtName || !charterStart || !charterEnd || !client.fullName || !client.email) {
      return NextResponse.json(
        { success: false, message: "Missing required charter or client fields." },
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
      replyTo: client.email,
      subject: `[Yacht Charter Booking] Request for ${yachtName} - ${client.fullName}`,
      text: `New luxury yacht charter inquiry received:\n\nVESSEL DETAILS:\nID: ${yachtId}\nName: ${yachtName}\n\nCHARTER CRITERIA:\nStart: ${charterStart}\nEnd: ${charterEnd}\nTotal Days: ${totalDays}\n\nCLIENT INFO:\nName: ${client.fullName}\nEmail: ${client.email}\nPhone: ${client.phoneNumber || 'Not provided'}\nSpecial Requests:\n${client.specialRequests || 'None'}`,
      html: renderInquiryEmail({
        eyebrow: 'Luxury yacht charter',
        title: 'New Yacht Charter Booking Request',
        sections: [
          { heading: 'Vessel Info', rows: [
            { label: 'Yacht', value: `${yachtName} (ID: ${yachtId})` },
          ] },
          { heading: 'Charter Schedule', rows: [
            { label: 'Start Date', value: charterStart },
            { label: 'End Date', value: charterEnd },
            { label: 'Duration', value: `${totalDays} ${totalDays === 1 ? 'day' : 'days'}` },
          ] },
          { heading: 'Client Information', rows: [
            { label: 'Full Name', value: client.fullName },
            { label: 'Email Address', value: client.email },
            { label: 'Phone Number', value: client.phoneNumber || 'Not provided' },
          ] },
        ],
        message: { label: 'Special requests & marine instructions', body: client.specialRequests || 'No special requests provided.' },
      }),
    };

    await sendMail(msg);

    return NextResponse.json(
      { success: true, message: "Your luxury charter request was submitted successfully! Our maritime concierge will contact you within 2 hours." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Booking yachts route error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send your charter request. Please try again later." },
      { status: 500 }
    );
  }
}