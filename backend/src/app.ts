import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import battleRouter from "./routes/battle.route.js";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.route.js";
import leaderboardRouter from "./routes/leaderboard.route.js";
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api/auth", authRouter);
app.use("/api/battle", battleRouter);
app.use("/api/chats", chatRouter);
app.use("/api/leaderboard", leaderboardRouter);

app.get("/heath", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("*name", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

export default app;
