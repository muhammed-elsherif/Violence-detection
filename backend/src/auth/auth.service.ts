import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    return this.userService.validateUser(email, password);
  }

  generateTokens(user: Partial<User>) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  login(user: Partial<User>) {
    return this.generateTokens(user);
  }

  async signUp(username: string, email: string, password: string) {
    const user = await this.userService.createUser(username, email, password);
    return this.generateTokens(user);
  }
}
