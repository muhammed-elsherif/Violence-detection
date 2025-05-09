import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { join } from 'path';

@Controller("download")
export class DownloadController {
  @Get("ai-desktop")
  // @UseGuards(AuthGuard)
  downloadApp(@Res() res) {
    const fileName = process.platform === 'darwin'
      ? 'AI-Detector-1.0.0-mac.dmg'
      : 'AI-Detector-1.0.0-win.exe';
    const filePath = join('../ai-desktop/dist', fileName);
    return res.download(filePath, fileName);
  }
}
