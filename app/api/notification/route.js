import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import supabase from '@/lib/client';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.PUBLIC_REDIRECT_URI
)

export async function POST(request) {
    try{
        const { to, subject, message } = await request.json();
        const { data: tokens } = await supabase
            .from('google_tokens')
            .select('access_token')
            .single()

        if (!tokens?.access_token) {
            return NextResponse.json(
                { error: 'No Google token found' },
                { status: 401 }
            );
        }

        oauth2Client.setCredentials({
            access_token: tokens.access_token
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
        `To: ${to}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        message
        ];
        const email = messageParts.join('\n');

        // Encode email
        const encodedMessage = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

        // Send email
        await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
        },
        });

        return NextResponse.json({ success: true });
    }
    catch(error){
        console.error('Error sending email: ', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}