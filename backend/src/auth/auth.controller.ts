import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/signup.dto";
import { SignInDto } from "./dto/signin.dto";
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import { SignInResponseDto } from "./dto/signin-res.dto";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForceChangePasswordDto } from "src/customer/dto/force-change-password.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { Roles } from "./roles.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private prisma: PrismaClient
  ) {}

  @Post("signup")
  @ApiResponse({ status: 201, type: SignInResponseDto })
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      return await this.authService.signUp(
        signUpDto.username,
        signUpDto.email,
        signUpDto.password
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post("signin")
  @ApiResponse({ status: 200, type: SignInResponseDto })
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    const user = await this.authService.validateUser(
      signInDto.email,
      signInDto.password
    );

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    return this.authService.login(user);
  }

  @Post("login")
  @ApiResponse({ status: 200, type: SignInResponseDto })
  async logIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    const user = await this.authService.validateCustomer(
      signInDto.email,
      signInDto.password
    );

    // If must change password, return a different structure
    if ("mustChangePassword" in user && user.mustChangePassword) {
      return {
        status: "FORCE_CHANGE_PASSWORD",
        customerId: user.customerId,
        message: "Please change your password before continuing.",
      } as any; // TODO change DTO
    }

    return this.authService.login(user);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    const newHashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.customer.update({
      where: { id: req.user.sub },
      data: {
        password: newHashed,
        hasChangedPassword: true,
      },
    });

    return { message: "Password changed successfully" };
  }

  @Post("forgot-password")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  async forgotPassword(@Request() req, @Body() dto: ChangePasswordDto) {
    const newHashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: req.user.sub },
      data: {
        password: newHashed,
      },
    });

    return { message: "Password changed successfully" };
  }
}
