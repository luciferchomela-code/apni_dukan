import { createContext, useContext ,useEffect,useRef} from 'react'
import {io,socket} from 'socket.io-client'
import { useAppData } from './AppContext';

const SocketContext = createContext();
export const socketProvider = ({ children }) => {
    const {isAuth}= useAppData
    
    useEffect(()=>{
        if(!isAuth) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }
        if(socketRef.current){
            return;
        }
        const socket = io(realtimeService,
            {
                auth:{
                    token:localStorage.getItem("token")
                },
                transports:["websocket"],
                
            }
        );
        socketRef.current = socket;
        socket.on("connect",()=>{
            console.log("Socket connected",socket.id);
        })
        socket.on("disconnect",()=>{
            console.log("Socket disconnected",socket.id);
        })
        socket.on("error",(err)=>{
            console.log("Socket error",err);
        })
        
        return ()=>{
            socket.disconnect();
            socketRef.current = null;
        }
    },[isAuth])
    return (
        <SocketContext.Provider value={{ socket: socketRef.current }}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext);
