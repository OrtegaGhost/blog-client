import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * Gestiona una conexion Socket.io durante el ciclo de vida del componente.
 * Usa polling como transporte inicial y actualiza a WebSocket automaticamente,
 * lo que evita el error de "WebSocket cerrado antes de establecerse" en desarrollo
 * (React StrictMode monta los efectos dos veces en dev).
 *
 * @param {(comment: object) => void} onNewComment - Llamado al recibir 'comment:new'
 * @param {boolean} enabled - Conecta solo cuando es true (requiere autenticacion)
 */
const useSocket = (onNewComment, enabled = true) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('comment:new', (comment) => {
      onNewComment(comment);
    });

    // Desconecta limpiamente al desmontar el componente
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return socketRef.current;
};

export default useSocket;
