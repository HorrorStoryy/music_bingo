import { LottoCard } from '../types';
import { getTrackById } from '../utils/gameUtils';
import { Track } from '../types';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface LottoCardComponentProps {
  card: LottoCard;
  tracks: Track[];
  onCellClick?: (trackId: string) => void;
  isHost?: boolean;
  revealedTrackIds?: Set<string>;
}

export default function LottoCardComponent({ card, tracks, onCellClick, isHost = false, revealedTrackIds }: LottoCardComponentProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
      <div className="text-center mb-3">
        <h3 className="text-white font-bold text-lg">{card.playerName}</h3>
        {card.completed && (
          <span className="text-yellow-300 text-sm font-semibold animate-pulse">🎉 ЛОТО!</span>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {card.cells.map((cell, idx) => {
          const track = getTrackById(tracks, cell.trackId);
          const isRevealed = revealedTrackIds?.has(cell.trackId);
          const isMarked = cell.marked;
          
          return (
            <motion.button
              key={idx}
              whileTap={!isHost ? { scale: 0.9 } : undefined}
              onClick={() => !isHost && onCellClick?.(cell.trackId)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center p-1 text-center transition-all duration-300
                ${isMarked 
                  ? 'bg-green-500/80 border-2 border-green-300 shadow-lg shadow-green-500/30' 
                  : isRevealed
                    ? 'bg-yellow-500/40 border-2 border-yellow-300 animate-pulse'
                    : 'bg-white/10 border border-white/20 hover:bg-white/20'
                }
                ${!isHost && !isMarked ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              {isMarked && (
                <Check className="w-4 h-4 text-white absolute" />
              )}
              <span className={`text-[10px] leading-tight font-medium ${isMarked ? 'text-white line-through' : 'text-white/90'}`}>
                {track?.name || '???'}
              </span>
              <span className={`text-[8px] leading-tight ${isMarked ? 'text-white/70' : 'text-white/50'}`}>
                {track?.artist || ''}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
