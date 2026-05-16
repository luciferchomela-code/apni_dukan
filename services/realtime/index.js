import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { initSocket } from "./src/socket.js";
import internalRoute from "./src/routes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

initSocket(server);
app.use("/api/v1/internal",internalRoute);
const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
    console.log(`Realtime service running on port ${PORT}`);
});