import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { HostMessage, PlayerMessage } from '../types';

export function useHostPeer(roomId: string) {
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const [connectedPlayers, setConnectedPlayers] = useState<Map<string, string>>(new Map());
  const [peerReady, setPeerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const peerId = `music-lotto-host-${roomId}`;
    const peer = new Peer(peerId, { debug: 1 });

    peer.on('open', () => { setPeerReady(true); });

    peer.on('connection', (conn) => {
      connectionsRef.current.set(conn.peer, conn);
      conn.on('open', () => {});
      conn.on('data', (data: unknown) => {
        const msg = data as PlayerMessage;
        if (msg.type === 'join') {
          setConnectedPlayers(prev => {
            const next = new Map(prev);
            next.set(conn.peer, msg.payload.playerName);
            return next;
          });
        }
      });
      conn.on('close', () => {
        connectionsRef.current.delete(conn.peer);
        setConnectedPlayers(prev => { const next = new Map(prev); next.delete(conn.peer); return next; });
      });
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') setError('Комната уже существует.');
    });

    peerRef.current = peer;
    return () => { peer.destroy(); };
  }, [roomId]);

  const broadcast = useCallback((msg: HostMessage) => {
    connectionsRef.current.forEach((conn) => { if (conn.open) conn.send(msg); });
  }, []);

  return { peerReady, connectedPlayers, broadcast, error };
}

export function usePlayerPeer(roomId: string, playerName: string, onMessage: (msg: HostMessage) => void) {
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const peerId = `music-lotto-player-${roomId}-${Date.now()}`;
    const peer = new Peer(peerId, { debug: 1 });

    peer.on('open', () => {
      const hostId = `music-lotto-host-${roomId}`;
      const conn = peer.connect(hostId, { reliable: true });
      connRef.current = conn;

      conn.on('open', () => {
        setConnected(true);
        conn.send({ type: 'join', payload: { playerName } } as any);
      });

      conn.on('data', (data: unknown) => { onMessage(data as HostMessage); });
      conn.on('close', () => { setConnected(false); setError('Соединение потеряно'); });
    });

    peer.on('error', (err) => {
      if (err.type === 'peer-unavailable') setError('Комната не найдена');
      else setError('Ошибка подключения');
    });

    peerRef.current = peer;
    return () => { peer.destroy(); };
  }, [roomId, playerName]);

  const send = useCallback((msg: any) => {
    if (connRef.current && connRef.current.open) connRef.current.send(msg);
  }, []);

  return { connected, error, send };
}
