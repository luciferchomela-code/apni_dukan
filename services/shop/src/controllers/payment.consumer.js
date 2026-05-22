import { getChannel } from "../config/rabbitmq.js";
import Order from "../models/order.js";
import Cart from "../models/cart.model.js";
import axios from "axios";

export const startPaymentConsumer = async() => {

    const channel = getChannel();

    if(!channel){
        console.log("RabbitMQ channel not initialized");
        return;
    }

    channel.consume(process.env.PAYMENT_QUEUE, async(msg) => {

        if(!msg){
            return;
        }

        try {

            const event = JSON.parse(msg.content.toString());

            if(event.type === "PAYMENT_SUCCESS"){

                const { orderId, paymentId } = event;

                const order = await Order.findOneAndUpdate(
                    {
                        _id:orderId,
                        paymentStatus:{ $ne:"paid" }
                    },
                    {
                        $set:{
                            paymentStatus:"paid",
                            status:"placed",
                            paymentId,
                        },
                        $unset:{
                            expiresAt:1
                        }
                    },
                    {
                        new:true
                    }
                );

                if(!order){
                    channel.ack(msg);
                    return;
                }

                console.log(
                    "😁 Payment for order",
                    orderId,
                    "processed successfully"
                );

                await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,{
                    event:"order:new",
                    payload:{
                        orderId:order._id.toString(),
                    },
                    rooms:[`shop:${order.shopId}`]
                },{
                    headers:{
                        "x-internal-key":process.env.INTERNAL_SERVICE_KEY,
                    },
                });
                // Clear cart after successful payment
                await Cart.deleteMany({ userId: order.userId });

                channel.ack(msg);
                return;
            }

            channel.ack(msg);

        } catch (error) {

            console.log(error);

            channel.nack(msg);
        }
    });
};