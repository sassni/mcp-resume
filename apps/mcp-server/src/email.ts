import nodemailer from 'nodemailer';

export async function sendEmail(args: { to: string; subject: string; body: string }) {
  const { to, subject, body } = args;
  
  if (process.env.NO_EMAIL === 'true') {
    console.log('[NO_EMAIL] Simulating email send:', { to, subject, body });
    return { messageId: 'simulated', to, status: 'simulated' };
  }

  // Verify Gmail credentials are configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
  }

  // Gmail SMTP configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 1,
    rateDelta: 20000,
    rateLimit: 5
  });

  try {
    // Verify connection before sending
    await transporter.verify();
    console.log('Gmail SMTP connection verified successfully');

    const info = await transporter.sendMail({
      from: `"MCP Resume Bot" <${process.env.GMAIL_USER}>`,
      to, // Recipient email
      subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
               <h2 style="color: #4f46e5;">${subject}</h2>
               <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5;">
                 ${body.replace(/\n/g, '<br>')}
               </div>
               <p style="margin-top: 20px; font-size: 12px; color: #666;">
                 This email was sent from the MCP Resume Playground application.
               </p>
             </div>`,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'X-Mailer': 'MCP Resume Bot',
        'X-Original-Sender': process.env.GMAIL_USER,
        'Reply-To': process.env.GMAIL_USER,
        'Return-Path': process.env.GMAIL_USER
      },
      envelope: {
        from: process.env.GMAIL_USER,
        to: to
      }
    });

    console.log('Email sent successfully:', info.messageId);
    return { messageId: info.messageId, to, status: 'sent' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${String(error)}`);
  }
}
