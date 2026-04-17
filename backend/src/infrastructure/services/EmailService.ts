import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (process.env.SMTP_HOST) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
    } else {
        console.warn('EmailService: No SMTP configuration found. Emails will be logged to console.');
    }
  }

  async sendWaitlistConfirmation(email: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"LifeOS" <no-reply@lifeos.io>',
      to: email,
      subject: "You're on the LifeOS Waitlist | Adaptive Behavior Engine",
      text: "Welcome to LifeOS.\n\nThank you for joining the waitlist. We'll notify you when your access is ready.\n\nWarmly,\nThe LifeOS Team",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border: 1px solid #1a1a1a; border-radius: 8px;">
          <h1 style="color: #6c5ce7; border-bottom: 1px solid #1a1a1a; padding-bottom: 20px;">Welcome to LifeOS.</h1>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for joining the waitlist for the Adaptive Behavior Engine.</p>
          <p style="font-size: 16px; line-height: 1.6;">Your journey to a data-driven operating system for your life starts soon. We'll notify you when your access is ready.</p>
          <p style="margin-top: 40px; font-size: 14px; color: #666;">Warmly,<br />The LifeOS Team</p>
        </div>
      `,
    };

    if (this.transporter) {
      try {
        await this.transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to: ${email}`);
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
      }
    } else {
      console.log(`[EMAIL MOCK] Sent waitlist confirmation to: ${email}`);
    }
  }
}

export const emailService = new EmailService();
