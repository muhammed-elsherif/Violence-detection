import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { AlertsGateway } from '../alerts/alerts.gateway';

@Injectable()
export class ContactService {
    constructor(private readonly mail: MailService, private readonly alertsGateway: AlertsGateway) {
    }

    async createContact(createContactDto: any) {
        this.mail.sendContactEmail(createContactDto.name, createContactDto.email, createContactDto.phone, createContactDto.subject || "Contact Form Submission" , createContactDto.message);
        
        this.alertsGateway.sendContactForm({
            name: createContactDto.name,
            email: createContactDto.email,
            phone: createContactDto.phone,
            message: createContactDto.message,
            subject: createContactDto.subject || "Contact Form Submission",
          });
        return { message: "Contact form submitted successfully" };
    }
}
