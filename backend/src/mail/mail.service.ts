import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class MailService {
  constructor(private prisma: PrismaClient) {}
  private transporter = nodemailer.createTransport({
    service: "Gmail",
    host: process.env.EMAIL_HOST! as string,
    port: parseInt(process.env.EMAIL_PORT!),
    secure: true,
    auth: {
      user: process.env.SYSTEM_EMAIL! as string,
      pass: process.env.SYSTEM_PASSWORD! as string,
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

  async sendServiceRequestEmail(serviceName: string, serviceDescription: string, serviceCategory: string, useCase: string, specificRequirements: string, expectedTimeline: string, budget: number) {
    await this.transporter.sendMail({
      from: '"Admin" <noreply@videcto.com>',
      to: process.env.SYSTEM_EMAIL!,
      subject: "Service Request",
      html: `<p>Hello, a new service request has been made:</p><p><strong>Service Name:</strong> ${serviceName}<br/><strong>Service Description:</strong> ${serviceDescription}<br/><strong>Service Category:</strong> ${serviceCategory}<br/><strong>Use Case:</strong> ${useCase}<br/><strong>Specific Requirements:</strong> ${specificRequirements}<br/><strong>Expected Timeline:</strong> ${expectedTimeline}<br/><strong>Budget:</strong> ${budget}</p>`,
    });
  }

  async sendServiceRequestReplyEmail(email: string, serviceName: string, serviceDescription: string, serviceCategory: string) {
    await this.transporter.sendMail({
      from: '"Admin" <noreply@videcto.com>',
      to: email,
      subject: "Service Request Reply",
      html: `<p>Hello, your service request has been replied to:</p><p><strong>Service Name:</strong> ${serviceName}<br/><strong>Service Description:</strong> ${serviceDescription}<br/><strong>Service Category:</strong> ${serviceCategory}</p>`,
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
      from: `${type.toUpperCase()} <${process.env.SYSTEM_EMAIL}>`,
      to: process.env.ALERT_RECEIVER!,
      subject: `🚨 ${type.toUpperCase()} DETECTED`,
      html: htmlContent,
    });
  }

  async sendModelPurchaseEmail(username: string, modelName: string) {
    await this.transporter.sendMail({
      from: '"Admin" <noreply@videcto.com>',
      to: process.env.SYSTEM_EMAIL!,
      subject: "Model Purchase",
      html: `<p>Hello, a new model has been purchased:</p><p><strong>Username:</strong> ${username}<br/><strong>Model Name:</strong> ${modelName}</p>`, 
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
