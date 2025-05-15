import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: "Gmail",
    host: process.env.EMAIL_HOST! as string,
    port: parseInt(process.env.EMAIL_PORT!),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER! as string,
      pass: process.env.EMAIL_PASS! as string,
    },
  });
  
  async sendUserCredentials(email: string, password: string) {
    await this.transporter.sendMail({
      from: '"Admin" <noreply@videcto.com>',
      to: email,
      subject: "Your Account Credentials",
      html: `<p>Hello, here are your login credentials:</p><p><strong>Email:</strong> ${email}<br/><strong>Password:</strong> ${password}</p><p>Please change it after your first login.</p>`,
    });
  }

  async sendEmailAlert(body: any, type: string) {
    const { image, location } = body;
    const htmlContent = `
      <h3>🔥 ${type.toUpperCase()} Detected</h3>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Location:</strong> ${location?.lat}, ${location?.lng}</p>
      <img src="${image}" width="300">
    `;

    await this.transporter.sendMail({
      from: `${type.toUpperCase()} <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_RECEIVER!,
      subject: `🚨 ${type.toUpperCase()} DETECTED`,
      html: htmlContent,
    });
  }
  //   async callEmergencyService(location: { lat: number; lng: number }) {
  //     const message = `🔥 Fire detected at location ${location.lat}, ${location.lng}`;
  //     await this.twilio.calls.create({
  //       twiml: `<Response><Say>${message}</Say></Response>`,
  //       to: this.config.get('EMERGENCY_NUMBER'), // e.g., verified phone
  //       from: this.config.get('TWILIO_NUMBER'),
  //     });
  //   }
}
