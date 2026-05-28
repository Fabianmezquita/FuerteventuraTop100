/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity } from './types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: 'Award' | 'Compass' | 'Zap' | 'Leaf' | 'Trophy' | 'Crown' | 'Sparkles' | 'MapPin';
  colorClass: string;         // e.g., 'text-amber-500 bg-amber-50 border-amber-200'
  colorClassDark: string;     // for progress fills, e.g., 'bg-amber-500'
  ringClass: string;          // e.g., 'ring-amber-200'
  getTarget: () => number;
  getCurrent: (completedIds: string[], xp: number, activities: Activity[]) => number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Primer Paso',
    description: 'Completa tu primera experiencia en la isla.',
    iconName: 'Award',
    colorClass: 'text-amber-600 bg-amber-50/75 border-amber-200',
    colorClassDark: 'bg-amber-500',
    ringClass: 'ring-amber-150',
    getTarget: () => 1,
    getCurrent: (completedIds) => completedIds.length,
  },
  {
    id: 'ocio_veteran',
    title: 'Maestro del Ocio',
    description: 'Completa 10 actividades en la categoría OCIO.',
    iconName: 'Compass',
    colorClass: 'text-rose-600 bg-rose-50/75 border-rose-200',
    colorClassDark: 'bg-rose-500',
    ringClass: 'ring-rose-150',
    getTarget: () => 10,
    getCurrent: (completedIds, xp, activities) => {
      const ocioIds = activities.filter(a => a.category === 'OCIO').map(a => a.id);
      return completedIds.filter(id => ocioIds.includes(id)).length;
    }
  },
  {
    id: 'deporte_veteran',
    title: 'Titán del Deporte',
    description: 'Completa 10 actividades en la categoría DEPORTE.',
    iconName: 'Zap',
    colorClass: 'text-indigo-600 bg-indigo-50/75 border-indigo-200',
    colorClassDark: 'bg-indigo-500',
    ringClass: 'ring-indigo-150',
    getTarget: () => 10,
    getCurrent: (completedIds, xp, activities) => {
      const depIds = activities.filter(a => a.category === 'DEPORTE').map(a => a.id);
      return completedIds.filter(id => depIds.includes(id)).length;
    }
  },
  {
    id: 'naturaleza_veteran',
    title: 'Guardián Salvaje',
    description: 'Completa 10 actividades en la categoría NATURALEZA.',
    iconName: 'Leaf',
    colorClass: 'text-emerald-600 bg-emerald-50/75 border-emerald-200',
    colorClassDark: 'bg-emerald-500',
    ringClass: 'ring-emerald-150',
    getTarget: () => 10,
    getCurrent: (completedIds, xp, activities) => {
      const natIds = activities.filter(a => a.category === 'NATURALEZA').map(a => a.id);
      return completedIds.filter(id => natIds.includes(id)).length;
    }
  },
  {
    id: 'explorer_25',
    title: 'Gran Explorador',
    description: 'Completa un cuarto del reto total (25 experiencias).',
    iconName: 'MapPin',
    colorClass: 'text-teal-600 bg-teal-50/75 border-teal-200',
    colorClassDark: 'bg-teal-500',
    ringClass: 'ring-teal-150',
    getTarget: () => 25,
    getCurrent: (completedIds) => completedIds.length,
  },
  {
    id: 'halfway',
    title: 'Mitad del Camino',
    description: 'Completa el 50% de las 100 experiencias de la isla.',
    iconName: 'Trophy',
    colorClass: 'text-violet-600 bg-violet-50/75 border-violet-200',
    colorClassDark: 'bg-violet-500',
    ringClass: 'ring-violet-150',
    getTarget: () => 50,
    getCurrent: (completedIds) => completedIds.length,
  },
  {
    id: 'xp_collector',
    title: 'Coleccionista de XP',
    description: 'Consigue tu primer hito de gloria acumulando 5,000 XP.',
    iconName: 'Sparkles',
    colorClass: 'text-cyan-600 bg-cyan-50/75 border-cyan-200',
    colorClassDark: 'bg-cyan-500',
    ringClass: 'ring-cyan-150',
    getTarget: () => 5000,
    getCurrent: (completedIds, xp) => xp,
  },
  {
    id: 'islander_legend',
    title: 'Leyenda de Fuerteventura',
    description: 'Alcanza la gloria completando las 100 experiencias del reto.',
    iconName: 'Crown',
    colorClass: 'text-[#00696b] bg-[#00ced1]/5 border-[#00ced1]/30',
    colorClassDark: 'bg-[#00696b]',
    ringClass: 'ring-[#00ced1]/20',
    getTarget: () => 100,
    getCurrent: (completedIds) => completedIds.length,
  }
];

export function getUnlockedAchievements(completedIds: string[], xp: number, activities: Activity[]): string[] {
  return ACHIEVEMENTS.filter(ach => {
    const current = ach.getCurrent(completedIds, xp, activities);
    const target = ach.getTarget();
    return current >= target;
  }).map(ach => ach.id);
}

export function checkNewUnlocks(
  oldCompleted: string[],
  oldXp: number,
  newCompleted: string[],
  newXp: number,
  activities: Activity[]
): Achievement[] {
  const previouslyUnlocked = getUnlockedAchievements(oldCompleted, oldXp, activities);
  const nowUnlocked = getUnlockedAchievements(newCompleted, newXp, activities);

  const newlyUnlockedIds = nowUnlocked.filter(id => !previouslyUnlocked.includes(id));
  return ACHIEVEMENTS.filter(ach => newlyUnlockedIds.includes(ach.id));
}
