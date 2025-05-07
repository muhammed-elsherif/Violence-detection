import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaSqlService } from './prisma-sql.service';
import { PrismaSqlController } from './prisma-sql.controller';

@Module({
  providers: [PrismaSqlService, PrismaClient],
  controllers: [PrismaSqlController],
  exports: [PrismaSqlService],
})
export class PrismaSqlModule {}
