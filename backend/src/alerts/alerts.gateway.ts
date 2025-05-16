import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AlertsGateway {
  @WebSocketServer()
  server: Server;

  sendServiceRequest(data: {
    id: string;
    serviceName: string;
    serviceDescription: string;
    serviceCategory: string;
    userId: string;
    status: string;
    createdAt: Date;
  }) {
    this.server.emit('service_request', data);
  }

  sendFireAlert(data: { location: string; confidence: number }) {
    this.server.emit('fire_detected', data);
  }

  sendModelPurchase(data: { username: string; modelName: string }) {
    this.server.emit('model_purchase', data);
  }
}
