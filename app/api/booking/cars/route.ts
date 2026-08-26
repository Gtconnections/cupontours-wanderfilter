import { NextResponse } from 'next/server';
import { sendMail } from '@/app/lib/services/mailer';
import { renderInquiryEmail } from '@/app/lib/services/email-template';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carId, carTitle, pickUpDate, returnDate, totalDays, client } = body;

    if (!carId || !carTitle || !pickUpDate || !returnDate || !client.fullName || !client.email) {
      return NextResponse.json(
        { success: false, message: "Missing required booking or client fields." },
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
      subject: `[Car Rental Booking] Request for ${carTitle} - ${client.fullName}`,
      text: `New luxury vehicle booking inquiry received:\n\nVEHICLE DETAILS:\nID: ${carId}\nTitle: ${carTitle}\n\nRENTAL CRITERIA:\nPick-up: ${pickUpDate}\nReturn: ${returnDate}\nTotal Days: ${totalDays}\n\nCLIENT INFO:\nName: ${client.fullName}\nEmail: ${client.email}\nPhone: ${client.phoneNumber || 'Not provided'}\nSpecial Requests:\n${client.specialRequests || 'None'}`,
      html: renderInquiryEmail({
        eyebrow: 'Luxury car rental',
        title: 'New Car Rental Booking Request',
        sections: [
          { heading: 'Vehicle Info', rows: [
            { label: 'Asset', value: `${carTitle} (ID: ${carId})` },
          ] },
          { heading: 'Rental Schedule', rows: [
            { label: 'Pick-up Date', value: pickUpDate },
            { label: 'Return Date', value: returnDate },
            { label: 'Duration', value: `${totalDays} ${totalDays === 1 ? 'day' : 'days'}` },
          ] },
          { heading: 'Client Information', rows: [
            { label: 'Full Name', value: client.fullName },
            { label: 'Email Address', value: client.email },
            { label: 'Phone Number', value: client.phoneNumber || 'Not provided' },
          ] },
        ],
        message: { label: 'Special requests & instructions', body: client.specialRequests || 'No special requests provided.' },
      }),
    };

    await sendMail(msg);

    return NextResponse.json(
      { success: true, message: "Your luxury booking request was transmitted successfully! Our concierge team will contact you within 2 hours." },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to process the booking email via Next.js handles." },
      { status: 500 }
    );
  }
}