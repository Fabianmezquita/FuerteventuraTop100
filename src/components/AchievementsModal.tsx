/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ACHIEVEMENTS, Achievement } from '../achievements';
import { Activity, UserProfile } from '../types';
import { 
  Award, Compass, Zap, Leaf, Trophy, Crown, Sparkles, MapPin, 
  Lock, Check, X, ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  activities: Activity[];
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

export default function AchievementsModal({ isOpen, onClose, currentUser, activities }: AchievementsModalProps) {
  if (!isOpen) return null;

  const completedIds = currentUser?.completedIds || [];
  const xp = currentUser?.xp || 0;

  // Calculate unlocked achievements count
  const unlockedCount = ACHIEVEMENTS.filter(ach => {
    const current = ach.getCurrent(completedIds, xp, activities);
    const target = ach.getTarget();
    return current >= target;
  }).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      id="achievements-modal-overlay"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'achievements-modal-overlay') onClose();
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 flex flex-col relative max-h-[90vh]"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-[#00696b]/5 to-[#00ced1]/5 border-b border-neutral-150 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-headline-md text-2xl font-bold text-neutral-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#00696b]" />
                Templo de Trofeos Fuerteventura
              </h3>
              <p className="text-[#3b4949] text-sm mt-1">
                Completa actividades por toda la isla de Fuerteventura para desbloquear medallas exclusivas.
              </p>
            </div>
            
            {/* Completion Badge Count */}
            <div className="flex-shrink-0 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#00ced1]/20 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00ced1]/10 flex items-center justify-center text-[#00696b] font-black text-lg">
                {unlockedCount}
              </div>
              <div>
                <p className="text-[10px] font-black text-[#566565] uppercase tracking-wider">Logros</p>
                <p className="text-xs font-bold text-neutral-800">{unlockedCount} / {ACHIEVEMENTS.length} Desbloqueados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body / Scrollable Grid */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-6">
          {!currentUser ? (
            <div className="text-center py-12 px-4 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
              <ShieldAlert className="w-12 h-12 text-[#9da9a9] mx-auto mb-3" />
              <h4 className="text-lg font-bold text-neutral-800">Inicia sesión para ver tus logros</h4>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto mt-1">
                Crea una cuenta o inicia sesión para registrar tus actividades completadas y ganar medallas únicas de explorador.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {ACHIEVEMENTS.map((ach) => {
                const current = ach.getCurrent(completedIds, xp, activities);
                const target = ach.getTarget();
                const isUnlocked = current >= target;
                const progressPct = Math.min(100, Math.round((current / target) * 100));

                return (
                  <div 
                    key={ach.id}
                    className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                      isUnlocked 
                        ? 'bg-white border-neutral-200/80 shadow-sm' 
                        : 'bg-neutral-50/70 border-neutral-100 opacity-85'
                    }`}
                  >
                    {/* Header of card */}
                    <div className="flex items-start gap-3.5">
                      {/* Icon Circle */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 transition-transform duration-500 ${
                        isUnlocked 
                          ? `${ach.colorClass} shadow-sm group-hover:scale-105` 
                          : 'bg-neutral-200/60 border-neutral-350 text-neutral-500'
                      }`}>
                        <AchievementIcon name={ach.iconName} className="w-6 h-6 stroke-[2.2]" />
                      </div>

                      {/* Content details */}
                      <div className="flex-grow space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-sm font-extrabold leading-tight ${
                            isUnlocked ? 'text-neutral-900' : 'text-neutral-500'
                          }`}>
                            {ach.title}
                          </h4>
                          
                          {/* Locked/Unlocked Visual Pin */}
                          {isUnlocked ? (
                            <span className="flex items-center justify-center w-5 h-5 bg-emerald-500 rounded-full text-white text-[10px] shadow-sm flex-shrink-0 animate-pulse">
                              <Check className="w-3 h-3 stroke-[3.5]" />
                            </span>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-[#566565] leading-snug">
                          {ach.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Slider (Only if not unlocked, or nice fill line for completeness) */}
                    <div className="mt-4 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                        <span>Progreso</span>
                        <span className="font-mono font-bold text-neutral-600">
                          {isUnlocked ? 'Desbloqueado' : `${current.toLocaleString()} / ${target.toLocaleString()}`}
                        </span>
                      </div>
                      
                      {/* Bar Wrapper */}
                      <div className="w-full h-2 bg-neutral-200/70 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full ${isUnlocked ? ach.colorClassDark : 'bg-neutral-400'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Cerrar Sala
          </button>
        </div>
      </motion.div>
    </div>
  );
}
