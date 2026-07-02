
import React from 'react';
import { motion } from 'framer-motion';
import { Card, Suit } from '../types';

interface PlayingCardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  layoutId?: string;
}

const SpanishSuit: React.FC<{ suit: Suit; size?: string }> = ({ suit, size = "w-full h-full" }) => {
  switch (suit) {
    case 'Oros':
      return (
        <svg viewBox="0 0 100 100" className={size}>
          <defs>
            <linearGradient id="goldBeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#926d00" />
            </linearGradient>
            <filter id="inset-shadow">
              <feOffset dx="1" dy="1" />
              <feGaussianBlur stdDeviation="1" result="offset-blur" />
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
              <feFlood floodColor="black" floodOpacity=".3" result="color" />
              <feComposite operator="in" in="color" in2="inverse" result="shadow" />
              <feComponentTransfer in="shadow" result="shadow">
                <feFuncA type="linear" slope=".5" />
              </feComponentTransfer>
              <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#goldBeam)" stroke="#422006" strokeWidth="2" filter="url(#inset-shadow)" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#713f12" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="14" fill="#ca8a04" stroke="#422006" strokeWidth="1" />
          <path d="M50 20 L50 80 M20 50 L80 50" stroke="#422006" strokeWidth="0.5" opacity="0.4" />
        </svg>
      );
    case 'Copas':
      return (
        <svg viewBox="0 0 100 100" className={size}>
          <path d="M25 15 H75 V40 C75 60 55 65 50 65 C45 65 25 60 25 40 Z" fill="#b91c1c" stroke="#450a0a" strokeWidth="2.5" />
          <path d="M40 65 V85 H30 V92 H70 V85 H60 V65" fill="#b91c1c" stroke="#450a0a" strokeWidth="2.5" />
          <path d="M30 20 H70" stroke="white" strokeWidth="1" opacity="0.2" />
          <ellipse cx="50" cy="35" rx="15" ry="6" fill="#fecaca" opacity="0.1" />
        </svg>
      );
    case 'Espadas':
      return (
        <svg viewBox="0 0 100 100" className={size}>
          <path d="M50 5 L65 45 L50 80 L35 45 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
          <path d="M50 5 V80" stroke="#0f172a" strokeWidth="0.5" />
          <rect x="25" y="75" width="50" height="8" rx="2" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          <rect x="44" y="83" width="12" height="12" rx="1" fill="#0f172a" />
          <path d="M50 15 L53 45 L50 70 L47 45 Z" fill="white" opacity="0.2" />
        </svg>
      );
    case 'Bastos':
      return (
        <svg viewBox="0 0 100 100" className={size}>
          <path d="M42 88 L58 88 L65 10 L35 10 Z" fill="#166534" stroke="#052e16" strokeWidth="3" />
          <circle cx="38" cy="25" r="4" fill="#052e16" />
          <circle cx="62" cy="40" r="4" fill="#052e16" />
          <circle cx="40" cy="55" r="5" fill="#052e16" />
          <circle cx="60" cy="70" r="4" fill="#052e16" />
          <path d="M35 15 Q50 8 65 15" fill="none" stroke="#052e16" strokeWidth="1.5" />
        </svg>
      );
  }
};

const PlayingCard: React.FC<PlayingCardProps> = ({ 
  card, onClick, disabled, hidden, selected, highlighted, layoutId 
}) => {
  const getRankDisplay = (rank: number) => {
    if (rank === 10) return 'S';
    if (rank === 11) return 'C';
    if (rank === 12) return 'R';
    return rank;
  };

  const cardClasses = `
    relative w-[65px] h-[98px] sm:w-[80px] sm:h-[120px] md:w-[96px] md:h-[144px]
    bg-[#fffcf5] border rounded-lg sm:rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] 
    flex flex-col items-center justify-between p-1 sm:p-2 md:p-3
    transition-all duration-300 cursor-pointer select-none paper-texture
    ${disabled ? 'opacity-95 pointer-events-none' : ''}
    ${selected ? 'ring-2 sm:ring-4 ring-amber-500 z-50 shadow-[0_0_30px_rgba(212,175,55,0.6)] -translate-y-4 sm:-translate-y-6' : 'border-[#e5e7eb]'}
    ${highlighted ? 'ring-2 sm:ring-4 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-40' : ''}
  `;

  if (hidden) {
    return (
      <motion.div 
        layoutId={layoutId}
        className="w-[65px] h-[98px] sm:w-[80px] sm:h-[120px] md:w-[96px] md:h-[144px] bg-[#2d0a0a] border-2 border-[#d4af37]/30 rounded-lg sm:rounded-xl shadow-xl flex items-center justify-center relative overflow-hidden paper-texture"
      >
        <div className="absolute inset-1 sm:inset-2 border border-white/5 rounded-md sm:rounded-lg"></div>
        <div className="text-amber-500/10 text-4xl sm:text-6xl">
            <i className="fa-solid fa-shield-halved"></i>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layoutId={layoutId}
      whileHover={!disabled ? { y: -10, scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={cardClasses}
    >
      <div className="self-start flex flex-col items-center leading-none">
        <span className="text-sm sm:text-lg md:text-2xl font-black text-slate-800 font-serif" style={{ letterSpacing: '-1px' }}>{getRankDisplay(card.rank)}</span>
        <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 mt-0.5"><SpanishSuit suit={card.suit} /></div>
      </div>
      
      <div className="w-8 h-8 sm:w-14 sm:h-14 md:w-20 md:h-20 flex items-center justify-center drop-shadow-lg">
        <SpanishSuit suit={card.suit} />
      </div>

      <div className="self-end flex flex-col items-center leading-none rotate-180">
        <span className="text-sm sm:text-lg md:text-2xl font-black text-slate-800 font-serif" style={{ letterSpacing: '-1px' }}>{getRankDisplay(card.rank)}</span>
        <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 mt-0.5"><SpanishSuit suit={card.suit} /></div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30px] sm:text-[60px] md:text-[90px] font-black text-black/[0.03] pointer-events-none font-serif italic select-none">
        {card.value}
      </div>
    </motion.div>
  );
};

export default PlayingCard;
