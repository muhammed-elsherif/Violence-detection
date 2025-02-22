import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() signUpDto: SignUpDto) {
    const { username, email, password } = signUpDto;
    try {
      await this.authService.signUp(username, email, password);
      return { message: 'User registered successfully' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    const { email, password } = signInDto;
    const existingUser = await this.authService.validateUser(email, password);

    if (!existingUser) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.authService.login(existingUser);
  }
}
