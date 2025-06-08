import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { AuthService } from "./auth/auth.service";
import { UserService } from "./user/user.service";
import { PrismaClient } from "@prisma/client";
import { PredictModule } from "./prediction-base/predict.module";
import { UserStatsModule } from "./user-stats/user-stats.module";

import { PrismaModule } from "../prisma/prisma.module";

import { DashboardController } from "./dashboard/dashboard.controller";
import { LiveViolenceModule } from "./live-violence/live-violence.module";
import { GunDetectionModule } from "./gun-detection/gun-detection.module";
import { ObjectDetectionModule } from "./object-detection/object-detection.module";
import { AlertsGateway } from "./alerts/alerts.gateway";
import { AlertsController } from "./alerts/alerts.controller";
import { AlertsService } from "./alerts/alerts.service";
import { AlertsModule } from "./alerts/alerts.module";
import { CustomerService } from "./customer/customer.service";
import { CustomerController } from "./customer/customer.controller";
import { MailService } from "./mail/mail.service";
import { MailController } from "./mail/mail.controller";
import { CustomerModule } from "./customer/customer.module";
import { DownloadController } from "./download/download.controller";
import { FireDetectionModule } from "./fire-detection/fire-detection.module";
import { ServiceController } from "./service/service.controller";
import { ServiceService } from "./service/service.service";
import { ContactController } from "./contact/contact.controller";
import { ContactService } from "./contact/contact.service";
import { RecomendedModelsModule } from "./recomended-models/recomended-models.module";
import { RecomendedModelsController } from "./recomended-models/recomended-models.controller";
import { RecomendedModelsService } from "./recomended-models/recomended-models.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { PredictController } from "./prediction-base/predict.controller";
import { PredictService } from "./violence-detection/predict.service";
import { GunDetectionService } from "./gun-detection/gun-detection.service";
import { FireDetectionService } from "./fire-detection/fire-detection.service";
import { CrashDetectionService } from "./crash-detection/crash-detection.service";
import { ObjectDetectionService } from "./object-detection/object-detection.service";
import { DeveloperController } from "./developer/developer.controller";
import { DeveloperService } from "./developer/developer.service";
import { DownloadService } from "./download/download.service";
import { B2DownloadService } from "./download/b2-download.service";
// import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PredictModule,
    UserStatsModule,
    PrismaModule,
    LiveViolenceModule,
    GunDetectionModule,
    ObjectDetectionModule,
    AlertsModule,
    CustomerModule,
    FireDetectionModule,
    RecomendedModelsModule,
    ConfigModule.forRoot(),
    HttpModule,
    // RedisModule,
  ],
  controllers: [
    AppController,
    DashboardController,
    AlertsController,
    CustomerController,
    MailController,
    DownloadController,
    ServiceController,
    ContactController,
    PredictController,
    RecomendedModelsController,
    DeveloperController,
  ],
  providers: [
    AppService,
    AuthService,
    UserService,
    PrismaClient,
    AlertsGateway,
    AlertsService,
    CustomerService,
    ServiceService,
    MailService,
    ContactService,
    PredictService,
    GunDetectionService,
    FireDetectionService,
    CrashDetectionService,
    ObjectDetectionService,
    RecomendedModelsService,
    DeveloperService,
    DownloadService,
    B2DownloadService,
  ],
})
export class AppModule {}
