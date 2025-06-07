import { Module } from "@nestjs/common";
import { DownloadController } from "./download.controller";
import { ServiceModule } from "../service/service.module";
import { DownloadService } from "./download.service";

@Module({
  imports: [ServiceModule],
  controllers: [DownloadController],
  providers: [DownloadService],
})
export class DownloadModule {}
