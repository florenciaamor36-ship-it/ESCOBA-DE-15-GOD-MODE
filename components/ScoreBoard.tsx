
import React from 'react';
import { ScoringDetails } from '../types';
import { motion } from 'framer-motion';

interface ScoreBoardProps {
  playerDetails: ScoringDetails;
  cpuDetails: ScoringDetails;
  onNextRound: () => void;
  totalPlayerPoints: number;
  totalCpuPoints: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  playerDetails, 
  cpuDetails, 
  onNextRound, 
  totalPlayerPoints, 
  totalCpuPoints 
}) => {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[150] backdrop-blur-3xl p-4 sm:p-6 overflow-y-auto hide-scrollbar">
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="bg-[#011a14] border-[2px] sm:border-[4px] border-amber-500/40 rounded-[40px] sm:rounded-[80px] p-6 sm:p-16 max-w-3xl w-full shadow-2xl relative paper-texture my-auto"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
        
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-black px-8 sm:px-16 py-2 sm:py-4 rounded-full uppercase text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] shadow-xl z-20">
            RESULTADOS
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 mt-8 sm:mt-12">
          <div className="space-y-4 sm:space-y-6 relative">
            <div className="absolute -inset-2 sm:-inset-4 bg-amber-500/5 rounded-[20px] sm:rounded-[40px] -z-10 ring-1 ring-amber-500/20"></div>
            <h3 className="text-center text-amber-500 font-serif font-black italic border-b border-amber-500/30 pb-3 sm:pb-5 text-xl sm:text-2xl">Jugador</h3>
            <StatRow label="Cartas" val={playerDetails.cards} />
            <StatRow label="Oros" val={playerDetails.oros} />
            <StatRow label="Sietes" val={playerDetails.sevens} />
            <StatRow label="7 de Oros" val={playerDetails.sevenOfOros ? 'SÍ' : 'NO'} />
            <StatRow label="Escobas" val={playerDetails.escobas} highlight />
            <div className="text-4xl sm:text-6xl font-serif text-amber-500 font-black text-center pt-4 sm:pt-8 border-t border-white/10">
              +{playerDetails.points}
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6 opacity-60 relative">
            <div className="absolute -inset-2 sm:-inset-4 bg-white/5 rounded-[20px] sm:rounded-[40px] -z-10 ring-1 ring-white/10"></div>
            <h3 className="text-center text-slate-400 font-serif font-black italic border-b border-white/10 pb-3 sm:pb-5 text-xl sm:text-2xl">CPU</h3>
            <StatRow label="Cartas" val={cpuDetails.cards} />
            <StatRow label="Oros" val={cpuDetails.oros} />
            <StatRow label="Sietes" val={cpuDetails.sevens} />
            <StatRow label="7 de Oros" val={cpuDetails.sevenOfOros ? 'SÍ' : 'NO'} />
            <StatRow label="Escobas" val={cpuDetails.escobas} />
            <div className="text-4xl sm:text-6xl font-serif text-white/30 font-black text-center pt-4 sm:pt-8 border-t border-white/10">
              +{cpuDetails.points}
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-16 pt-6 sm:pt-12 border-t border-white/5 flex flex-col items-center gap-6 sm:gap-12">
          <div className="flex justify-around w-full items-center bg-black/40 py-4 sm:py-8 rounded-[20px] sm:rounded-[40px] border border-white/5">
            <div className="text-center px-4 sm:px-10">
              <p className="text-[8px] sm:text-[10px] text-amber-500 uppercase font-black mb-1 sm:mb-2 tracking-widest">TOTAL JUGADOR</p>
              <p className="text-3xl sm:text-6xl font-serif font-black text-white">{totalPlayerPoints}</p>
            </div>
            <div className="h-10 sm:h-20 w-px bg-white/10"></div>
            <div className="text-center px-4 sm:px-10">
              <p className="text-[8px] sm:text-[10px] text-white/20 uppercase font-black mb-1 sm:mb-2 tracking-widest">TOTAL CPU</p>
              <p className="text-3xl sm:text-6xl font-serif font-black text-white/30">{totalCpuPoints}</p>
            </div>
          </div>
          
          <button 
            onClick={onNextRound}
            className="w-full bg-amber-500 hover:bg-[#f3cc4a] text-black font-black py-4 sm:py-7 rounded-[20px] sm:rounded-[40px] shadow-xl transition-all active:scale-95 uppercase tracking-widest text-base sm:text-xl gold-border"
          >
            CONTINUAR
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const StatRow: React.FC<{ label: string; val: string | number; highlight?: boolean }> = ({ label, val, highlight }) => (
  <div className={`flex justify-between items-center text-xs py-2 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all ${highlight ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-black/30 text-white/50 border border-white/5'}`}>
    <span className="font-black uppercase tracking-widest text-[8px] sm:text-[10px]">{label}</span>
    <span className="font-black font-serif text-base sm:text-xl">{val}</span>
  </div>
);

export default ScoreBoard;
