import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * Manages a Socket.io connection for the duration of the component's lifecycle.
 * @param {(comment: object) => void} onNewComment - called when comment:new is received
 * @param {boolean} enabled - connect only when true (e.g. when authenticated)
 */
const useSocket = (onNewComment, enabled = true) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });

    socketRef.current.on('comment:new', (comment) => {
      onNewComment(comment);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return socketRef.current;
};

export default useSocket;
