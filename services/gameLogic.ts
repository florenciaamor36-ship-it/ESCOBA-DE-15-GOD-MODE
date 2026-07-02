
import { Card, Suit, Player, ScoringDetails, Difficulty } from '../types';

export const SUITS: Suit[] = ['Oros', 'Copas', 'Espadas', 'Bastos'];
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      let value = rank;
      if (rank === 10) value = 8;
      if (rank === 11) value = 9;
      if (rank === 12) value = 10;
      deck.push({ id: `${suit}-${rank}`, suit, rank, value });
    });
  });
  return shuffle(deck);
};

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getPossibleCombinations = (table: Card[], target: number): Card[][] => {
  const result: Card[][] = [];
  const findSubsets = (index: number, currentSum: number, currentSet: Card[]) => {
    if (currentSum === target) {
      result.push([...currentSet]);
      return;
    }
    if (currentSum > target || index >= table.length) return;
    currentSet.push(table[index]);
    findSubsets(index + 1, currentSum + table[index].value, currentSet);
    currentSet.pop();
    findSubsets(index + 1, currentSum, currentSet);
  };
  findSubsets(0, 0, []);
  return result;
};

export const calculateBestCapture = (handCard: Card, table: Card[], difficulty: Difficulty = 'Normal'): Card[] | null => {
  const target = 15 - handCard.value;
  if (target < 0) return null;
  if (target === 0) return [];

  const combinations = getPossibleCombinations(table, target);
  if (combinations.length === 0) return null;

  if (difficulty === 'Fácil') {
    return combinations[Math.floor(Math.random() * combinations.length)];
  }

  return combinations.sort((a, b) => {
    const scoreA = calculateCaptureWeight(a, difficulty === 'Pro');
    const scoreB = calculateCaptureWeight(b, difficulty === 'Pro');
    return scoreB - scoreA;
  })[0];
};

const calculateCaptureWeight = (cards: Card[], isPro: boolean): number => {
  let weight = cards.length * 2; 
  cards.forEach(c => {
    if (c.suit === 'Oros') weight += 5;
    if (c.rank === 7) weight += 7;
    if (c.suit === 'Oros' && c.rank === 7) weight += 25;
    // En modo pro, priorizar capturar cartas que eviten escobas del rival
    if (isPro && c.value >= 5) weight += 3; 
  });
  return weight;
};

export const calculateRoundScores = (player: Player, cpu: Player): { playerDetails: ScoringDetails, cpuDetails: ScoringDetails } => {
  const getDetails = (p: Player): ScoringDetails => ({
    cards: p.capturedCards.length,
    oros: p.capturedCards.filter(c => c.suit === 'Oros').length,
    sevens: p.capturedCards.filter(c => c.rank === 7).length,
    sevenOfOros: p.capturedCards.some(c => c.suit === 'Oros' && c.rank === 7),
    escobas: p.escobas,
    points: 0
  });

  const p = getDetails(player);
  const c = getDetails(cpu);

  if (p.cards > c.cards) p.points++; else if (c.cards > p.cards) c.points++;
  if (p.oros > c.oros) p.points++; else if (c.oros > p.oros) c.points++;
  if (p.sevens > c.sevens) p.points++; else if (c.sevens > p.sevens) c.points++;
  if (p.sevenOfOros) p.points++;
  if (c.sevenOfOros) c.points++;
  p.points += p.escobas;
  c.points += c.escobas;

  return { playerDetails: p, cpuDetails: c };
};
