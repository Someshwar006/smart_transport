const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('[Email] Configured with custom SMTP credentials.');
  } else {
    // Graceful fallback: Ethereal test account or console mock
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email] Ethereal test account created for mock delivery (${testAccount.user})`);
    } catch (err) {
      console.warn('[Email] Could not create Ethereal account, falling back to mock console logger.');
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n--- [MOCK EMAIL NOTIFICATION DISPATCHED] ---');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Preview: ${mailOptions.text || mailOptions.html?.substring(0, 150)}...`);
          console.log('--------------------------------------------\n');
          return { messageId: 'mock-mail-' + Date.now() };
        },
      };
    }
  }
  return transporter;
};

const sendNotificationEmail = async ({ to, subject, html, text }) => {
  try {
    const client = await initTransporter();
    const info = await client.sendMail({
      from: `"LogiConnect Logistics" <${process.env.EMAIL_USER || 'notifications@logiconnect.in'}>`,
      to,
      subject,
      text: text || '',
      html: html || `<p>${text}</p>`,
    });

    if (nodemailer.getTestMessageUrl && info && typeof info === 'object') {
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        console.log(`[Email Preview URL]: ${testUrl}`);
      }
    }
    return info;
  } catch (error) {
    console.error(`[Email Dispatch Warning] Failed to send email to ${to}:`, error.message);
    // Non-blocking: Do not crash business operations if email server times out
    return null;
  }
};

module.exports = { sendNotificationEmail, initTransporter };
