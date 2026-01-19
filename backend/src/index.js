import express from "express";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors";
import { app, server } from "./lib/socket.js"
import path from "path"

dotenv.config();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());
app.use(cors(
    {
        origin: ["http://localhost:5173", "https://sampark-2.onrender.com" , "*"],
        credentials: true,
    }
))

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

server.listen(PORT, () => {
    console.log("Server is running on PORT : ", PORT);
    connectDB();
});