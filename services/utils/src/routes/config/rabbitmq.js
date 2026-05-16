import amqp from "amqplib";

let channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        
        await channel.assertQueue(process.env.PAYMENT_QUEUE, {
            durable: true,
        });
        
        console.log("Connected to RabbitMQ successfully");
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error);
    }
};

export const getChannel = () => channel;