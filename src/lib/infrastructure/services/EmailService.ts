import { injectable } from "inversify";
import type { IEmailService } from "../../application/interfaces/IEmailService";

@injectable()
export class EmailService implements IEmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // In development, we'll just log the email
    // In production, this would integrate with an email service like SendGrid, Mailgun, etc.

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    console.log("📧 Email Verification");
    console.log("To:", email);
    console.log("Subject: Verify Your Email Address");
    console.log("Verification URL:", verificationUrl);
    console.log("---");

    // TODO: Implement actual email sending
    // Example with a hypothetical email service:
    /*
    await emailProvider.send({
      to: email,
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      data: { verificationUrl }
    });
    */
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    console.log("📧 Password Reset");
    console.log("To:", email);
    console.log("Subject: Reset Your Password");
    console.log("Reset URL:", resetUrl);
    console.log("---");

    // TODO: Implement actual email sending
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    console.log("📧 Welcome Email");
    console.log("To:", email);
    console.log("Subject:", `Welcome ${firstName}!`);
    console.log("Message: Welcome to our platform!");
    console.log("---");

    // TODO: Implement actual email sending
  }
}
