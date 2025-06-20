import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User, UserRole } from "@prisma/client";
import { CustomerService } from "src/customer/customer.service";

@Injectable()
export class AuthService {
  constructor(
    public customerService: CustomerService,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    return this.userService.validateUser(email, password);
  }

  generateTokens(user: Partial<User> & { role?: UserRole }) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role || UserRole.USER,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: "7d" }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: "15d" }),
      role: user.role || UserRole.USER,
    };
  }

  login(user: Partial<User> & { role?: UserRole }) {
    return this.generateTokens(user);
  }

  async signUp(username: string, email: string, password: string) {
    const user = await this.userService.createUser(username, email, password);
    return this.generateTokens(user);
  }

  async validateCustomer(email: string, password: string) {
    return this.customerService.validateCustomer(email, password);
  }
}
