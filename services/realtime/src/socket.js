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