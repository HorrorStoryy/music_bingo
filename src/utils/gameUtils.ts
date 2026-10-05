import { Track, LottoCard, LottoCell } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateLottoCard(tracks: Track[], playerName: string): LottoCard {
  const shuffled = [...tracks].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 15);
  
  const cells: LottoCell[] = selected.map(track => ({
    trackId: track.id,
    marked: false,
  }));
  
  return {
    id: uuidv4(),
    cells,
    playerName,
    completed: false,
  };
}

export function generateShuffleOrder(tracks: Track[]): string[] {
  return [...tracks].sort(() => Math.random() - 0.5).map(t => t.id);
}

export function checkBingo(card: LottoCard): boolean {
  return card.cells.every(cell => cell.marked);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getTrackById(tracks: Track[], id: string): Track | undefined {
  return tracks.find(t => t.id === id);
}
