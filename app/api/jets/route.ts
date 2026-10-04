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
    const { flightCriteria, contact } = body;

    if (!flightCriteria.departureCity || !flightCriteria.destinationCity || !contact.firstName || !contact.lastName || !contact.email || !contact.phone) {
      return NextResponse.json(
        { success: false, message: "Missing required flight or contact fields." },
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
      replyTo: contact.email,
      subject: `[Private Aviation] Charter Quote Request - ${contact.firstName} ${contact.lastName}`,
      text: `New private charter inquiry received:\n\nFLIGHT CRITERIA:\nDeparture: ${flightCriteria.departureCity}\nDestination: ${flightCriteria.destinationCity}\nPassengers: ${flightCriteria.passengers}\nTrip Type: ${flightCriteria.tripType}\nTime: ${flightCriteria.departureTime}\nDates: ${flightCriteria.departureDate} -> ${flightCriteria.returnDate || 'N/A'}\n\nCONTACT INFO:\nName: ${contact.firstName} ${contact.lastName}\nEmail: ${contact.email}\nPhone: ${contact.phone}\nInstagram: ${contact.instagram || 'Not provided'}`,
      html: renderInquiryEmail({
        eyebrow: 'Private aviation',
        title: 'New Private Jet Quote Request',
        sections: [
          { heading: 'Flight Criteria', rows: [
            { label: 'Route', value: `${flightCriteria.departureCity} → ${flightCriteria.destinationCity}` },
            { label: 'Trip Type', value: flightCriteria.tripType },
            { label: 'Passengers', value: String(flightCriteria.passengers) },
            { label: 'Departure Time', value: flightCriteria.departureTime },
            { label: 'Date', value: flightCriteria.departureDate },
          ] },
          { heading: 'Contact Details', rows: [
            { label: 'Client', value: `${contact.firstName} ${contact.lastName}` },
            { label: 'Email', value: contact.email },
            { label: 'Phone', value: contact.phone },
            { label: 'Instagram', value: contact.instagram || 'Not provided' },
          ] },
        ],
      }),
    };

    await sendMail(msg);

    return NextResponse.json(
      { success: true, message: "Your flight criteria has been processed successfully! An aviation specialist will reach out within 2 hours." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Jets route error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send your inquiry. Please try again later." },
      { status: 500 }
    );
  }
}