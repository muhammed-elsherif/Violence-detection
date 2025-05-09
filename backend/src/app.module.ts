import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
// import { LocalStrategy } from './auth/local.strategy';
import { AuthService } from "./auth/auth.service";
import { UserService } from "./user/user.service";
import { PrismaClient } from "@prisma/client";
import { PredictModule } from "./model/predict.module";
import { UserStatsModule } from "./user-stats/user-stats.module";

import { PrismaModule } from "../prisma/prisma.module";

import { DashboardController } from "./dashboard/dashboard.controller";
import { DashboardService } from "./dashboard/dashboard.service";
import { LiveViolenceModule } from "./live-violence/live-violence.module";
import { GunDetectionModule } from "./gun-detection/gun-detection.module";
import { ObjectDetectionModule } from "./object-detection/object-detection.module";
import { PrismaSqlModule } from "./prisma-sql/prisma-sql.module";
import { AlertsGateway } from "./alerts/alerts.gateway";
import { AlertsController } from "./alerts/alerts.controller";
import { AlertsService } from './alerts/alerts.service';
import { AlertsModule } from './alerts/alerts.module';
import { AiModelService } from './aimodel/aimodel.service';
import { AiModelController } from './aimodel/aimodel.controller';
import { CustomerService } from './customer/customer.service';
import { CustomerController } from './customer/customer.controller';
import { MailService } from './mail/mail.service';
import { MailController } from './mail/mail.controller';
import { CustomerModule } from './customer/customer.module';
import { DownloadController } from './download/download.controller';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PredictModule,
    UserStatsModule,
    PrismaModule,
    LiveViolenceModule,
    GunDetectionModule,
    PrismaSqlModule,
    ObjectDetectionModule,
    AlertsModule,
    CustomerModule,
  ],
  controllers: [AppController, DashboardController, AlertsController, AiModelController, CustomerController, MailController, DownloadController],
  providers: [
    AppService,
    AuthService,
    UserService,
    PrismaClient,
    DashboardService,
    AlertsGateway,
    AlertsService,
    AiModelService,
    CustomerService,
    MailService
  ],
})
export class AppModule {}
