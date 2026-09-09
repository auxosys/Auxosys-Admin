import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5002';

/**
 * useMailSocket(mailboxId, onNewMail)
 *
 * Connects once, and re-joins the correct "room" whenever the viewed
 * mailbox changes, so new-mail pushes only arrive for the inbox
 * currently open. Returns a `connected` boolean for a small status dot.
 *
 * Gracefully handles cases where the backend socket server is unavailable
 * — it limits reconnection attempts and suppresses console spam.
 */
export function useMailSocket(mailboxId, onNewMail) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 8000,
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => {
      // silently handle — socket server may not be running or connecting
      setConnected(false);
    });

    return () => {
      try {
        if (socket.connected) {
          socket.disconnect();
        } else {
          socket.close();
        }
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !mailboxId) return;

    socket.emit('watch-mailbox', mailboxId);

    const handler = (payload) => {
      if (payload.mailboxId === mailboxId) onNewMail?.(payload.messages);
    };
    socket.on('new-mail', handler);

    return () => {
      socket.emit('unwatch-mailbox', mailboxId);
      socket.off('new-mail', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mailboxId]);

  return { connected };
}
