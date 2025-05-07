import { Controller } from '@nestjs/common';
import { PrismaSqlService } from './prisma-sql.service';

@Controller('prisma-sql')
export class PrismaSqlController {
  constructor(private readonly prismaSqlService: PrismaSqlService) {}
}
