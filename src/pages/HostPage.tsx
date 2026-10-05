import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Upload, Play, Pause, SkipForward, RotateCcw, Users, Music, 
  Copy, Check, Trash2, Disc3, ArrowLeft, LogOut, Video, Link2, 
  Plus, GripVertical, ChevronUp, ChevronDown, Image as ImageIcon,
  ExternalLink, Film, Music2, Youtube
} from 'lucide-react';
import { Track, LottoCard, Playlist } from '../types';
import { useHostPeer } from '../hooks/usePeer';
import { generateLottoCard, generateShuffleOrder, getTrackById } from '../utils/gameUtils';
import { getHostTracks, saveHostTracks, addHostTrack, removeHostTrack, reorderHostTracks, getPlaylistById } from '../utils/storage';
import { parseMediaLink, getMediaLinkDescription, isValidUrl } from '../utils/mediaParser';
import LottoCardComponent from '../components/LottoCard';
import { useAuth } from '../contexts/AuthContext';
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
  const [showTrackInfo, setShowTrackInfo] = useState(false);
  
  // Форма добавления трека
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackLink, setNewTrackLink] = useState('');
  const [newTrackType, setNewTrackType] = useState<'audio' | 'video'>('video');
  const [newTrackCover, setNewTrackCover] = useState('');
  const [linkError, setLinkError] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { peerReady, connectedPlayers, broadcast } = useHostPeer(roomId || '');

  // Загрузка треков из localStorage при старте
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const savedTracks = getHostTracks();
    if (savedTracks.length > 0) {
      setTracks(savedTracks);
    } else if (playlistId) {
      // Если нет сохранённых треков, берём из плейлиста
      const pl = getPlaylistById(playlistId);
      if (pl) {
        setPlaylist(pl);
        setTracks(pl.tracks);
        saveHostTracks(pl.tracks);
      }
    }
  }, [playlistId, user]);

  // Сохранение треков при изменении
  useEffect(() => {
    if (tracks.length > 0) {
      saveHostTracks(tracks);
    }
  }, [tracks]);

  const currentTrack = currentTrackIndex >= 0 ? getTrackById(tracks, shuffleOrder[currentTrackIndex]) : null;

  // Получить embed URL для текущего трека
  const getCurrentMedia = () => {
    if (!currentTrack) return null;
    
    if (currentTrack.mediaLink) {
      return parseMediaLink(currentTrack.mediaLink, currentTrack.mediaType);
    }
    if (currentTrack.fileUrl) {
      const isVideo = currentTrack.fileName?.match(/\.(mp4|webm|mov)$/i);
      return {
        type: isVideo ? 'video' : 'audio',
        embedUrl: currentTrack.fileUrl,
        originalUrl: currentTrack.fileUrl,
        displayType: isVideo ? 'video' : 'audio' as const,
      };
    }
    return null;
  };

  // Обработчик добавления трека
  const handleAddTrack = () => {
    setLinkError('');
    
    if (!newTrackName.trim()) {
      setLinkError('Введите название трека');
      return;
    }
    
    if (!newTrackLink.trim()) {
      setLinkError('Введите ссылку на трек');
      return;
    }
    
    if (!isValidUrl(newTrackLink)) {
      setLinkError('Некорректная ссылка');
      return;
    }
    
    const parsed = parseMediaLink(newTrackLink, newTrackType);
    
    const track: Track = {
      id: uuidv4(),
      name: newTrackName.trim(),
      artist: newTrackArtist.trim() || 'Неизвестный исполнитель',
      fileUrl: '',
      fileName: '',
      mediaLink: newTrackLink.trim(),
      mediaType: newTrackType,
      coverUrl: newTrackCover.trim() || undefined,
    };
    
    setTracks(prev => [...prev, track]);
    
    // Очистка формы
    setNewTrackName('');
    setNewTrackArtist('');
    setNewTrackLink('');
    setNewTrackCover('');
    setNewTrackType('video');
    setShowAddForm(false);
  };

  const handleDeleteTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
  };

  const handleMoveTrack = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tracks.length) return;
    
    const newTracks = [...tracks];
    [newTracks[index], newTracks[newIndex]] = [newTracks[newIndex], newTracks[index]];
    setTracks(newTracks);
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
    broadcast({ type: 'gameStart', payload: { cards: newCards, tracks } });
  }, [tracks, connectedPlayers, broadcast]);

  const playCurrentTrack = () => {
    if (!currentTrack) return;
    
    const media = getCurrentMedia();
    if (!media) {
      alert('Для этого трека не указана ссылка');
      return;
    }
    
    // Для аудио — запускаем через audio тег
    if (media.displayType === 'audio' && audioRef.current) {
      audioRef.current.src = media.embedUrl;
      audioRef.current.play().catch(err => {
        console.error('Audio play error:', err);
        alert('Не удалось воспроизвести аудио. Возможно, ссылка блокируется CORS.');
      });
    }
    
    setIsPlaying(true);
    broadcast({ type: 'playTrack', payload: { trackId: currentTrack.id, trackIndex: currentTrackIndex } });
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    broadcast({ type: 'stopTrack', payload: {} });
  };

  const nextTrack = () => {
    if (currentTrackIndex < shuffleOrder.length - 1) {
      if (audioRef.current) audioRef.current.pause();
      
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
    if (audioRef.current) { audioRef.current.pause(); }
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

  const currentMedia = getCurrentMedia();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Disc3 className={`w-8 h-8 text-purple-400 ${isPlaying ? 'animate-spin' : ''}`} />
            <div>
              <h1 className="text-white font-bold text-lg">{playlist?.name || 'Музыкальное Лото'}</h1>
              <p className="text-white/50 text-sm">Код: <span className="font-mono text-purple-300">{roomId}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={copyRoomCode} className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-3 py-2 rounded-xl hover:bg-white/20 transition-colors text-sm">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span className="font-mono">{roomId}</span>
            </button>
            <div className="flex items-center gap-1 bg-white/10 border border-white/20 text-white px-3 py-2 rounded-xl text-sm">
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
        {/* Left Panel — Управление треками */}
        <div className="lg:col-span-1 space-y-4">
          {/* Connection Status */}
          <div className={`p-3 rounded-xl border ${peerReady ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
            <p className={`text-sm ${peerReady ? 'text-green-300' : 'text-yellow-300'}`}>
              {peerReady ? '✅ Сервер готов. Игроки могут подключаться!' : '⏳ Подключение...'}
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-white/50 text-sm mb-2">QR-код для игроков:</p>
            <div className="bg-white rounded-lg p-3 inline-block">
              <QRCodeSVG value={`${window.location.origin}/player/${roomId}/${encodeURIComponent(user.displayName)}`} size={140} level="M" />
            </div>
          </div>

          {/* Add Track Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить трек / клип
          </button>

          {/* Add Track Form Modal */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowAddForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-purple-400" />
                    Добавить трек / клип
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-white/70 text-sm mb-1 block">Название *</label>
                      <input
                        type="text"
                        value={newTrackName}
                        onChange={(e) => setNewTrackName(e.target.value)}
                        placeholder="Например: Smells Like Teen Spirit"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-white/70 text-sm mb-1 block">Исполнитель</label>
                      <input
                        type="text"
                        value={newTrackArtist}
                        onChange={(e) => setNewTrackArtist(e.target.value)}
                        placeholder="Например: Nirvana"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-white/70 text-sm mb-1 block">Ссылка на трек/клип *</label>
                      <input
                        type="url"
                        value={newTrackLink}
                        onChange={(e) => setNewTrackLink(e.target.value)}
                        placeholder="https://drive.google.com/... или YouTube"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-sm"
                      />
                      {newTrackLink && isValidUrl(newTrackLink) && (
                        <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                          {getMediaLinkDescription(newTrackLink)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-white/70 text-sm mb-1 block">Тип медиа</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewTrackType('video')}
                          className={`py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                            newTrackType === 'video'
                              ? 'bg-pink-600 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <Film className="w-4 h-4" />
                          Видео / Клип
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTrackType('audio')}
                          className={`py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                            newTrackType === 'audio'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <Music2 className="w-4 h-4" />
                          Аудио
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-white/70 text-sm mb-1 block">Обложка (ссылка на картинку, опционально)</label>
                      <input
                        type="url"
                        value={newTrackCover}
                        onChange={(e) => setNewTrackCover(e.target.value)}
                        placeholder="https://example.com/cover.jpg"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-sm"
                      />
                    </div>

                    {linkError && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
                        {linkError}
                      </div>
                    )}

                    {/* Подсказка по ссылкам */}
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-white/60 text-xs font-semibold mb-2">💡 Поддерживаемые ссылки:</p>
                      <ul className="text-white/50 text-xs space-y-1">
                        <li>• Google Drive (видео и аудио)</li>
                        <li>• YouTube (youtube.com, youtu.be)</li>
                        <li>• Прямые ссылки на MP3, MP4, WebM</li>
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/20"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleAddTrack}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all"
                      >
                        Добавить
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tracks List */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Треки ({tracks.length})
            </h2>

            {tracks.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">
                Добавьте треки через кнопку выше
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {tracks.map((track, idx) => (
                  <motion.div
                    key={track.id}
                    layout
                    className="flex items-center gap-2 bg-white/5 rounded-lg p-2 group hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white/40 text-xs w-6 text-center">{idx + 1}</span>
                    
                    {/* Обложка */}
                    {track.coverUrl && (
                      <img 
                        src={track.coverUrl} 
                        alt="" 
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{track.name}</p>
                      <p className="text-white/50 text-xs truncate">{track.artist}</p>
                    </div>
                    
                    {/* Тип */}
                    <div className="flex items-center gap-1">
                      {track.mediaType === 'video' ? (
                        <span className="text-pink-400 text-xs px-1.5 py-0.5 bg-pink-500/20 rounded">🎬</span>
                      ) : (
                        <span className="text-blue-400 text-xs px-1.5 py-0.5 bg-blue-500/20 rounded">🎵</span>
                      )}
                    </div>
                    
                    {/* Кнопки управления */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleMoveTrack(idx, 'up')}
                        disabled={idx === 0}
                        className="text-white/50 hover:text-white disabled:opacity-30 p-1"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveTrack(idx, 'down')}
                        disabled={idx === tracks.length - 1}
                        className="text-white/50 hover:text-white disabled:opacity-30 p-1"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
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

        {/* Center Panel — Игровая зона */}
        <div className="lg:col-span-2 space-y-4">
          {phase === 'setup' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
                <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-white text-2xl font-bold mb-2">Подготовка к игре</h2>
                <p className="text-white/60 mb-6">
                  Добавьте треки через ссылки (Google Drive, YouTube или прямые ссылки)
                </p>

                <div className="bg-white/5 rounded-xl p-4 mb-6 text-left inline-block max-w-md">
                  <p className="text-white/70 font-semibold mb-2 text-sm">📌 Примеры ссылок:</p>
                  <ul className="text-white/50 text-xs space-y-2">
                    <li>
                      <span className="text-pink-400">Google Drive видео:</span><br/>
                      <code className="text-green-400 break-all">https://drive.google.com/file/d/1ABC.../view</code>
                    </li>
                    <li>
                      <span className="text-blue-400">Google Drive аудио:</span><br/>
                      <code className="text-green-400 break-all">https://drive.google.com/file/d/1XYZ.../view</code>
                    </li>
                    <li>
                      <span className="text-red-400">YouTube:</span><br/>
                      <code className="text-green-400 break-all">https://www.youtube.com/watch?v=dQw4w9WgXcQ</code>
                    </li>
                    <li>
                      <span className="text-purple-400">Прямая ссылка на MP3:</span><br/>
                      <code className="text-green-400 break-all">https://example.com/song.mp3</code>
                    </li>
                  </ul>
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
                    {/* Видео через iframe */}
                    {currentMedia?.displayType === 'iframe' && (
                      <div className="mb-4 rounded-xl overflow-hidden bg-black aspect-video">
                        <iframe
                          src={currentMedia.embedUrl}
                          className="w-full h-full"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Видео через video тег */}
                    {currentMedia?.displayType === 'video' && (
                      <div className="mb-4 rounded-xl overflow-hidden bg-black">
                        <video
                          src={currentMedia.embedUrl}
                          className="w-full max-h-80 mx-auto"
                          autoPlay
                          controls
                        />
                      </div>
                    )}

                    {/* Аудио через audio тег */}
                    {currentMedia?.displayType === 'audio' && (
                      <div className="mb-4">
                        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${isPlaying ? 'bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}>
                          <Disc3 className={`w-16 h-16 text-white ${isPlaying ? 'animate-spin' : ''}`} />
                        </div>
                        
                        {/* Обложка если есть */}
                        {currentTrack.coverUrl && (
                          <div className="mb-4">
                            <img 
                              src={currentTrack.coverUrl} 
                              alt={currentTrack.name}
                              className="w-40 h-40 mx-auto rounded-xl object-cover shadow-2xl"
                            />
                          </div>
                        )}
                        
                        <audio
                          ref={audioRef}
                          src={currentMedia.embedUrl}
                          controls
                          className="w-full max-w-md mx-auto"
                          onEnded={() => setIsPlaying(false)}
                        />
                      </div>
                    )}

                    {/* Название — СКРЫТО по умолчанию */}
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

                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={revealTrack}
                        disabled={showTrackInfo}
                        className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded-xl hover:bg-yellow-500/30 disabled:opacity-50 transition-colors text-sm"
                      >
                        <Check className="w-4 h-4" />
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
                <p className="text-center text-white/40 text-sm">💡 Демо-режим: кликайте на ячейки</p>
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
