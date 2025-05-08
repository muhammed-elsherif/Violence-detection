import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AlertsGateway {
  @WebSocketServer()
  server: Server;

  sendFireAlert(data: any) {
    this.server.emit('fire_detected', data);
  }
}
