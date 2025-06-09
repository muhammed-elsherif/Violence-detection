import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/history')
    @ApiOperation({ summary: 'Get user history' })
    @ApiResponse({ status: 200, description: 'User history retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Roles(UserRole.USER)
    async getHistory(@Req() req: any) {
        const sub = req.user.sub;
        return this.userService.getHistory(sub);
    }

    @Get()
    @ApiOperation({ summary: 'Get user' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Roles(UserRole.USER)
    async getUser(@Req() req: any) {
        const sub = req.user.sub;
        return this.userService.getUser(sub);
    }
}
