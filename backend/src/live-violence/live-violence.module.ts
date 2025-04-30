/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { LiveViolenceService } from "./live-violence.service";
import { LiveViolenceController } from "./live-violence.controller";

@Module({
  controllers: [LiveViolenceController],
  providers: [LiveViolenceService],
})
export class LiveViolenceModule {}
