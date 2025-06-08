import { Module } from "@nestjs/common";
import { DownloadController } from "./download.controller";
import { ServiceModule } from "../service/service.module";
import { DownloadService } from "./download.service";
import { B2DownloadService } from "./b2-download.service";

@Module({
  imports: [ServiceModule],
  controllers: [DownloadController],
  providers: [DownloadService, B2DownloadService],
})
export class DownloadModule {}
