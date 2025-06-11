import { Module } from "@nestjs/common";
import { NotificationGateway } from "./notification.gateway";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "24h" },
    }),
    UserModule,
  ],
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationModule {}
