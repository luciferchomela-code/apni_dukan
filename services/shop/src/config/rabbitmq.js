import amqp from "amqplib";

let channel

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL)
        channel = await connection.createChannel()
        await channel.assertQueue(process.env.PAYMENT_QUEUE, {
            durable: true,
        })
        await channel.assertQueue(process.env.RIDER_QUEUE, {
            durable: true,
        })
        if (process.env.ORDER_READY_QUEUE) {
            await channel.assertQueue(process.env.ORDER_READY_QUEUE, {
                durable: true,
            })
        }
        console.log("connected to rabbitmq")
    } catch (error) {
        console.error("Failed to connect to RabbitMQ in Shop service:", error.message);
    }
}

export const getChannel = () => {
    return channel;
}

