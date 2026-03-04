import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { to, subject, body, userEmail, userPass, senderName } = await req.json();

        if (!to || !subject || !body || !userEmail || !userPass) {
            return NextResponse.json({ error: 'Missing required fields or credentials' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: userEmail, pass: userPass },
            tls: { rejectUnauthorized: false }
        });

        await transporter.verify();

        const fromField = senderName ? `"${senderName}" <${userEmail}>` : userEmail;

        const info = await transporter.sendMail({
            from: fromField,
            to,
            subject,
            text: body
        });

        return NextResponse.json({ message: 'Email sent successfully', messageId: info.messageId }, { status: 200 });

    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
    }
}
