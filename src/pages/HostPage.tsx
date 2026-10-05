import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Upload, Play, Pause, SkipForward, RotateCcw, Users, Music, 
  Copy, Check, Trash2, Disc3, ArrowLeft, LogOut, Video, Film, Eye, EyeOff
} from 'lucide-react';
import { Track, LottoCard, Playlist } from '../types';
import { useHostPeer } from '../hooks/usePeer';
import { generateLottoCard, generateShuffleOrder, getTrackById } from '../utils/gameUtils';
import LottoCardComponent from '../components/LottoCard';
import { useAuth } from '../contexts/AuthContext';
import { getPlaylistById } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

export default function HostPage() {
  const { roomId, playlistId } = useParams<{ roomId: string; playlistId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cards, setCards] = useState<LottoCard[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'waiting' | 'playing' | 'finished'>('setup');
  const [winner, setWinner] = useState<string | null>(null);
  const [shuffleOrder, setShuffleOrder] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showTrackInfo, setShowTrackInfo] = useState(false); // Показывать ли название трека на экране
  const [currentTrackType, setCurrentTrackType] = useState<'audio' | 'video'>('audio');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { peerReady, connectedPlayers, broadcast } = useHostPeer(roomId || '');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (playlistId) {
      const pl = getPlaylistById(playlistId);
      if (pl) {
        setPlaylist(pl);
        setTracks(pl.tracks);
      }
    }
  }, [playlistId, user]);

  const currentTrack = currentTrackIndex >= 0 ? getTrackById(tracks, shuffleOrder[currentTrackIndex]) : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      const track: Track = {
        id: uuidv4(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Неизвестный исполнитель',
        fileUrl: url,
        fileName: file.name,
      };
      setTracks(prev => [...prev, track]);
    });
  };

  const updateTrackFile = (trackId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, fileUrl: url, fileName: file.name } : t
    ));
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
    setShowTrackInfo(false);
    
    const newCards: LottoCard[] = [];
    connectedPlayers.forEach((name) => {
      const card = generateLottoCard(tracks, name);
      newCards.push(card);
    });
    
    if (newCards.length === 0) {
      for (let i = 1; i <= Math.min(4, Math.ceil(tracks.length / 3)); i++) {
        newCards.push(generateLottoCard(tracks, `Игрок ${i}`));
      }
    }
    
    setCards(newCards);
    // Отправляем игрокам только ID треков, НЕ названия!
    broadcast({ type: 'gameStart', payload: { cards: newCards, tracks: tracks.map(t => ({ id: t.id, name: t.name, artist: t.artist })) } });
  }, [tracks, connectedPlayers, broadcast]);

  const playCurrentTrack = () => {
    if (!currentTrack) return;
    if (!currentTrack.fileUrl) {
      alert('Для этого трека не загружен файл (аудио или видео)');
      return;
    }

    // Определяем тип файла
    const isVideo = currentTrack.fileUrl.includes('video') || 
                    currentTrack.fileName?.match(/\.(mp4|webm|mov|avi|mkv)$/i);
    
    if (isVideo) {
      setCurrentTrackType('video');
      if (videoRef.current) {
        videoRef.current.src = currentTrack.fileUrl;
        videoRef.current.play();
      }
    } else {
      setCurrentTrackType('audio');
      if (audioRef.current) {
        audioRef.current.src = currentTrack.fileUrl;
        audioRef.current.play();
      }
    }
    
    setIsPlaying(true);
    // ВАЖНО: НЕ отправляем название трека игрокам!
    broadcast({ type: 'playTrack', payload: { trackId: currentTrack.id, trackIndex: currentTrackIndex } });
  };

  const pauseTrack = () => {
    if (currentTrackType === 'video' && videoRef.current) {
      videoRef.current.pause();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    broadcast({ type: 'stopTrack', payload: {} });
  };

  const nextTrack = () => {
    if (currentTrackIndex < shuffleOrder.length - 1) {
      if (audioRef.current) audioRef.current.pause();
      if (videoRef.current) videoRef.current.pause();
      
      const newIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(newIndex);
      setIsPlaying(false);
      setShowTrackInfo(false);
      
      broadcast({ type: 'nextTrack', payload: { trackIndex: newIndex, trackId: shuffleOrder[newIndex] } });
    }
  };

  const prevTrack = () => {
    if (currentTrackIndex > 0) {
      if (audioRef.current) audioRef.current.pause();
      if (videoRef.current) videoRef.current.pause();
      
      const newIndex = currentTrackIndex - 1;
      setCurrentTrackIndex(newIndex);
      setIsPlaying(false);
      setShowTrackInfo(false);
    }
  };

  const revealTrack = () => {
    if (!currentTrack) return;
    setShowTrackInfo(true);
    broadcast({ type: 'revealTrack', payload: { trackName: currentTrack.name, artist: currentTrack.artist } });
  };

  const resetGame = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (videoRef.current) { videoRef.current.pause(); videoRef.current = null; }
    setPhase('setup');
    setCurrentTrackIndex(-1);
    setIsPlaying(false);
    setCards([]);
    setWinner(null);
    setShuffleOrder([]);
    setShowTrackInfo(false);
    broadcast({ type: 'reset', payload: {} });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Disc3 className={`w-8 h-8 text-purple-400 ${isPlaying ? 'animate-spin' : ''}`} />
            <div>
              <h1 className="text-white font-bold text-lg">{playlist?.name || 'Игра'}</h1>
              <p className="text-white/50 text-sm">Код: <span className="font-mono text-purple-300">{roomId}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={copyRoomCode} className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span className="font-mono">{roomId}</span>
            </button>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl">
              <Users className="w-4 h-4" />
              <span>{connectedPlayers.size}</span>
            </div>
            <button onClick={handleLogout} className="bg-white/10 border border-white/20 text-white p-2 rounded-xl hover:bg-white/20 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`p-3 rounded-xl border ${peerReady ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
            <p className={`text-sm ${peerReady ? 'text-green-300' : 'text-yellow-300'}`}>
              {peerReady ? '✅ Сервер готов. Игроки могут подключаться!' : '⏳ Подключение к серверу...'}
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-white/50 text-sm mb-2">QR-код для подключения:</p>
            <div className="bg-white rounded-lg p-3 inline-block">
              <QRCodeSVG value={`${window.location.origin}/player/${roomId}/${encodeURIComponent(user.displayName)}`} size={150} level="M" />
            </div>
          </div>

          {/* Track Upload */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Треки ({tracks.length})
            </h2>
            
            <input ref={fileInputRef} type="file" accept="audio/*,video/*" multiple onChange={handleFileUpload} className="hidden" />
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'audio/*';
                    fileInputRef.current.click();
                  }
                }}
                className="bg-purple-600/30 border border-purple-500/30 text-purple-300 py-2 rounded-xl hover:bg-purple-600/50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Music className="w-4 h-4" />
                Аудио
              </button>
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'video/*';
                    fileInputRef.current.click();
                  }
                }}
                className="bg-pink-600/30 border border-pink-500/30 text-pink-300 py-2 rounded-xl hover:bg-pink-600/50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Video className="w-4 h-4" />
                Видео
              </button>
            </div>

            {tracks.length > 0 && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 group">
                    <span className="text-white/40 text-xs w-6">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{track.name}</p>
                      <p className="text-white/50 text-xs truncate">{track.artist}</p>
                      {track.fileUrl && (
                        <span className={`text-xs ${track.fileName?.match(/\.(mp4|webm|mov)$/i) ? 'text-pink-400' : 'text-green-400'}`}>
                          {track.fileName?.match(/\.(mp4|webm|mov)$/i) ? '🎬 Видео' : '🎵 Аудио'} загружено
                        </span>
                      )}
                    </div>
                    {!track.fileUrl && (
                      <label className="cursor-pointer text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-blue-500/20 rounded">
                        +файл
                        <input type="file" accept="audio/*,video/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateTrackFile(track.id, file);
                        }} />
                      </label>
                    )}
                    <button onClick={() => removeTrack(track.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">
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

        {/* Center Panel */}
        <div className="lg:col-span-2 space-y-4">
          {phase === 'setup' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
                <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-white text-2xl font-bold mb-2">{playlist?.name}</h2>
                <p className="text-white/60 mb-4">{playlist?.description}</p>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 text-left">
                  <p className="text-yellow-300 font-semibold mb-2">📌 Как загрузить клипы:</p>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>• Нажмите кнопку <span className="text-pink-400">«Видео»</span> для загрузки клипов</li>
                    <li>• Поддерживаются форматы: MP4, WebM, MOV</li>
                    <li>• Для каждого трека можно загрузить свой клип</li>
                    <li>• При воспроизведении клип покажется на экране</li>
                  </ul>
                </div>

                <button
                  onClick={startGame}
                  disabled={tracks.length < 2}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  🎮 Начать игру
                </button>
                {tracks.length < 2 && <p className="text-yellow-400/70 text-sm mt-2">Нужно минимум 2 трека</p>}
              </div>
            </motion.div>
          )}

          {(phase === 'waiting' || phase === 'playing' || phase === 'finished') && (
            <div className="space-y-4">
              {/* Now Playing — БЕЗ НАЗВАНИЯ! */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                {currentTrack ? (
                  <div className="text-center">
                    {/* Видео-плеер (если клип) */}
                    {currentTrackType === 'video' && (
                      <div className="mb-4 rounded-xl overflow-hidden bg-black">
                        <video
                          ref={videoRef}
                          className="w-full max-h-80 mx-auto"
                          onEnded={() => setIsPlaying(false)}
                        />
                      </div>
                    )}

                    {/* Анимация диска — если аудио */}
                    {currentTrackType === 'audio' && (
                      <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${isPlaying ? 'bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}>
                        <Disc3 className={`w-16 h-16 text-white ${isPlaying ? 'animate-spin' : ''}`} />
                      </div>
                    )}

                    {/* Название — СКРЫТО по умолчанию! */}
                    {showTrackInfo ? (
                      <div>
                        <h2 className="text-white text-2xl font-bold">{currentTrack.name}</h2>
                        <p className="text-white/60 text-lg">{currentTrack.artist}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white/40 text-lg">🎵 Слушайте и угадывайте!</p>
                        <p className="text-white/30 text-sm mt-1">Найдите этот трек в своей карточке</p>
                      </div>
                    )}
                    
                    <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
                    
                    {/* Управление */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <button onClick={prevTrack} disabled={currentTrackIndex <= 0} className="bg-white/10 border border-white/20 text-white p-3 rounded-full hover:bg-white/20 disabled:opacity-30 transition-all">
                        <SkipForward className="w-5 h-5 rotate-180" />
                      </button>
                      
                      <button
                        onClick={isPlaying ? pauseTrack : playCurrentTrack}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all"
                      >
                        {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                      </button>
                      
                      <button onClick={nextTrack} disabled={currentTrackIndex >= shuffleOrder.length - 1} className="bg-white/10 border border-white/20 text-white p-3 rounded-full hover:bg-white/20 disabled:opacity-30 transition-all">
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Кнопка "Показать ответ" */}
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={revealTrack}
                        disabled={showTrackInfo}
                        className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded-xl hover:bg-yellow-500/30 disabled:opacity-50 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Показать ответ
                      </button>
                      <span className="text-white/40 text-sm">
                        Трек {currentTrackIndex + 1} из {shuffleOrder.length}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">🎶</span>
                    </div>
                    <p className="text-white/60 text-lg mb-4">Готовы начать?</p>
                    <button
                      onClick={nextTrack}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-8 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all"
                    >
                      ▶️ Начать воспроизведение
                    </button>
                  </div>
                )}
              </div>

              {/* Winner */}
              <AnimatePresence>
                {winner && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30 text-center">
                    <p className="text-4xl mb-2">🎉🏆🎉</p>
                    <h2 className="text-yellow-300 text-2xl font-bold">ПОБЕДА!</h2>
                    <p className="text-white text-xl">{winner}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map(card => (
                  <LottoCardComponent
                    key={card.id}
                    card={card}
                    tracks={tracks}
                    isHost={connectedPlayers.size > 0}
                    revealedTrackIds={showTrackInfo && currentTrack ? new Set([currentTrack.id]) : new Set()}
                    onCellClick={connectedPlayers.size === 0 ? (trackId) => {
                      setCards(prev => prev.map(c => {
                        if (c.id === card.id) {
                          const newCells = c.cells.map(cell => cell.trackId === trackId ? { ...cell, marked: !cell.marked } : cell);
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
                <p className="text-center text-white/40 text-sm">💡 Демо-режим: кликайте на ячейки чтобы отмечать треки</p>
              )}

              <div className="text-center">
                <button onClick={resetGame} className="bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center gap-2 mx-auto">
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
