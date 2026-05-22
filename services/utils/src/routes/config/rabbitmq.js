import amqp from "amqplib";

let channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        
        connection.on("error", (err) => {
            console.error("RabbitMQ connection error:", err);
            setTimeout(connectRabbitMQ, 5000);
        });

        connection.on("close", () => {
            console.warn("RabbitMQ connection closed. Reconnecting...");
            setTimeout(connectRabbitMQ, 5000);
        });

        channel = await connection.createChannel();
        
        await channel.assertQueue(process.env.PAYMENT_QUEUE, {
            durable: true,
        });
        
        console.log("Connected to RabbitMQ successfully");
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error);
        setTimeout(connectRabbitMQ, 5000);
    }
};

export const getChannel = () => channel;