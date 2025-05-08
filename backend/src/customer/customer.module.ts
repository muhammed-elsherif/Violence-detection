import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { MailService } from "src/mail/mail.service";

@Module({
  providers: [PrismaClient, MailService],
})
export class CustomerModule {}
