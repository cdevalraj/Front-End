import { io } from 'socket.io-client';
import useAuth from './useAuth';

// const URL = 'http://localhost:3001'
const useSocket=()=>
{
    const URL=process.env.NODE_ENV==='production'?process.env.WSURL:'http://localhost:3001';
    const {auth}=useAuth()
    const socket = io(URL, {
        autoConnect: false,
        auth:{
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