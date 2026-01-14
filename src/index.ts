import express, { Express } from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
dotenv.config();
import connectDB from "./config/database";
import { connectRedis } from "./config/redis";
import { initializeSocket } from "./config/socket";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import postRouter from "./routes/post.route";
import searchHistoryRouter from "./routes/searchHistory.route";
import followRouter from "./routes/follow.route";
import messageRouter from "./routes/message.route";
import { errorHandler } from "./middleware/errorHandler";

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
const io = initializeSocket(httpServer);
app.set("io", io);

// Middleware
app.use(helmet());
app.use(cors()); // Allow all origins for learning purposes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/src/static/docs.html");
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/search-history", searchHistoryRouter);
app.use("/api/follow", followRouter);
app.use("/api/messages", messageRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    success: false,
  });
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await connectRedis();

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Socket.IO initialized`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
