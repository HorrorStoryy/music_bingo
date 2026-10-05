import { LottoCard, Track } from '../types';
import { getTrackById } from '../utils/gameUtils';
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
    <div className="polaroid-card">
      {/* Заголовок карточки */}
      <div className="text-center mb-4 pb-3 border-b border-polaroid">
        <h3 className="text-polaroid font-handwritten text-xl">{card.playerName}</h3>
        {card.completed && (
          <span className="text-polaroid-accent text-sm font-typewriter animate-pulse mt-1 block">🎉 ЛОТО!</span>
        )}
      </div>

      {/* Сетка ячеек */}
      <div className="grid grid-cols-5 gap-2">
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
                polaroid-cell aspect-square flex flex-col items-center justify-center p-1 text-center
                ${isMarked ? 'marked' : ''}
                ${isRevealed && !isMarked ? 'border-polaroid-accent bg-polaroid-accent/10' : ''}
                ${!isHost && !isMarked ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              <span className={`text-[10px] leading-tight font-typewriter ${isMarked ? 'text-white' : 'text-polaroid'}`}>
                {track?.name || '???'}
              </span>
              <span className={`text-[8px] leading-tight ${isMarked ? 'text-white/80' : 'text-polaroid-light'}`}>
                {track?.artist || ''}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* "Подпись" снизу */}
      <div className="mt-4 pt-3 border-t border-polaroid text-center">
        <p className="text-polaroid-light text-xs font-typewriter">
          {card.cells.filter(c => c.marked).length} / 15 отмечено
        </p>
      </div>
    </div>
  );
}
