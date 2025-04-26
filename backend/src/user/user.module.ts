import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';


@Module({
  providers: [UserService, PrismaClient],
  exports:[UserService]
})
export class UserModule {}
