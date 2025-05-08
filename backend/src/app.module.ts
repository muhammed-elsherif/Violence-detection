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
  ],
  controllers: [AppController, DashboardController, AlertsController],
  providers: [
    AppService,
    AuthService,
    UserService,
    PrismaClient,
    DashboardService,
    AlertsGateway,
    AlertsService
  ],
})
export class AppModule {}
