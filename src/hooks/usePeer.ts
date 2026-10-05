import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { HostMessage, PlayerMessage, GameState, LottoCard } from '../types';

export function useHostPeer(roomId: string) {
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const [connectedPlayers, setConnectedPlayers] = useState<Map<string, string>>(new Map());
  const [peerReady, setPeerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const peerId = `music-lotto-host-${roomId}`;
    const peer = new Peer(peerId, {
      debug: 1,
    });

    peer.on('open', (id) => {
      console.log('Host peer ready:', id);
      setPeerReady(true);
    });

    peer.on('connection', (conn) => {
      console.log('Player connected:', conn.peer);
      connectionsRef.current.set(conn.peer, conn);

      conn.on('open', () => {
        console.log('Connection open with:', conn.peer);
      });

      conn.on('data', (data: unknown) => {
        handlePlayerMessage(conn.peer, data as PlayerMessage);
      });

      conn.on('close', () => {
        console.log('Player disconnected:', conn.peer);
        connectionsRef.current.delete(conn.peer);
        setConnectedPlayers(prev => {
          const next = new Map(prev);
          next.delete(conn.peer);
          return next;
        });
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (err.type === 'unavailable-id') {
        setError('Комната с таким кодом уже существует. Попробуйте другой код.');
      }
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, [roomId]);

  const handlePlayerMessage = useCallback((peerId: string, msg: PlayerMessage) => {
    if (msg.type === 'join') {
      setConnectedPlayers(prev => {
        const next = new Map(prev);
        next.set(peerId, msg.payload.playerName);
        return next;
      });
    }
  }, []);

  const broadcast = useCallback((msg: HostMessage) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }, []);

  const sendTo = useCallback((peerId: string, msg: HostMessage) => {
    const conn = connectionsRef.current.get(peerId);
    if (conn && conn.open) {
      conn.send(msg);
    }
  }, []);

  return { peerReady, connectedPlayers, broadcast, sendTo, error };
}

export function usePlayerPeer(roomId: string, playerName: string, onMessage: (msg: HostMessage) => void) {
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const peerId = `music-lotto-player-${roomId}-${Date.now()}`;
    const peer = new Peer(peerId, {
      debug: 1,
    });

    peer.on('open', () => {
      const hostId = `music-lotto-host-${roomId}`;
      const conn = peer.connect(hostId, { reliable: true });
      connRef.current = conn;

      conn.on('open', () => {
        console.log('Connected to host');
        setConnected(true);
        conn.send({ type: 'join', payload: { playerName } } as PlayerMessage);
      });

      conn.on('data', (data: unknown) => {
        onMessage(data as HostMessage);
      });

      conn.on('close', () => {
        setConnected(false);
        setError('Соединение с хостом потеряно');
      });

      conn.on('error', (err) => {
        console.error('Connection error:', err);
        setError('Ошибка соединения');
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (err.type === 'peer-unavailable') {
        setError('Комната не найдена. Проверьте код.');
      } else {
        setError('Ошибка подключения: ' + err.message);
      }
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, [roomId, playerName]);

  const send = useCallback((msg: PlayerMessage) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(msg);
    }
  }, []);

  return { connected, error, send };
}
