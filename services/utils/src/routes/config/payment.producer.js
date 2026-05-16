import { getChannel } from "./rabbitmq.js";

export const publishPaymentSuccess = async (payload, orderId, paymentId, provider) => {
    const channel = getChannel();

    if (!channel) {
        console.error("RabbitMQ channel not initialized");
        return;
    }
    const message = {
        type: 'PAYMENT_SUCCESS',
        orderId,
        paymentId,
        provider,
        data: payload,
    };

    const buffer = Buffer.from(JSON.stringify(message));

    channel.sendToQueue(process.env.PAYMENT_QUEUE, buffer, {
        persistent: true
    });

    console.log(`Payment success event published for Order: ${orderId}`);
};