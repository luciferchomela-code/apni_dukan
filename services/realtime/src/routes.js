import e from "express";
import { getIO } from "./socket.js";

const router = e.Router();

router.get("/emit", (req, res) => {
    if(req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY){
        return res.status(401).json({
            message:"Forbidden"
        })
    }
    const {event ,room,payload} = req.body;
    if(!event || !room){
        return res.status(400).json({
            message:"Missing event or room"
        })
    }
    const io = getIO();
    console.log(`Emitting event ${event} to room ${room}`);
    io.to(room).emit(event,payload??{});
    res.json({
        success:true
    })
});

export default router;

