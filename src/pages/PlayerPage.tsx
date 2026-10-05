import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Wifi, WifiOff, Trophy, Disc3, Check } from 'lucide-react';
import { Track, LottoCard, HostMessage } from '../types';
import { usePlayerPeer } from '../hooks/usePeer';
import LottoCardComponent from '../components/LottoCard';

export default function PlayerPage() {
  const { roomId, playerName: encodedName } = useParams<{ roomId: string; playerName: string }>();
  const playerName = decodeURIComponent(encodedName || '') || 'Игрок';
  
  const [card, setCard] = useState<LottoCard | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackInfo, setCurrentTrackInfo] = useState<{ name: string; artist: string } | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [markedCount, setMarkedCount] = useState(0);
  
  const handleMessage = useCallback((msg: HostMessage) => {
    switch (msg.type) {
      case 'gameStart':
        setTracks(msg.payload.tracks);
        // Find our card
        const myCard = msg.payload.cards.find((c: LottoCard) => c.playerName === playerName);
        if (myCard) {
          setCard(myCard);
        }
        setGameStarted(true);
        break;
        
      case 'playTrack':
      case 'nextTrack':
        setCurrentTrackInfo({
          name: msg.payload.trackName,
          artist: msg.payload.artist,
        });
        break;
        
      case 'stopTrack':
        // Keep showing current track info
        break;
        
      case 'reset':
        setCard(null);
        setTracks([]);
        setCurrentTrackInfo(null);
        setGameStarted(false);
        setWinner(null);
        setMarkedCount(0);
        break;
    }
  }, [playerName]);

  const { connected, error, send } = usePlayerPeer(roomId || '', playerName, handleMessage);

  const handleCellClick = (trackId: string) => {
    if (!card) return;
    
    const cell = card.cells.find(c => c.trackId === trackId);
    if (!cell || cell.marked) return;
    
    const newCells = card.cells.map(c => 
      c.trackId === trackId ? { ...c, marked: true } : c
    );
    
    const newCard = { ...card, cells: newCells };
    const allMarked = newCells.every(c => c.marked);
    
    if (allMarked) {
      newCard.completed = true;
      setWinner(playerName);
    }
    
    setCard(newCard);
    setMarkedCount(newCells.filter(c => c.marked).length);
    
    send({ type: 'mark', payload: { cardId: card.id, trackId } });
    
    if (allMarked) {
      send({ type: 'bingo', payload: { cardId: card.id } });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-red-500/30 max-w-sm w-full"
        >
          <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Ошибка подключения</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <p className="text-white/50 text-sm">Проверьте код комнаты и убедитесь, что хост создал игру.</p>
        </motion.div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Disc3 className="w-16 h-16 text-purple-400" />
          </motion.div>
          <h2 className="text-white text-2xl font-bold mb-2">Подключение...</h2>
          <p className="text-white/60">Комната: <span className="font-mono text-purple-300">{roomId}</span></p>
          <p className="text-white/60">Игрок: <span className="text-purple-300">{playerName}</span></p>
        </motion.div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm w-full"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <Wifi className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Вы подключены!</h2>
            <p className="text-white/60 mb-4">
              Привет, <span className="text-purple-300 font-semibold">{playerName}</span>!
            </p>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/50 text-sm">Ожидание начала игры...</p>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-2"
              >
                <p className="text-purple-300">⏳ Хост готовится</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {playerName[0].toUpperCase()}
          </div>
          <span className="text-white font-semibold">{playerName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-sm">{markedCount}/15</span>
          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(markedCount / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Track Info */}
      <AnimatePresence mode="wait">
        {currentTrackInfo && (
          <motion.div
            key={currentTrackInfo.name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-4"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Disc3 className="w-10 h-10 text-purple-400" />
              </motion.div>
              <div>
                <p className="text-white font-semibold">{currentTrackInfo.name}</p>
                <p className="text-white/50 text-sm">{currentTrackInfo.artist}</p>
              </div>
            </div>
            <p className="text-white/40 text-xs mt-2 text-center">Найдите этот трек в карточке и нажмите на него!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30 text-center mb-4"
          >
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
            <h2 className="text-yellow-300 text-xl font-bold">ЛОТО!</h2>
            <p className="text-white">Поздравляем! 🎉</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lotto Card */}
      {card && (
        <LottoCardComponent
          card={card}
          tracks={tracks}
          onCellClick={handleCellClick}
        />
      )}

      {/* Instructions */}
      {!currentTrackInfo && (
        <div className="mt-6 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center">
          <Music className="w-8 h-8 text-white/30 mx-auto mb-2" />
          <p className="text-white/50 text-sm">Ожидание следующего трека...</p>
        </div>
      )}
    </div>
  );
}
