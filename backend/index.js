import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from './routes/noteRoutes.js'
import { createServer } from "http";
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.get("/", (req, res) => {
  res.json({ data: "Hello" });
});

app.use("/auth", authRoutes);
app.use("/notes",noteRoutes)

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB:", err));

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}...`);
});
