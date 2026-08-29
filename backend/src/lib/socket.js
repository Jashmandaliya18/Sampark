import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { registerVideoCallHandlers } from '../videoCall/videoCall.socket.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Allow any origin for local dev & production with credentials
            callback(null, true);
        },
        credentials: true,
    }
});

// Map of userId -> Set of active socket.id's
const userSocketMap = {};

export function getReceiverSocketId(userId) {
    if (!userId) return [];
    const sockets = userSocketMap[String(userId)];
    return sockets ? Array.from(sockets) : [];
}

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Register isolated video call event handlers
    registerVideoCallHandlers(io, socket);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined" && userId !== "null") {
        const idStr = String(userId);
        if (!userSocketMap[idStr]) {
            userSocketMap[idStr] = new Set();
        }
        userSocketMap[idStr].add(socket.id);
    }

    // Emit all online user IDs
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (userId && userId !== "undefined" && userId !== "null") {
            const idStr = String(userId);
            if (userSocketMap[idStr]) {
                userSocketMap[idStr].delete(socket.id);
                if (userSocketMap[idStr].size === 0) {
                    delete userSocketMap[idStr];
                }
            }
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };