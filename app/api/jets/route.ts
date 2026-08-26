import { NextResponse } from 'next/server';
import { sendMail } from '@/app/lib/services/mailer';


export async function POST(request: Request) {
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
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111111; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px;">
          <h2 style="font-size: 20px; font-weight: 700; border-bottom: 1px solid #ebebeb; padding-bottom: 12px; color: #111111;">New Private Jet Quote Request</h2>
          
          <h3 style="font-size: 15px; margin-top: 20px; color: #444444;">Flight Criteria</h3>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Route:</strong> ${flightCriteria.departureCity} &rarr; ${flightCriteria.destinationCity}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Trip Type:</strong> ${flightCriteria.tripType}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Passengers:</strong> ${flightCriteria.passengers}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Departure Time:</strong> ${flightCriteria.departureTime}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Date:</strong> ${flightCriteria.departureDate}</p>
          
          <h3 style="font-size: 15px; margin-top: 24px; color: #444444; border-top: 1px solid #f4f4f5; padding-top: 16px;">Contact Details</h3>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Client:</strong> ${contact.firstName} ${contact.lastName}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Email:</strong> ${contact.email}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Phone:</strong> ${contact.phone}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Instagram:</strong> ${contact.instagram || 'Not provided'}</p>
        </div>
      `,
    };

    await sendMail(msg);

    return NextResponse.json(
      { success: true, message: "Your flight criteria has been processed successfully! An aviation specialist will reach out within 2 hours." },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to process the flight inquiry via Next.js handles." },
      { status: 500 }
    );
  }
}