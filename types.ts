
export type Suit = 'Oros' | 'Copas' | 'Espadas' | 'Bastos';
export type Difficulty = 'Fácil' | 'Normal' | 'Pro';

export interface Card {
  id: string;
  suit: Suit;
  rank: number;
  value: number;
}

export interface Player {
  id: 'player' | 'cpu';
  name: string;
  hand: Card[];
  capturedCards: Card[];
  escobas: number;
}

export interface GameState {
  deck: Card[];
  table: Card[];
  player: Player;
  cpu: Player;
  currentPlayer: 'player' | 'cpu';
  lastCaptureBy: 'player' | 'cpu' | null;
  phase: 'dealing' | 'playing' | 'scoring' | 'gameOver';
  winningScore: number;
  message: string;
  difficulty: Difficulty;
  cpuRevealedCard: Card | null;
  lastCpuPlayedCard: Card | null;
}

export interface ScoringDetails {
  cards: number;
  oros: number;
  sevens: number;
  sevenOfOros: boolean;
  escobas: number;
  points: number;
}
