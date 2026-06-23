import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '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');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { yachtId, yachtName, charterStart, charterEnd, totalDays, client } = body;

    if (!yachtId || !yachtName || !charterStart || !charterEnd || !client.fullName || !client.email) {
      return NextResponse.json(
        { success: false, message: "Missing required charter or client fields." },
        { status: 400 }
      );
    }

    const msg = {
      to: 'jimenito.2014.mj@gmail.com', 
      from: 'martin@gtconnections.com', // Remitente verificado en SendGrid
      replyTo: client.email,
      subject: `[Yacht Charter Booking] Request for ${yachtName} - ${client.fullName}`,
      text: `New luxury yacht charter inquiry received:\n\nVESSEL DETAILS:\nID: ${yachtId}\nName: ${yachtName}\n\nCHARTER CRITERIA:\nStart: ${charterStart}\nEnd: ${charterEnd}\nTotal Days: ${totalDays}\n\nCLIENT INFO:\nName: ${client.fullName}\nEmail: ${client.email}\nPhone: ${client.phoneNumber || 'Not provided'}\nSpecial Requests:\n${client.specialRequests || 'None'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111111; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px;">
          <h2 style="font-size: 20px; font-weight: 700; border-bottom: 1px solid #ebebeb; padding-bottom: 12px; color: #111111;">New Luxury Yacht Charter Booking Request</h2>
          
          <h3 style="font-size: 15px; margin-top: 20px; color: #444444;">Vessel Info</h3>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Yacht:</strong> ${yachtName} (ID: ${yachtId})</p>
          
          <h3 style="font-size: 15px; margin-top: 20px; color: #444444;">Charter Schedule</h3>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Start Date:</strong> ${charterStart}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>End Date:</strong> ${charterEnd}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Duration:</strong> ${totalDays} ${totalDays === 1 ? 'day' : 'days'}</p>
          
          <h3 style="font-size: 15px; margin-top: 24px; color: #444444; border-top: 1px solid #f4f4f5; padding-top: 16px;">Client Information</h3>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Full Name:</strong> ${client.fullName}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Email Address:</strong> ${client.email}</p>
          <p style="font-size: 14px; margin: 8px 0;"><strong>Phone Number:</strong> ${client.phoneNumber || 'Not provided'}</p>
          
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Special Requests & Marine Instructions:</p>
            <p style="font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin: 0;">${client.specialRequests || 'No special requests provided.'}</p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json(
      { success: true, message: "Your luxury charter request was submitted successfully! Our maritime concierge will contact you within 2 hours." },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process the charter email via Next.js handles." },
      { status: 500 }
    );
  }
}