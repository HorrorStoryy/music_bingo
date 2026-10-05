export interface Track {
  id: string;
  name: string;
  artist: string;
  fileUrl: string;
  fileName: string;
  duration?: number;
  coverUrl?: string;
}

export interface LottoCell {
  trackId: string;
  marked: boolean;
}

export interface LottoCard {
  id: string;
  cells: LottoCell[];
  playerName: string;
  completed: boolean;
}

export interface GameState {
  roomId: string;
  hostId: string;
  tracks: Track[];
  cards: LottoCard[];
  currentTrackIndex: number;
  isPlaying: boolean;
  phase: 'waiting' | 'playing' | 'finished';
  winner: string | null;
  shuffleOrder: string[];
}

export interface PlayerMessage {
  type: 'join' | 'mark' | 'bingo' | 'leave';
  payload: any;
}

export interface HostMessage {
  type: 'gameState' | 'playTrack' | 'stopTrack' | 'nextTrack' | 'playerJoined' | 'gameStart' | 'reset';
  payload: any;
}
