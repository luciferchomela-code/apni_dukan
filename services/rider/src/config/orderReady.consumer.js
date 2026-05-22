import axios from "axios";
import { getChannel } from "./rabbitmq.js";
import Rider from "../models/rider.js";

import fs from "fs";

export const startOrderReadyConsumer = async () => {
    const channel = getChannel();
    if (!channel) {
        fs.appendFileSync("rider_debug.log", "RabbitMQ channel not available.\n");
        return;
    }
    fs.appendFileSync("rider_debug.log", `Starting consumer: ${process.env.ORDER_READY_QUEUE}\n`);
    
    channel.consume(process.env.ORDER_READY_QUEUE, async (msg) => {
        if (!msg) return;
        try {
            const content = msg.content.toString();
            fs.appendFileSync("rider_debug.log", `\n--- NEW MSG ---\nContent: ${content}\n`);
            const event = JSON.parse(content);
            
            if (event.type !== "ORDER_READY_FOR_RIDER") {
                fs.appendFileSync("rider_debug.log", "Skipping non ORDER_READY_FOR_RIDER\n");
                channel.ack(msg);
                return;
            }

            const { orderId, shopId, location, order } = event.data;
            fs.appendFileSync("rider_debug.log", `Parsed Data: orderId=${orderId}, location=${JSON.stringify(location)}\n`);

            const riders = await Rider.find({
                isAvailable: true,
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: location.coordinates.map(Number)
                        },
                        $maxDistance: 100000, // 100 km
                    }
                }
            });

            fs.appendFileSync("rider_debug.log", `Found ${riders.length} available riders.\n`);
            
            if (riders.length === 0) {
                channel.ack(msg);
                return;
            }

            for (const rider of riders) {
                fs.appendFileSync("rider_debug.log", `Emitting to rider: ${rider.user}\n`);
                try {
                    const res = await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
                        event: "new-delivery",
                        room: `user:${rider.user}`,
                        payload: order || { _id: orderId, shopId },
                    }, {
                        headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY }
                    });
                    fs.appendFileSync("rider_debug.log", `Emit success: status ${res.status}\n`);
                } catch (emitError) {
                    fs.appendFileSync("rider_debug.log", `Emit failed: ${emitError.message}\n`);
                }
            }
            channel.ack(msg);
        } catch (error) {
            fs.appendFileSync("rider_debug.log", `CONSUMER ERROR: ${error.message}\n${error.stack}\n`);
            channel.ack(msg);
        }
    });
};


