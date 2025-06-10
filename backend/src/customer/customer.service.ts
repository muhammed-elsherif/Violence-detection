import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { MailService } from "src/mail/mail.service";
import { randomBytes } from "crypto";
import { CreateCustomerDto } from "./dto/customer.dto";
import { PrismaClient } from "@prisma/client";
import { ForceChangePasswordDto } from "./dto/force-change-password.dto";

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService
  ) {}

  async createCustomer(dto: CreateCustomerDto, userId: string) {
    const tempPassword = randomBytes(6).toString("hex"); // 12-char temp password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const customer = await this.prisma.customer.create({
      data: {
        ...dto,
        hasChangedPassword: false,
        password: hashedPassword,
        userId: userId,
      },
    });

    await this.mailService.sendUserCredentials(customer.email, tempPassword);

    return { message: "Customer created and credentials sent." };
  }

  async validateCustomer(email: string, password: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw new BadRequestException("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      throw new BadRequestException("Invalid credentials");
    }

    // Force password change on first login
    if (!customer.hasChangedPassword) {
      return {
        mustChangePassword: true,
        customerId: customer.id,
        email: customer.email,
        contactName: customer.contactName,
      };
    }

    return customer;
  }

  async forceChangePassword(customerId: string, dto: ForceChangePasswordDto) {
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    const updatedCustomer = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        password: hashedPassword,
        hasChangedPassword: true,
      },
    });

    return { message: "Password successfully changed." };
  }

  async getCustomers() {
    return this.prisma.customer.findMany();
  }

  async purchaseModel(purchaseModelDto: any, userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId: userId },
    });

    if (!customer) {
      await this.createCustomer(purchaseModelDto, userId);
    }
    
    return this.prisma.customer.update({
      where: { userId: userId },
      data: {
        userId: userId,
        email: purchaseModelDto.email,
        contactName: purchaseModelDto.contactName,
        companyName: purchaseModelDto.companyName,
        industry: purchaseModelDto.industry,
        contactNumber: purchaseModelDto.contactNumber,
        address: purchaseModelDto.address,
        city: purchaseModelDto.city,
        state: purchaseModelDto.state,
        country: purchaseModelDto.country,
        postalCode: purchaseModelDto.postalCode,
        // TODO append the new models to the existing purchasedModels
        purchasedModels: purchaseModelDto.purchasedModels,
      },
    });
  }

  async getCustomerModels(userId: string) {
    const models = await this.prisma.customer.findUnique({
      where: { userId: userId },
      select: {
        purchasedModels: true,
        createdAt: true,
      },
    });

    if (!models) {
      return [];
    }

    const services = await this.prisma.service.findMany({
      where: {
        id: {
          in: models.purchasedModels as string[],
        },
      },
    });

    return services;
  }
}
