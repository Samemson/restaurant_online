import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "/socket.io";

const useRealtime = (eventName, handler, opts = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!handler) return undefined;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"],
        autoConnect: true,
      });
    }
    const socket = socketRef.current;

    if (opts.joinRoom) {
      socket.emit(opts.joinRoom.event, opts.joinRoom.payload);
    }

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
      if (opts.leaveRoom) {
        socket.emit(opts.leaveRoom.event, opts.leaveRoom.payload);
      }
    };
  }, [eventName, handler, opts.joinRoom, opts.leaveRoom]);
};

export default useRealtime;

