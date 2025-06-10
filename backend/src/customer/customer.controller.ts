import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller("customer")
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post("create")
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @Req() req: any
  ) {
    return this.customerService.createCustomer(createCustomerDto, req.user.sub);
  }

  @Post("purchase-model")
  async purchaseModel(@Body() purchaseModelDto: any, @Req() req: any) {
    const sub = req.user.sub;
    return this.customerService.purchaseModel(purchaseModelDto, sub);
  }

  @Get("all")
  async getCustomers() {
    return this.customerService.getCustomers();
  }

  @Get("get-models")
  async getCustomerModels(@Req() req: any) {
    const sub = req.user.sub;
    return this.customerService.getCustomerModels(sub);
  }
}
