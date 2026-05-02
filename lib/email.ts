// lib/email.ts
import nodemailer from 'nodemailer';

interface SendResetPasswordEmailParams {
  email: string;
  name: string;
  resetLink: string;
}

export async function sendResetPasswordEmail({ email, name, resetLink }: SendResetPasswordEmailParams) {
  // Buat transporter dengan konfigurasi
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #407BA7;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #407BA7;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #356a8f;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 12px;
          border-radius: 6px;
          margin: 20px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VisiTrack</h1>
        </div>
        <div class="content">
          <h2>Halo ${name},</h2>
          <p>Kami menerima permintaan untuk mereset password akun VisiTrack Anda.</p>
          <p>Klik tombol di bawah ini untuk mereset password Anda:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <div class="warning">
            <strong>⚠️ Link ini hanya berlaku 1 jam.</strong><br>
            Jika Anda tidak meminta reset password, abaikan email ini.
          </div>
          <p>Atau copy link berikut ke browser Anda:</p>
          <p style="word-break: break-all; font-size: 12px; color: #666;">${resetLink}</p>
          <p>Terima kasih,<br>Tim VisiTrack</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} VisiTrack. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"VisiTrack" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Reset Password VisiTrack',
    html,
  });
}