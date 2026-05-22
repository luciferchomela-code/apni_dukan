import {getChannel } from "./rabbitmq.js";

const publishEvent = async(type,data)=>{
    const channel = getChannel();
    
    if (!channel) {
        console.warn("RabbitMQ channel not available. Skipping event publication:", type);
        return;
    }
    
    channel.sendToQueue(
        process.env.ORDER_READY_QUEUE,
        Buffer.from(
            JSON.stringify({
                type,
                data
            })
        ),
        {
            persistent: true,
        },
    );
}

export default publishEvent;