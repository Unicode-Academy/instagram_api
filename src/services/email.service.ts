import nodemailer, { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    // Check if email credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp.gmail.com",
          port: parseInt(process.env.EMAIL_PORT || "587"),
          secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        this.isConfigured = true;
        console.log("✅ Email service configured successfully");
      } catch (error) {
        console.warn("⚠️  Email service configuration failed:", error);
        this.isConfigured = false;
      }
    } else {
      console.warn(
        "⚠️  Email service not configured. EMAIL_USER and EMAIL_PASSWORD are required."
      );
      console.warn(
        "   Set these in your .env file to enable email functionality."
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    // If email is not configured, just log and return without throwing error
    if (!this.isConfigured || !this.transporter) {
      console.log(
        `📧 [Email Disabled] Would send email to ${options.to}: ${options.subject}`
      );
      console.log(
        "   Configure EMAIL_USER and EMAIL_PASSWORD in .env to enable email sending."
      );
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${options.to}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    resetLink: string
  ): Promise<void> {
    const subject = "Password Reset Request";
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetLink}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <p>Reset Token: ${resetToken}</p>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  async sendPasswordChangeConfirmation(email: string): Promise<void> {
    const subject = "Password Changed Successfully";
    const html = `
      <h2>Password Changed</h2>
      <p>Your password has been successfully changed.</p>
      <p>If this wasn't you, please contact us immediately.</p>
      <p>Thank you!</p>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  async sendVerificationEmail(
    email: string,
    verificationToken: string,
    verificationLink: string
  ): Promise<void> {
    const subject = "Verify Your Email Address";
    const html = `
      <h2>Welcome to Instagram API!</h2>
      <p>Thank you for signing up. Click the link below to verify your email address:</p>
      <p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  async sendVerificationSuccess(email: string): Promise<void> {
    const subject = "Email Verified Successfully";
    const html = `
      <h2>Email Verified!</h2>
      <p>Your email has been successfully verified.</p>
      <p>You can now enjoy all features of Instagram API.</p>
      <p>Thank you!</p>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();
