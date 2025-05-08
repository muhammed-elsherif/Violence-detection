import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import * as nodemailer from "nodemailer";
import { Twilio } from "twilio";

@Injectable()
export class AlertsService {
  private transporter;

  constructor(private prisma: PrismaClient) {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST!,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    // this.twilio = new Twilio(
    //   this.config.get("TWILIO_SID"),
    //   this.config.get("TWILIO_AUTH_TOKEN")
    // );
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
      subject: "🚨 FIRE DETECTED",
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

  async logAlertToDatabase(image: string, location: any) {
    await this.prisma.alert.create({
      data: {
        image,
        lat: location.lat,
        lng: location.lng,
      },
    });
  }
}
