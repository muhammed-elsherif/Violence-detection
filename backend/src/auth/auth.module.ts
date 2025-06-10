import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { JwtModule } from "@nestjs/jwt";
import { PrismaClient } from "@prisma/client";
import { CustomerService } from "src/customer/customer.service";
import { MailService } from "src/mail/mail.service";
import { AlertsGateway } from "src/alerts/alerts.gateway";
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "24h" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    PrismaClient,
    CustomerService,
    MailService,
    AlertsGateway,
  ],
})
export class AuthModule {}
