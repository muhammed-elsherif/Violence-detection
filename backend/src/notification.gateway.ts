import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "./user/user.service";
import { ProcessingResponse } from "./interface/processing.interface";

interface JwtPayload {
  sub: string;
  email: string;
}

type DetectionStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "ERROR";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("NotificationGateway");
  userSockets: Map<string, Socket> = new Map();

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const userId = payload.sub;

      this.userSockets.set(userId, client);
      client.emit("message", {
        message: `Connected to server, your id is ${userId}`,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Authentication failed for client: ${client.id}`,
        error,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.userSockets.entries()) {
      if (socket.id === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(
          `Client disconnected: ${client.id} for user: ${userId}`,
        );
        break;
      }
    }
  }

  emitDetectionNotification(
    userId: string,
    status: DetectionStatus,
    data?: ProcessingResponse,
  ) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit("detection", { status, data });
    }
  }

  @SubscribeMessage("subscribe")
  handleSubscribe(client: Socket, payload: { type: string }) {
    this.logger.log(`Client ${client.id} subscribed to ${payload.type}`);
    return { event: "subscribed", data: { type: payload.type } };
  }

  @SubscribeMessage("hello_all")
  async handleHelloAll() {
    for (const [userId, socket] of this.userSockets.entries()) {
      try {
        const user = await this.userService.findOneById(userId);
        if (user) {
          socket.emit("message", {
            message: `Hello ${user.username}, your email is ${user.email}`,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        this.logger.error(
          `Error sending test message to user ${userId}:`,
          error,
        );
      }
    }
  }
}
