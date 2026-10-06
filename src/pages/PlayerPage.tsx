import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Wifi, WifiOff, Trophy, Disc3, Headphones } from 'lucide-react';
import { Track, LottoCard, HostMessage } from '../types';
import { usePlayerPeer } from '../hooks/usePeer';

export default function PlayerPage() {
  const { roomId, playerName: encodedName } = useParams<{ roomId: string; playerName: string }>();
  const playerName = decodeURIComponent(encodedName || '') || 'Игрок';
  const [card, setCard] = useState<LottoCard | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [markedCount, setMarkedCount] = useState(0);
  const [revealedTrack, setRevealedTrack] = useState<{ name: string; artist: string; coverUrl?: string } | null>(null);
  const [trackNumber, setTrackNumber] = useState<number | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  const handleMessage = useCallback((msg: HostMessage) => {
    switch (msg.type) {
      case 'gameStart': setTracks(msg.payload.tracks); const myCard = msg.payload.cards.find((c: LottoCard) => c.playerName === playerName); if (myCard) setCard(myCard); setGameStarted(true); setRevealedTrack(null); break;
      case 'playTrack': setIsPlaying(true); setRevealedTrack(null); setTrackNumber(msg.payload.trackIndex + 1); setCurrentTrackId(msg.payload.trackId); break;
      case 'nextTrack': setIsPlaying(false); setRevealedTrack(null); setTrackNumber(msg.payload.trackIndex + 1); setCurrentTrackId(msg.payload.trackId); break;
      case 'stopTrack': setIsPlaying(false); break;
      case 'revealTrack': const currentTrack = tracks.find(t => t.id === currentTrackId); setRevealedTrack({ name: msg.payload.trackName, artist: msg.payload.artist, coverUrl: currentTrack?.coverUrl }); setTimeout(() => setRevealedTrack(null), 5000); break;
      case 'reset': setCard(null); setTracks([]); setIsPlaying(false); setGameStarted(false); setWinner(null); setMarkedCount(0); setRevealedTrack(null); setTrackNumber(null); setCurrentTrackId(null); break;
    }
  }, [playerName, tracks, currentTrackId]);

  const { connected, error, send } = usePlayerPeer(roomId || '', playerName, handleMessage);

  const handleCellClick = (trackId: string) => {
    if (!card) return;
    const cell = card.cells.find(c => c.trackId === trackId);
    if (!cell || cell.marked) return;
    const newCells = card.cells.map(c => c.trackId === trackId ? { ...c, marked: true } : c);
    const newCard = { ...card, cells: newCells };
    const allMarked = newCells.every(c => c.marked);
    if (allMarked) { newCard.completed = true; setWinner(playerName); }
    setCard(newCard); setMarkedCount(newCells.filter(c => c.marked).length);
    send({ type: 'mark', payload: { cardId: card.id, trackId } });
    if (allMarked) send({ type: 'bingo', payload: { cardId: card.id } });
  };

  const currentTrack = currentTrackId ? tracks.find(t => t.id === currentTrackId) : null;

  if (error) return (<div className="min-h-screen bg-paper-texture flex items-center justify-center p-4"><motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="polaroid-card max-w-sm w-full text-center"><WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" /><h2 className="text-polaroid text-xl font-serif-old font-bold mb-2">Ошибка</h2><p className="text-polaroid-light font-typewriter mb-4">{error}</p></motion.div></div>);
  if (!connected) return (<div className="min-h-screen bg-paper-texture flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="inline-block mb-6"><Disc3 className="w-16 h-16 text-polaroid-accent" /></motion.div><h2 className="text-polaroid text-2xl font-serif-old font-bold mb-2">Подключение...</h2><p className="text-polaroid-light font-typewriter">Комната: <span className="text-polaroid-accent font-mono">{roomId}</span></p></motion.div></div>);
  if (!gameStarted) return (<div className="min-h-screen bg-paper-texture flex items-center justify-center p-4"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm w-full"><div className="polaroid-card"><Wifi className="w-12 h-12 text-polaroid-accent mx-auto mb-4" /><h2 className="text-polaroid text-xl font-serif-old font-bold mb-2">Вы подключены!</h2><p className="text-polaroid-light font-typewriter mb-4">Привет, <span className="text-polaroid-accent">{playerName}</span>!</p><div className="bg-polaroid-cream rounded p-4 border border-polaroid"><motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-polaroid-accent font-typewriter">⏳ Ожидание начала...</motion.p></div></div></motion.div></div>);

  return (
    <div className="min-h-screen bg-paper-texture p-4">
      <div className="flex items-center justify-between mb-4 border-b-2 border-polaroid pb-3">
        <div className="flex items-center gap-2"><div className="w-8 h-8 bg-polaroid-accent/20 border border-polaroid-accent rounded-full flex items-center justify-center text-polaroid-accent text-sm font-bold font-title">{playerName[0].toUpperCase()}</div><span className="text-polaroid font-typewriter">{playerName}</span></div>
        <div className="flex items-center gap-2"><span className="text-polaroid-light text-sm font-typewriter">{markedCount}/15</span><div className="w-20 h-2 bg-polaroid-cream rounded-full overflow-hidden border border-polaroid"><motion.div className="h-full bg-polaroid-accent" initial={{ width: 0 }} animate={{ width: `${(markedCount / 15) * 100}%` }} /></div></div>
      </div>

      <AnimatePresence mode="wait">
        {isPlaying && !revealedTrack && currentTrack && (<motion.div key="playing" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="polaroid-card p-4 mb-4"><div className="flex items-center gap-3">{currentTrack.coverUrl ? <img src={currentTrack.coverUrl} alt="" className="w-14 h-14 rounded border-2 border-polaroid object-cover faded-photo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}><Disc3 className="w-14 h-14 text-polaroid-accent" /></motion.div>}<div className="flex-1"><p className="text-polaroid font-typewriter flex items-center gap-2"><Headphones className="w-5 h-5 text-polaroid-accent" />Играет музыка...</p><p className="text-polaroid-light text-sm font-typewriter">{trackNumber ? `Трек №${trackNumber}` : 'Слушайте внимательно!'}</p></div></div><p className="text-polaroid-light/60 text-xs mt-2 text-center font-typewriter">🎵 Найдите этот трек в карточке!</p></motion.div>)}
        {revealedTrack && (<motion.div key="revealed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="polaroid-card mb-4 text-center"><div className="flex items-center gap-3 justify-center">{revealedTrack.coverUrl && <img src={revealedTrack.coverUrl} alt="" className="w-14 h-14 rounded border-2 border-polaroid object-cover faded-photo" />}<div className="text-left"><p className="text-polaroid-accent text-xs font-typewriter mb-1">✨ Это был трек:</p><p className="text-polaroid font-serif-old font-bold text-lg">{revealedTrack.name}</p><p className="text-polaroid-light font-typewriter">{revealedTrack.artist}</p></div></div></motion.div>)}
      </AnimatePresence>

      <AnimatePresence>{winner && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="polaroid-card mb-4 text-center"><Trophy className="w-12 h-12 text-polaroid-accent mx-auto mb-2" /><h2 className="text-polaroid-accent text-xl font-serif-old font-bold">ЛОТО!</h2><p className="text-polaroid font-typewriter">Поздравляем! 🎉</p></motion.div>)}</AnimatePresence>

      {card && (<div className="polaroid-card p-4"><div className="text-center mb-3 pb-3 border-b border-polaroid"><h3 className="text-polaroid font-handwritten text-xl">{card.playerName}</h3>{card.completed && <span className="text-polaroid-accent text-sm font-typewriter animate-pulse mt-1 block">🎉 ЛОТО!</span>}</div><div className="grid grid-cols-5 gap-2">{card.cells.map((cell, idx) => { const track = tracks.find(t => t.id === cell.trackId); const isMarked = cell.marked; return (<motion.button key={idx} whileTap={{ scale: 0.9 }} onClick={() => handleCellClick(cell.trackId)} className={`aspect-square rounded flex flex-col items-center justify-center p-1 text-center transition-all duration-300 border-2 ${isMarked ? 'bg-polaroid-accent border-polaroid-accent text-white' : 'bg-polaroid-cream border-polaroid hover:border-polaroid-accent cursor-pointer'}`}><span className={`text-[10px] leading-tight font-typewriter ${isMarked ? 'text-white' : 'text-polaroid'}`}>{track?.name || '???'}</span><span className={`text-[8px] leading-tight ${isMarked ? 'text-white/80' : 'text-polaroid-light'}`}>{track?.artist || ''}</span></motion.button>); })}</div><div className="mt-3 pt-3 border-t border-polaroid text-center"><p className="text-polaroid-light text-xs font-typewriter">{card.cells.filter(c => c.marked).length} / 15 отмечено</p></div></div>)}

      {!isPlaying && !revealedTrack && !winner && (<div className="mt-6 polaroid-card p-4 text-center"><Music className="w-8 h-8 text-polaroid-light mx-auto mb-2" /><p className="text-polaroid-light text-sm font-typewriter">Ожидание следующего трека...</p></div>)}
    </div>
  );
}
