import { io } from "socket.io-client";

let socket;

const SOCKET_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/" : "https://print-bridge-dx0h.onrender.com");

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
}
