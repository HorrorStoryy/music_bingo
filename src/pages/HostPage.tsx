import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Upload, Play, Pause, SkipForward, RotateCcw, Users, Music, 
  Copy, Check, Trash2, Plus, Volume2, Disc3, Image, QrCode
} from 'lucide-react';
import { Track, LottoCard, GameState } from '../types';
import { useHostPeer } from '../hooks/usePeer';
import { generateLottoCard, generateShuffleOrder, getTrackById } from '../utils/gameUtils';
import LottoCardComponent from '../components/LottoCard';
import { v4 as uuidv4 } from 'uuid';

export default function HostPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cards, setCards] = useState<LottoCard[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'waiting' | 'playing' | 'finished'>('setup');
  const [winner, setWinner] = useState<string | null>(null);
  const [shuffleOrder, setShuffleOrder] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { peerReady, connectedPlayers, broadcast, error } = useHostPeer(roomId || '');

  const currentTrack = currentTrackIndex >= 0 ? getTrackById(tracks, shuffleOrder[currentTrackIndex]) : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const track: Track = {
        id: uuidv4(),
        name: trackName || file.name.replace(/\.[^/.]+$/, ''),
        artist: trackArtist || 'Неизвестный исполнитель',
        fileUrl: url,
        fileName: file.name,
      };
      setTracks(prev => [...prev, track]);
    });
    
    setTrackName('');
    setTrackArtist('');
    setShowAddForm(false);
  };

  const removeTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
  };

  const startGame = useCallback(() => {
    if (tracks.length < 2) return;
    
    const order = generateShuffleOrder(tracks);
    setShuffleOrder(order);
    setCurrentTrackIndex(-1);
    setIsPlaying(false);
    setPhase('waiting');
    setWinner(null);
    
    // Generate cards for connected players
    const newCards: LottoCard[] = [];
    connectedPlayers.forEach((name, peerId) => {
      const card = generateLottoCard(tracks, name);
      newCards.push(card);
    });
    
    // If no players connected, create demo cards
    if (newCards.length === 0) {
      for (let i = 1; i <= Math.min(4, Math.ceil(tracks.length / 3)); i++) {
        newCards.push(generateLottoCard(tracks, `Игрок ${i}`));
      }
    }
    
    setCards(newCards);
    broadcast({ type: 'gameStart', payload: { cards: newCards, tracks } });
  }, [tracks, connectedPlayers, broadcast]);

  const playCurrentTrack = () => {
    if (!currentTrack || !audioRef.current) return;
    
    audioRef.current.play();
    setIsPlaying(true);
    broadcast({ type: 'playTrack', payload: { trackId: currentTrack.id, trackName: currentTrack.name, artist: currentTrack.artist } });
  };

  const pauseTrack = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    broadcast({ type: 'stopTrack', payload: {} });
  };

  const nextTrack = () => {
    if (currentTrackIndex < shuffleOrder.length - 1) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(newIndex);
      setIsPlaying(false);
      
      const nextTrackData = getTrackById(tracks, shuffleOrder[newIndex]);
      broadcast({ type: 'nextTrack', payload: { trackIndex: newIndex, trackId: shuffleOrder[newIndex], trackName: nextTrackData?.name, artist: nextTrackData?.artist } });
    }
  };

  const prevTrack = () => {
    if (currentTrackIndex > 0) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newIndex = currentTrackIndex - 1;
      setCurrentTrackIndex(newIndex);
      setIsPlaying(false);
    }
  };

  const resetGame = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPhase('setup');
    setCurrentTrackIndex(-1);
    setIsPlaying(false);
    setCards([]);
    setWinner(null);
    setShuffleOrder([]);
    broadcast({ type: 'reset', payload: {} });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.fileUrl;
    }
  }, [currentTrackIndex]);

  const handlePlayerMark = useCallback((data: any) => {
    if (data.type === 'mark') {
      setCards(prev => prev.map(card => {
        if (card.id === data.payload.cardId) {
          const newCells = card.cells.map(cell => 
            cell.trackId === data.payload.trackId ? { ...cell, marked: true } : cell
          );
          const newCard = { ...card, cells: newCells };
          
          // Check bingo
          if (newCells.every(c => c.marked)) {
            newCard.completed = true;
            setWinner(card.playerName);
            setPhase('finished');
          }
          
          return newCard;
        }
        return card;
      }));
    }
  }, []);

  // Listen for player messages
  useEffect(() => {
    // This is handled via the peer hook's broadcast
  }, [handlePlayerMark]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-red-500/30">
          <h2 className="text-white text-2xl font-bold mb-2">Ошибка</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="bg-white/20 text-white px-6 py-2 rounded-xl">
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Disc3 className={`w-8 h-8 text-purple-400 ${isPlaying ? 'animate-spin' : ''}`} />
            <div>
              <h1 className="text-white font-bold text-lg">Музыкальное Лото</h1>
              <p className="text-white/50 text-sm">Комната: <span className="font-mono text-purple-300">{roomId}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span className="font-mono">{roomId}</span>
            </button>
            
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl">
              <Users className="w-4 h-4" />
              <span>{connectedPlayers.size}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Track Management */}
        <div className="lg:col-span-1 space-y-4">
          {/* Connection Status */}
          <div className={`p-3 rounded-xl border ${peerReady ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
            <p className={`text-sm ${peerReady ? 'text-green-300' : 'text-yellow-300'}`}>
              {peerReady ? '✅ Сервер готов. Игроки могут подключаться!' : '⏳ Подключение к серверу...'}
            </p>
          </div>

          {/* Track Upload */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Треки ({tracks.length})
            </h2>
            
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-purple-600/30 border border-purple-500/30 text-purple-300 py-3 rounded-xl hover:bg-purple-600/50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Добавить трек
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  placeholder="Название трека"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400"
                />
                <input
                  type="text"
                  value={trackArtist}
                  onChange={(e) => setTrackArtist(e.target.value)}
                  placeholder="Исполнитель"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-green-600/30 border border-green-500/30 text-green-300 py-2 rounded-lg text-sm hover:bg-green-600/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    Выбрать файлы
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="bg-white/10 text-white/70 px-3 py-2 rounded-lg text-sm hover:bg-white/20"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Track List */}
            {tracks.length > 0 && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 group">
                    <span className="text-white/40 text-xs w-6">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{track.name}</p>
                      <p className="text-white/50 text-xs truncate">{track.artist}</p>
                    </div>
                    <button
                      onClick={() => removeTrack(track.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connected Players */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Игроки ({connectedPlayers.size})
            </h2>
            {connectedPlayers.size === 0 ? (
              <p className="text-white/40 text-sm">Пока никто не подключился...</p>
            ) : (
              <div className="space-y-2">
                {Array.from(connectedPlayers.values()).map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {name[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Game Control */}
        <div className="lg:col-span-2 space-y-4">
          {phase === 'setup' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
                <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-white text-2xl font-bold mb-2">Подготовка к игре</h2>
                <p className="text-white/60 mb-6">
                  Загрузите треки и дождитесь подключения игроков
                </p>
                
                <div className="bg-white/5 rounded-xl p-4 mb-6 inline-block">
                  <p className="text-white/50 text-sm mb-1">Код комнаты для игроков:</p>
                  <p className="text-3xl font-mono font-bold text-purple-300">{roomId}</p>
                  <div className="mt-3 bg-white rounded-lg p-3 inline-block">
                    <QRCodeSVG 
                      value={`${window.location.origin}/player/${roomId}/Игрок`}
                      size={120}
                      level="M"
                    />
                  </div>
                  <p className="text-white/40 text-xs mt-2">Отсканируйте QR-код для подключения</p>
                </div>

                <div>
                  <button
                    onClick={startGame}
                    disabled={tracks.length < 2}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    🎮 Начать игру
                  </button>
                  {tracks.length < 2 && (
                    <p className="text-yellow-400/70 text-sm mt-2">Нужно минимум 2 трека</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {(phase === 'waiting' || phase === 'playing' || phase === 'finished') && (
            <div className="space-y-4">
              {/* Now Playing */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                {currentTrack ? (
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${isPlaying ? 'bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}>
                      <Disc3 className={`w-12 h-12 text-white ${isPlaying ? 'animate-spin' : ''}`} />
                    </div>
                    <h2 className="text-white text-2xl font-bold">{currentTrack.name}</h2>
                    <p className="text-white/60 text-lg">{currentTrack.artist}</p>
                    
                    <audio
                      ref={audioRef}
                      onEnded={() => { setIsPlaying(false); }}
                    />
                    
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <button
                        onClick={prevTrack}
                        disabled={currentTrackIndex <= 0}
                        className="bg-white/10 border border-white/20 text-white p-3 rounded-full hover:bg-white/20 disabled:opacity-30 transition-all"
                      >
                        <SkipForward className="w-5 h-5 rotate-180" />
                      </button>
                      
                      <button
                        onClick={isPlaying ? pauseTrack : playCurrentTrack}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all"
                      >
                        {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                      </button>
                      
                      <button
                        onClick={nextTrack}
                        disabled={currentTrackIndex >= shuffleOrder.length - 1}
                        className="bg-white/10 border border-white/20 text-white p-3 rounded-full hover:bg-white/20 disabled:opacity-30 transition-all"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-white/40 text-sm mt-3">
                      Трек {currentTrackIndex + 1} из {shuffleOrder.length}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60 text-lg mb-4">Нажмите "Далее" чтобы начать</p>
                    <button
                      onClick={nextTrack}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-8 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all"
                    >
                      ▶️ Начать воспроизведение
                    </button>
                  </div>
                )}
              </div>

              {/* Winner Banner */}
              <AnimatePresence>
                {winner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30 text-center"
                  >
                    <p className="text-4xl mb-2">🎉🏆🎉</p>
                    <h2 className="text-yellow-300 text-2xl font-bold">ПОБЕДА!</h2>
                    <p className="text-white text-xl">{winner}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map(card => (
                  <LottoCardComponent
                    key={card.id}
                    card={card}
                    tracks={tracks}
                    isHost={connectedPlayers.size > 0}
                    revealedTrackIds={currentTrack ? new Set([currentTrack.id]) : new Set()}
                    onCellClick={connectedPlayers.size === 0 ? (trackId) => {
                      // Demo mode - host can mark cells
                      setCards(prev => prev.map(c => {
                        if (c.id === card.id) {
                          const newCells = c.cells.map(cell => 
                            cell.trackId === trackId ? { ...cell, marked: !cell.marked } : cell
                          );
                          const newCard = { ...c, cells: newCells };
                          if (newCells.every(cell => cell.marked)) {
                            newCard.completed = true;
                            setWinner(c.playerName);
                            setPhase('finished');
                          }
                          return newCard;
                        }
                        return c;
                      }));
                    } : undefined}
                  />
                ))}
              </div>
              
              {connectedPlayers.size === 0 && (
                <p className="text-center text-white/40 text-sm">
                  💡 Демо-режим: кликайте на ячейки чтобы отмечать треки
                </p>
              )}

              {/* Reset */}
              <div className="text-center">
                <button
                  onClick={resetGame}
                  className="bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Новая игра
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
