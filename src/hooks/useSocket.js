import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * Gestiona una conexion Socket.io durante el ciclo de vida del componente.
 * Usa polling como transporte inicial y actualiza a WebSocket automaticamente,
 * lo que evita el error de "WebSocket cerrado antes de establecerse" en desarrollo
 * con React StrictMode.
 *
 * @param {object}   handlers        - Mapa de callbacks para los eventos del servidor
 * @param {Function} handlers.onNew      - comment:new  — nuevo comentario o respuesta
 * @param {Function} handlers.onUpdated  - comment:updated — contenido editado
 * @param {Function} handlers.onDeleted  - comment:deleted — { id, parentId }
 * @param {boolean}  enabled         - Conecta solo cuando es true
 */
const useSocket = (handlers, enabled = true) => {
  const socketRef  = useRef(null);
  const handlersRef = useRef(handlers);

  // Mantiene la referencia actualizada sin reiniciar el efecto
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return;

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('comment:new',     (data) => handlersRef.current.onNew?.(data));
    socketRef.current.on('comment:updated', (data) => handlersRef.current.onUpdated?.(data));
    socketRef.current.on('comment:deleted', (data) => handlersRef.current.onDeleted?.(data));

    // Desconecta limpiamente al desmontar el componente
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return socketRef.current;
};

export default useSocket;
