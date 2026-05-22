import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAppData } from './AppContext';
import { realtimeService } from '../main';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { isAuth } = useAppData();
    const socketRef = useRef(null);
    const [socketReady, setSocketReady] = useState(false);

    useEffect(() => {
        if (!isAuth) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setSocketReady(false);
            return;
        }
        if (socketRef.current) {
            return;
        }
        const socket = io(realtimeService, {
            auth: {
                token: localStorage.getItem("token")
            },
            transports: ["websocket"],
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Socket connected", socket.id);
            setSocketReady(true);
        });
        socket.on("disconnect", () => {
            console.log("Socket disconnected");
            setSocketReady(false);
        });
        socket.on("error", (err) => {
            console.log("Socket error", err);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setSocketReady(false);
        }
    }, [isAuth]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, socketReady }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
