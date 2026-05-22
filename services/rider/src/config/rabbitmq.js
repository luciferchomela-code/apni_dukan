import amqp from "amqplib";

let channel;
let connection;

export const connectRabbitMQ = async () => {
    try {
        if (!process.env.RABBITMQ_URL) {
            throw new Error("RABBITMQ_URL is not defined in environment variables");
        }

        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        // Assert queues
        if (process.env.RIDER_QUEUE) {
            await channel.assertQueue(process.env.RIDER_QUEUE, { durable: true });
        }
        
        if (process.env.ORDER_READY_QUEUE) {
            await channel.assertQueue(process.env.ORDER_READY_QUEUE, { durable: true });
        }

        console.log("RabbitMQ Connected Successfully");

        connection.on("error", (err) => {
            console.error("RabbitMQ connection error", err);
        });

        connection.on("close", () => {
            console.warn("RabbitMQ connection closed. Reconnecting might be needed.");
        });

    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error.message);
        // In a production app, you'd might want to exit the process or implement retry logic
    }
};

export const getChannel = () => {
    if (!channel) {
        console.warn("getChannel called before connection established");
    }
    return channel;
};

