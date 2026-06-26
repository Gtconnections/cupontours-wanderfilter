import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

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

    const msg = {
      to: 'jimenito.2014.mj@gmail.com', 
      from: process.env.SENDGRID_FROM_EMAIL || 'martin@gtconnections.com', // ✅ Usa variable de entorno o fallback
      replyTo: client.email,
      subject: `[Car Rental Booking] Request for ${carTitle} - ${client.fullName}`,
      text: `New luxury vehicle booking inquiry received:\n\nVEHICLE DETAILS:\nID: ${carId}\nTitle: ${carTitle}\n\nRENTAL CRITERIA:\nPick-up: ${pickUpDate}\nReturn: ${returnDate}\nTotal Days: ${totalDays}\n\nCLIENT INFO:\nName: ${client.fullName}\nEmail: ${client.email}\nPhone: ${client.phoneNumber || 'Not provided'}\nSpecial Requests:\n${client.specialRequests || 'None'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111111; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px;">
          <h2 style="font-size: 20px; font-weight: 700; border-bottom: 1px solid #ebebeb; padding-bottom: 12px; color: #111111;">New Luxury Car Rental Booking Request</h2>
          
          <h3 style="font-size: 15px; margin-top: 20px; color: #444444;">Vehicle Info</h3>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Asset Title:</strong> ${carTitle} (ID: ${carId})</p>
          
          <h3 style="font-size: 15px; margin-top: 20px; color: #444444;">Rental Schedule</h3>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Pick-up Date:</strong> ${pickUpDate}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Return Date:</strong> ${returnDate}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Duration:</strong> ${totalDays} ${totalDays === 1 ? 'day' : 'days'}</p>
          
          <h3 style="font-size: 15px; margin-top: 24px; color: #444444; border-top: 1px solid #f4f4f5; padding-top: 16px;">Client Information</h3>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Full Name:</strong> ${client.fullName}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Email Address:</strong> ${client.email}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Phone Number:</strong> ${client.phoneNumber || 'Not provided'}</p>
          
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Special Requests & Instructions:</p>
            <p style="font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin: 0;">${client.specialRequests || 'No special requests provided.'}</p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json(
      { success: true, message: "Your luxury booking request was transmitted successfully! Our concierge team will contact you within 2 hours." },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process the booking email via Next.js handles." },
      { status: 500 }
    );
  }
}