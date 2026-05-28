/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Achievement } from '../achievements';
import { Award, Compass, Zap, Leaf, Trophy, Crown, Sparkles, MapPin, X, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UnlockCelebrationProps {
  achievement: Achievement | null;
  onClose: () => void;
  onViewAll: () => void;
}

const AchievementIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'Award': return <Award className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Leaf': return <Leaf className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'MapPin': return <MapPin className={className} />;
    default: return <Award className={className} />;
  }
};

export default function UnlockCelebration({ achievement, onClose, onViewAll }: UnlockCelebrationProps) {
  // Auto-close toast after 6 seconds
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-55 w-[92%] max-w-md pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: -40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="pointer-events-auto bg-neutral-900 text-white rounded-2xl shadow-2xl p-5 border border-neutral-800/80 overflow-hidden relative"
      >
        {/* Animated Glitter/Glow BG layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-violet-500/10 opacity-30 animate-pulse pointer-events-none" />

        {/* Confetti & Header Section */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-1.5 text-[#00ced1] text-xs font-black uppercase tracking-widest">
            <PartyPopper className="w-4 h-4 animate-bounce" />
            <span>¡LOGRO DESBLOQUEADO!</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Medal & Achievement details */}
        <div className="flex items-start gap-4 mt-4 relative z-10">
          {/* Animated Medal Badge */}
          <motion.div 
            initial={{ rotate: -15, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${achievement.colorClass} shadow-lg ring-4 ring-white/5`}
          >
            <AchievementIcon name={achievement.iconName} className="w-8 h-8 stroke-[2.2]" />
          </motion.div>

          <div className="flex-grow space-y-1">
            <h4 className="text-base font-extrabold tracking-tight text-white leading-tight">
              {achievement.title}
            </h4>
            <p className="text-xs text-neutral-300 leading-snug">
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex items-center gap-3 mt-4 pt-1 justify-end relative z-10">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 hover:bg-white/5 text-neutral-300 hover:text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all"
          >
            Entendido
          </button>
          
          <button
            onClick={() => {
              onViewAll();
              onClose();
            }}
            className="px-4 py-1.5 bg-[#00ced1] hover:bg-[#00b2b5] text-neutral-950 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            Ver mis Medallas
          </button>
        </div>
      </motion.div>
    </div>
  );
}
