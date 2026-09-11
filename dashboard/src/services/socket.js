import { io } from "socket.io-client";

const SOCKET_URL = "http://10.196.164.205:3000";

export const socket = io(SOCKET_URL, {
    transports: ["websocket"],
});

export default socket;