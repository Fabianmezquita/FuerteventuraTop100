/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity, Category, UserProfile } from '../types';
import { Check, Flame, Trophy, Award, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChecklistViewProps {
  activities: Activity[];
  currentUser: UserProfile | null;
  onToggleComplete: (activityId: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onOpenAuth: () => void;
}

export default function ChecklistView({ 
  activities, 
  currentUser, 
  onToggleComplete, 
  onSelectActivity, 
  onOpenAuth 
}: ChecklistViewProps) {
  const [activeTab, setActiveTab] = useState<'TODAS' | Category>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  // Count items globally vs completed
  const totalCount = activities.length;
  const completedCount = currentUser ? currentUser.completedIds.filter(id => activities.some(a => a.id === id)).length : 0;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter activities based on tab and optional search query
  const filteredActivities = activities.filter(activity => {
    const matchesTab = activeTab === 'TODAS' || activity.category === activeTab;
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          activity.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Group filtered activities by category
  const categories: Category[] = ['OCIO', 'DEPORTE', 'NATURALEZA'];

  const getCategoryCount = (cat: Category) => {
    return activities.filter(a => a.category === cat).length;
  };

  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case 'OCIO': return 'bg-amber-500';
      case 'DEPORTE': return 'bg-cyan-400';
      case 'NATURALEZA': return 'bg-emerald-500';
    }
  };

  const getActNumber = (id: string) => {
    return parseInt(id.replace('act_', ''), 10);
  };

  return (
    <div className="flex-grow max-w-4xl mx-auto px-margin-mobile py-6 w-full pb-32">
      {/* Progress Card Section */}
      <section className="mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-neutral-100/70 border border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100/30 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
          <div className="flex-grow z-10">
            <h2 className="font-headline-md text-2xl text-neutral-900 font-bold tracking-tight mb-1">
              Tu Progreso
            </h2>
            <p className="text-sm font-medium text-neutral-500">
              {currentUser 
                ? `${completedCount} de ${totalCount} actividades completadas` 
                : 'Inicia sesión para guardar tu progreso de forma permanente'}
            </p>
            <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-gradient-to-r from-[#00ced1] to-[#00696b] transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-shrink-0 z-10">
            <div className="text-right">
              <span className="font-display-lg text-5xl font-black text-[#00696b] tracking-tighter leading-none block">
                {progressPercentage}%
              </span>
              <span className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">actividades</span>
            </div>
            {currentUser && (
              <div className="bg-amber-100 text-amber-900 px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-amber-200">
                <Trophy className="w-5 h-5 text-amber-600 fill-amber-500" />
                <div className="text-left leading-none">
                  <span className="text-[10px] font-bold block opacity-60">LEVEL {Math.floor(currentUser.xp / 100) + 1}</span>
                  <span className="font-bold text-sm tracking-tight">{currentUser.xp} XP</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation tab bar & Search combo */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
          <button 
            onClick={() => setActiveTab('TODAS')}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all focus:outline-none whitespace-nowrap active:scale-95 ${
              activeTab === 'TODAS'
                ? 'bg-[#00696b] text-white shadow-md'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all focus:outline-none whitespace-nowrap active:scale-95 ${
                activeTab === cat
                  ? 'bg-[#00696b] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="relative w-full sm:w-64 flex-shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar actividad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 bg-white rounded-full text-sm text-neutral-900 focus:outline-none focus:border-[#00696b] focus:ring-1 focus:ring-[#00696b] transition-all"
          />
        </div>
      </div>

      {/* Grouped / Flat Integrated Checklist Activities */}
      <div className="space-y-8">
        {activeTab === 'TODAS' ? (
          filteredActivities.length > 0 && (
            <div className="category-section">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-[#00696b] rounded-full"></div>
                <h3 className="font-headline-md text-xl text-neutral-800 font-bold flex items-center gap-2">
                  Las 100 Experiencias
                  <span className="text-xs font-semibold text-neutral-400 px-2.5 py-0.5 bg-neutral-100 rounded-full">
                    {filteredActivities.length} items
                  </span>
                </h3>
              </div>

              <div className="grid gap-4">
                {[...filteredActivities]
                  .sort((a, b) => getActNumber(a.id) - getActNumber(b.id))
                  .map((act) => {
                    const isCompleted = currentUser?.completedIds.includes(act.id) || false;
                    const actNumber = getActNumber(act.id);

                    return (
                      <div 
                        key={act.id}
                        className={`group flex items-center gap-4 bg-white p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                          isCompleted 
                            ? 'border-neutral-200/80 bg-neutral-50/50 shadow-sm' 
                            : 'border-neutral-100 shadow-sm hover:translate-y-[-2px] hover:shadow-md'
                        }`}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('.checkbox-trigger')) return;
                          onSelectActivity(act);
                        }}
                      >
                        {/* Image Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                          <img 
                            alt={act.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            src={act.imageUrl} 
                          />
                          {isCompleted && (
                            <div className="absolute inset-0 bg-[#00696b]/15 flex items-center justify-center backdrop-blur-3xs">
                              <span className="p-1 bg-emerald-500 rounded-full text-white text-[10px] shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info Text */}
                        <div className="flex-grow">
                          <h4 className={`text-base font-bold leading-tight transition-colors ${
                            isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-900 group-hover:text-[#00696b]'
                          }`}>
                            <span className="font-mono text-[#00696b] font-bold mr-1.5">{actNumber}.</span>
                            {act.title}
                          </h4>
                          <p className="text-xs font-semibold text-neutral-400 mt-0.5">
                            {act.location}
                          </p>
                        </div>

                        {/* Interactive Checkbox Control */}
                        <div className="checkbox-trigger flex-shrink-0 pr-2">
                          <button
                            onClick={() => {
                              if (!currentUser) {
                                onOpenAuth();
                              } else {
                                onToggleComplete(act.id);
                              }
                            }}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all focus:outline-none ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white scale-100 shadow-sm shadow-emerald-200'
                                : 'bg-white border-neutral-200 text-transparent hover:border-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )
        ) : (
          categories.map(cat => {
            const catActivities = filteredActivities.filter(a => a.category === cat);
            if (catActivities.length === 0) return null;

            return (
              <div key={cat} className="category-section">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-1.5 h-6 ${getCategoryColor(cat)} rounded-full`}></div>
                  <h3 className="font-headline-md text-xl text-neutral-800 font-bold flex items-center gap-2">
                    {cat} 
                    <span className="text-xs font-semibold text-neutral-400 px-2.2 py-0.5 bg-neutral-100 rounded-full">
                      {getCategoryCount(cat)} items
                    </span>
                  </h3>
                </div>

                <div className="grid gap-4">
                  {catActivities.map((act) => {
                    const isCompleted = currentUser?.completedIds.includes(act.id) || false;
                    const actNumber = getActNumber(act.id);

                    return (
                      <div 
                        key={act.id}
                        className={`group flex items-center gap-4 bg-white p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                          isCompleted 
                            ? 'border-neutral-200/80 bg-neutral-50/50 shadow-sm' 
                            : 'border-neutral-100 shadow-sm hover:translate-y-[-2px] hover:shadow-md'
                        }`}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('.checkbox-trigger')) return;
                          onSelectActivity(act);
                        }}
                      >
                        {/* Image Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                          <img 
                            alt={act.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            src={act.imageUrl} 
                          />
                          {isCompleted && (
                            <div className="absolute inset-0 bg-[#00696b]/15 flex items-center justify-center backdrop-blur-3xs">
                              <span className="p-1 bg-emerald-500 rounded-full text-white text-[10px] shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info Text */}
                        <div className="flex-grow">
                          <h4 className={`text-base font-bold leading-tight transition-colors ${
                            isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-900 group-hover:text-[#00696b]'
                          }`}>
                            <span className="font-mono text-[#00696b] font-bold mr-1.5">{actNumber}.</span>
                            {act.title}
                          </h4>
                          <p className="text-xs font-semibold text-neutral-400 mt-0.5">
                            {act.location}
                          </p>
                        </div>

                        {/* Interactive Checkbox Control */}
                        <div className="checkbox-trigger flex-shrink-0 pr-2">
                          <button
                            onClick={() => {
                              if (!currentUser) {
                                onOpenAuth();
                              } else {
                                onToggleComplete(act.id);
                              }
                            }}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all focus:outline-none ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white scale-100 shadow-sm shadow-emerald-200'
                                : 'bg-white border-neutral-200 text-transparent hover:border-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {filteredActivities.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
            <span className="inline-flex p-3 bg-neutral-50 rounded-full text-neutral-400 mb-2">
              <Search className="w-8 h-8" />
            </span>
            <p className="text-neutral-600 font-medium">No se encontraron actividades matching "{searchQuery}"</p>
            <p className="text-xs text-neutral-400 mt-1">Prueba reajustando tus filtros o cambiando el término de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
