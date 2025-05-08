import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST!,
    port: parseInt(process.env.EMAIL_PORT!),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  async sendUserCredentials(email: string, password: string) {
    await this.transporter.sendMail({
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Account Credentials",
      text: `Hello, here are your login credentials:\n\nEmail: ${email}\nTemporary Password: ${password}\nPlease change it after your first login.`,
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
