import e from "express";
import { getIO } from "./socket.js";

const router = e.Router();

router.post("/emit", (req, res) => {
    if(req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY){
        return res.status(401).json({
            message:"Forbidden"
        })
    }
    const {event ,room, rooms, payload} = req.body;
    const targetRooms = rooms || (room ? [room] : []);
    if(!event || targetRooms.length === 0){
        return res.status(400).json({
            message:"Missing event or room"
        })
    }
    const io = getIO();
    console.log(`Emitting event ${event} to rooms ${targetRooms.join(', ')}`);
    io.to(targetRooms).emit(event,payload??{});
    res.json({
        success:true
    })
});

export default router;

