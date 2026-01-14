import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyAccessToken } from "../utils/jwt";

interface AuthenticatedSocket {
  userId: string;
}

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = verifyAccessToken(token);
      if (!decoded) {
        return next(new Error("Authentication error: Invalid token"));
      }
      (socket as any).userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId}`);

    // Join user's personal room for receiving messages
    socket.join(userId);

    // Handle typing indicator
    socket.on(
      "typing",
      (data: { conversationId: string; recipientId: string }) => {
        io.to(data.recipientId).emit("user_typing", {
          conversationId: data.conversationId,
          userId,
        });
      }
    );

    // Handle stop typing
    socket.on(
      "stop_typing",
      (data: { conversationId: string; recipientId: string }) => {
        io.to(data.recipientId).emit("user_stop_typing", {
          conversationId: data.conversationId,
          userId,
        });
      }
    );

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};
