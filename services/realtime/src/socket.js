import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.use((socket, next) => {

        try {

            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Unauthorized"));
            }

            const decodedToken = jwt.verify(
                token,
                process.env.JWT_SEC
            );

            if (!decodedToken || !decodedToken.user) {
                return next(new Error("Unauthorized"));
            }

            socket.data.userId = decodedToken.user._id;

            next();

        } catch (error) {

            return next(new Error("Socket auth failed"));

        }

    });

    io.on("connection", (socket) => {

        const userId = socket.data.userId;

        if (!userId) {
            return socket.disconnect();
        }

        socket.join(`user:${userId}`);

        console.log("User connected:", userId);

        console.log("Socket rooms:", [...socket.rooms]);

        socket.on("join_shop", (shopId) => {
            if (shopId) {
                socket.join(`shop:${shopId}`);
                console.log(`User ${userId} joined shop:${shopId}`);
            }
        });

        // ── Chat Events ──
        socket.on("chat:rider_to_shop", (data) => {
            if (data.room) {
                socket.to(data.room).emit("chat:from_rider", data);
                console.log(`Chat: rider → shop room ${data.room}`);
            }
        });

        socket.on("chat:rider_to_user", (data) => {
            if (data.room) {
                socket.to(data.room).emit("chat:from_rider", data);
                console.log(`Chat: rider → user room ${data.room}`);
            }
        });

        socket.on("chat:shop_to_rider", (data) => {
            if (data.room) {
                socket.to(data.room).emit("chat:from_shop", data);
                console.log(`Chat: shop → rider room ${data.room}`);
            }
        });

        socket.on("chat:user_to_rider", (data) => {
            if (data.room) {
                socket.to(data.room).emit("chat:from_user", data);
                console.log(`Chat: user → rider room ${data.room}`);
            }
        });

        socket.on("disconnect", () => {

            console.log("User disconnected:", userId);

        });

    });

    return io;

};

export const getIO = () => {

    if (!io) {
        throw new Error("Socket not initialized");
    }

    return io;

};