import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Play, Pause, SkipForward, RotateCcw, Users, Music, Copy, Check, Disc3, ArrowLeft, LogOut, Eye } from 'lucide-react';
import { Track, LottoCard, Playlist } from '../types';
import { useHostPeer } from '../hooks/usePeer';
import { generateLottoCard, generateShuffleOrder, getTrackById } from '../utils/gameUtils';
import { getHostTracks, saveHostTracks, getPlaylistById } from '../utils/storage';
import { parseMediaLink } from '../utils/mediaParser';
import { useAuth } from '../contexts/AuthContext';
import SilentFilmTitleCard from '../components/SilentFilmTitleCard';
import LottoCardComponent from '../components/LottoCard';

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
  const [showTitleCard, setShowTitleCard] = useState(false);
  const [titleCardText, setTitleCardText] = useState({ title: '', subtitle: '' });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { peerReady, connectedPlayers, broadcast } = useHostPeer(roomId || '');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const savedTracks = getHostTracks();
    if (savedTracks.length > 0) setTracks(savedTracks);
    else if (playlistId) { const pl = getPlaylistById(playlistId); if (pl) { setPlaylist(pl); setTracks(pl.tracks); saveHostTracks(pl.tracks); } }
  }, [playlistId, user]);

  useEffect(() => { if (tracks.length > 0) saveHostTracks(tracks); }, [tracks]);

  const currentTrack = currentTrackIndex >= 0 ? getTrackById(tracks, shuffleOrder[currentTrackIndex]) : null;
  const getCurrentMedia = () => {
    if (!currentTrack) return null;
    if (currentTrack.mediaLink) return parseMediaLink(currentTrack.mediaLink, currentTrack.mediaType);
    if (currentTrack.fileUrl) { const isVideo = currentTrack.fileName?.match(/\.(mp4|webm|mov)$/i); return { type: isVideo ? 'video' : 'audio', embedUrl: currentTrack.fileUrl, originalUrl: currentTrack.fileUrl, displayType: isVideo ? 'video' : 'audio' as const }; }
    return null;
  };

  const startGame = useCallback(() => {
    if (tracks.length < 2) return;
    const order = generateShuffleOrder(tracks);
    setShuffleOrder(order); setCurrentTrackIndex(-1); setIsPlaying(false); setPhase('waiting'); setWinner(null); setShowTrackInfo(false);
    const newCards: LottoCard[] = [];
    connectedPlayers.forEach((name) => newCards.push(generateLottoCard(tracks, name)));
    if (newCards.length === 0) for (let i = 1; i <= Math.min(4, Math.ceil(tracks.length / 3)); i++) newCards.push(generateLottoCard(tracks, `Игрок ${i}`));
    setCards(newCards);
    broadcast({ type: 'gameStart', payload: { cards: newCards, tracks } });
  }, [tracks, connectedPlayers, broadcast]);

  const playCurrentTrack = () => {
    if (!currentTrack) return;
    const media = getCurrentMedia();
    if (!media) { alert('Нет ссылки'); return; }
    setTitleCardText({ title: `Трек ${currentTrackIndex + 1}`, subtitle: 'Слушайте внимательно...' });
    setShowTitleCard(true);
    setTimeout(() => {
      setShowTitleCard(false);
      if (media.displayType === 'audio' && audioRef.current) { audioRef.current.src = media.embedUrl; audioRef.current.play().catch(() => {}); }
      setIsPlaying(true);
      broadcast({ type: 'playTrack', payload: { trackId: currentTrack.id, trackIndex: currentTrackIndex } });
    }, 2500);
  };

  const pauseTrack = () => { if (audioRef.current) audioRef.current.pause(); setIsPlaying(false); broadcast({ type: 'stopTrack', payload: {} }); };
  const nextTrack = () => {
    if (currentTrackIndex < shuffleOrder.length - 1) {
      if (audioRef.current) audioRef.current.pause();
      const newIndex = currentTrackIndex + 1; setCurrentTrackIndex(newIndex); setIsPlaying(false); setShowTrackInfo(false);
      broadcast({ type: 'nextTrack', payload: { trackIndex: newIndex, trackId: shuffleOrder[newIndex] } });
    }
  };
  const prevTrack = () => { if (currentTrackIndex > 0) { if (audioRef.current) audioRef.current.pause(); setCurrentTrackIndex(currentTrackIndex - 1); setIsPlaying(false); setShowTrackInfo(false); } };
  const revealTrack = () => { if (!currentTrack) return; setShowTrackInfo(true); broadcast({ type: 'revealTrack', payload: { trackName: currentTrack.name, artist: currentTrack.artist } }); };
  const resetGame = () => { if (audioRef.current) audioRef.current.pause(); setPhase('setup'); setCurrentTrackIndex(-1); setIsPlaying(false); setCards([]); setWinner(null); setShuffleOrder([]); setShowTrackInfo(false); broadcast({ type: 'reset', payload: {} }); };
  const copyRoomCode = () => { navigator.clipboard.writeText(roomId || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;
  const currentMedia = getCurrentMedia();

  return (
    <div className="min-h-screen bg-paper-texture">
      <SilentFilmTitleCard show={showTitleCard} title={titleCardText.title} subtitle={titleCardText.subtitle} />
      <header className="bg-polaroid-white/80 backdrop-blur-md border-b-2 border-polaroid p-4 shadow-polaroid">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-polaroid-light hover:text-polaroid"><ArrowLeft className="w-5 h-5" /></button>
            <Disc3 className={`w-8 h-8 text-polaroid-accent ${isPlaying ? 'animate-spin' : ''}`} />
            <div><h1 className="text-polaroid font-serif-old font-bold text-lg">{playlist?.name || 'Музыкальное Лото'}</h1><p className="text-polaroid-light text-sm font-typewriter">Код: <span className="text-polaroid-accent font-mono">{roomId}</span></p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyRoomCode} className="btn-polaroid text-sm flex items-center gap-2">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}<span className="font-mono">{roomId}</span></button>
            <div className="btn-polaroid text-sm flex items-center gap-1"><Users className="w-4 h-4" /><span>{connectedPlayers.size}</span></div>
            <button onClick={handleLogout} className="btn-polaroid p-2"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className={`p-3 rounded border-2 ${peerReady ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}><p className={`text-sm font-typewriter ${peerReady ? 'text-green-700' : 'text-yellow-700'}`}>{peerReady ? '✅ Сервер готов' : '⏳ Подключение...'}</p></div>
          <div className="polaroid-card text-center"><p className="text-polaroid-light text-sm font-typewriter mb-2">QR-код для игроков:</p><div className="bg-polaroid-white rounded p-2 inline-block"><QRCodeSVG value={`${window.location.origin}/player/${roomId}/${encodeURIComponent(user.displayName)}`} size={140} level="M" /></div></div>
          <div className="polaroid-card"><h2 className="text-polaroid font-serif-old font-bold mb-3 flex items-center gap-2"><Music className="w-5 h-5 text-polaroid-accent" /><span className="font-title text-lg">Треки ({tracks.length})</span></h2>{tracks.length === 0 ? <p className="text-polaroid-light text-sm text-center py-4 font-typewriter">Нет треков</p> : (<div className="space-y-2 max-h-80 overflow-y-auto">{tracks.map((track, idx) => (<div key={track.id} className="flex items-center gap-2 bg-polaroid-cream rounded p-2 border border-polaroid"><span className="text-polaroid-light text-xs w-6 text-center font-mono">{idx + 1}</span>{track.coverUrl && <img src={track.coverUrl} alt="" className="w-8 h-8 rounded object-cover border border-polaroid" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />} <div className="flex-1 min-w-0"><p className="text-polaroid text-sm truncate font-typewriter">{track.name}</p><p className="text-polaroid-light text-xs truncate">{track.artist}</p></div><span className="text-polaroid-accent text-xs">{track.mediaType === 'video' ? '🎬' : '🎵'}</span></div>))}</div>)}</div>
          <div className="polaroid-card"><h2 className="text-polaroid font-serif-old font-bold mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-polaroid-accent" /><span className="font-title text-lg">Игроки ({connectedPlayers.size})</span></h2>{connectedPlayers.size === 0 ? <p className="text-polaroid-light text-sm font-typewriter">Пока никого нет...</p> : (<div className="space-y-2">{Array.from(connectedPlayers.values()).map((name, idx) => (<div key={idx} className="flex items-center gap-2 bg-polaroid-cream rounded p-2 border border-polaroid"><div className="w-8 h-8 bg-polaroid-accent/20 border border-polaroid-accent rounded-full flex items-center justify-center text-polaroid-accent text-sm font-bold font-title">{name[0].toUpperCase()}</div><span className="text-polaroid text-sm font-typewriter">{name}</span></div>))}</div>)}</div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {phase === 'setup' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 fade-in-photo"><div className="polaroid-card text-center"><h2 className="text-polaroid text-2xl font-serif-old font-bold mb-2">Подготовка к игре</h2><p className="text-polaroid-light font-typewriter mb-4">Плейлист: {playlist?.name}</p><p className="text-polaroid-light text-sm font-typewriter mb-4">{tracks.length} треков</p><button onClick={startGame} disabled={tracks.length < 2} className="btn-polaroid btn-polaroid-primary font-title text-xl px-8 py-4 disabled:opacity-50">🎬 Начать игру</button>{tracks.length < 2 && <p className="text-polaroid-light text-sm mt-2 font-typewriter">Нужно минимум 2 трека</p>}</div></motion.div>)}

          {(phase === 'waiting' || phase === 'playing' || phase === 'finished') && (
            <div className="space-y-4">
              <div className="polaroid-card p-6">
                {currentTrack ? (
                  <div className="text-center">
                    {currentMedia?.displayType === 'iframe' && <div className="mb-4 rounded overflow-hidden bg-black border-2 border-polaroid"><iframe src={currentMedia.embedUrl} className="w-full aspect-video" allow="autoplay; encrypted-media" allowFullScreen /></div>}
                    {currentMedia?.displayType === 'video' && <div className="mb-4 rounded overflow-hidden bg-black border-2 border-polaroid"><video src={currentMedia.embedUrl} className="w-full max-h-80 mx-auto" autoPlay controls /></div>}
                    {currentMedia?.displayType === 'audio' && (<div className="mb-4"><div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 border-4 ${isPlaying ? 'border-polaroid-accent bg-polaroid-accent/10' : 'border-polaroid bg-polaroid-cream'}`}><Disc3 className={`w-16 h-16 text-polaroid-accent ${isPlaying ? 'animate-spin' : ''}`} /></div>{currentTrack.coverUrl && <div className="mb-4"><img src={currentTrack.coverUrl} alt={currentTrack.name} className="w-40 h-40 mx-auto rounded border-2 border-polaroid object-cover faded-photo" /></div>}<audio ref={audioRef} src={currentMedia.embedUrl} controls className="w-full max-w-md mx-auto" onEnded={() => setIsPlaying(false)} /></div>)}
                    {showTrackInfo ? <div className="mt-4"><h2 className="text-polaroid text-2xl font-serif-old font-bold">{currentTrack.name}</h2><p className="text-polaroid-light text-lg font-typewriter">{currentTrack.artist}</p></div> : <div className="mt-4"><p className="text-polaroid-light text-lg font-typewriter">🎵 Слушайте и угадывайте!</p></div>}
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <button onClick={prevTrack} disabled={currentTrackIndex <= 0} className="btn-polaroid p-3 rounded-full disabled:opacity-30"><SkipForward className="w-5 h-5 rotate-180" /></button>
                      <button onClick={isPlaying ? pauseTrack : playCurrentTrack} className="btn-polaroid btn-polaroid-primary p-4 rounded-full">{isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}</button>
                      <button onClick={nextTrack} disabled={currentTrackIndex >= shuffleOrder.length - 1} className="btn-polaroid p-3 rounded-full disabled:opacity-30"><SkipForward className="w-5 h-5" /></button>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-3"><button onClick={revealTrack} disabled={showTrackInfo} className="btn-polaroid text-sm flex items-center gap-2 disabled:opacity-50"><Eye className="w-4 h-4" />Показать ответ</button><span className="text-polaroid-light text-sm font-typewriter">Трек {currentTrackIndex + 1} / {shuffleOrder.length}</span></div>
                  </div>
                ) : (<div className="text-center py-8"><div className="w-24 h-24 bg-polaroid-cream rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-polaroid"><span className="text-4xl">🎶</span></div><p className="text-polaroid-light text-lg font-typewriter mb-4">Готовы начать?</p><button onClick={nextTrack} className="btn-polaroid btn-polaroid-primary font-title text-lg">▶️ Начать</button></div>)}
              </div>
              <AnimatePresence>{winner && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="polaroid-card text-center"><p className="text-4xl mb-2">🏆</p><h2 className="text-polaroid-accent text-2xl font-serif-old font-bold">ПОБЕДА!</h2><p className="text-polaroid text-xl font-typewriter">{winner}</p></motion.div>)}</AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{cards.map(card => <LottoCardComponent key={card.id} card={card} tracks={tracks} isHost={connectedPlayers.size > 0} revealedTrackIds={showTrackInfo && currentTrack ? new Set([currentTrack.id]) : new Set()} onCellClick={connectedPlayers.size === 0 ? (trackId) => { setCards(prev => prev.map(c => { if (c.id === card.id) { const newCells = c.cells.map(cell => cell.trackId === trackId ? { ...cell, marked: !cell.marked } : cell); const newCard = { ...c, cells: newCells }; if (newCells.every(cell => cell.marked)) { newCard.completed = true; setWinner(c.playerName); setPhase('finished'); } return newCard; } return c; })); } : undefined} />)}</div>
              {connectedPlayers.size === 0 && <p className="text-center text-polaroid-light text-sm font-typewriter">💡 Демо-режим</p>}
              <div className="text-center"><button onClick={resetGame} className="btn-polaroid flex items-center gap-2 mx-auto"><RotateCcw className="w-5 h-5" /><span className="font-title">Новая игра</span></button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
