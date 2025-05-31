import { Controller, Get, Res, UseGuards, NotFoundException } from "@nestjs/common";
import { join } from 'path';
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { existsSync } from 'fs';

@Controller("download")
@UseGuards(JwtAuthGuard)
export class DownloadController {
  @Get("ai-desktop")
  downloadApp(@Res() res) {
    const fileName = process.platform === 'darwin'
      ? 'AI-Detector-1.0.0-mac.dmg'
      : 'AI-Detector-1.0.0-win.exe';
    const filePath = join('../ai-desktop/dist', fileName);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('Application not found. Please contact support.');
    }
    
    return res.download(filePath, fileName);
  }

  @Get("attendance-model")
  downloadAttendanceModel(@Res() res) {
    const fileName = process.platform === 'darwin'
      ? 'Attendance-System-1.0.0-mac.dmg'
      : 'Attendance-System-1.0.0-win.exe';
    const filePath = join('../Machine Learning/test_prediction/dist', fileName);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('Application not found. Please contact support.');
    }
    
    return res.download(filePath, fileName);
  }
}
