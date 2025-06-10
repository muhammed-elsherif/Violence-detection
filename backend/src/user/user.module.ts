import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { PrismaClient } from "@prisma/client";
import { UserController } from "./user.controller";

@Module({
  providers: [UserService, PrismaClient],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
