// app/api/notification/route.js
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { to, subject, message } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to, // Must be a verified email in Resend dashboard
      subject: subject,
      html: `<p>${message}</p>`
    });

    console.log('Email send response:', response);

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Full email send error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}