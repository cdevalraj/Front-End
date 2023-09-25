import { io } from 'socket.io-client';
import useAuth from './useAuth';

// const URL = 'http://localhost:3001'
const useSocket = () => {
    const URL = (import.meta.env.PROD) ? (import.meta.env.WSURL) ? import.meta.env.WSURL : '' : (import.meta.env.VITE_URL) ? import.meta.env.VITE_URL : '';
    const { auth } = useAuth()
    const socket = io(URL, {
        autoConnect: false,
        auth: {
            "token": `Bearer ${auth.accessToken}`
        },
        transports: ["websocket"]
    });
    socket.on("connect_error", () => {
        // revert to classic upgrade
        socket.io.opts.transports = ["polling", "websocket"];
    });
    return socket;
}

export default useSocket