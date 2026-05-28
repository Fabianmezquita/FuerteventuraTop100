/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Map, CheckSquare } from 'lucide-react';

export type ViewType = 'HOME' | 'MAP' | 'CHECKLIST';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 pb-safe bg-white/70 backdrop-blur-xl shadow-[0_-4px_20px_rgba(54,69,79,0.08)] rounded-t-2xl border-t border-neutral-100">
      {/* Home Link */}
      <button 
        onClick={() => onViewChange('HOME')}
        className={`flex flex-col md:flex-row items-center justify-center gap-1 transition-all focus:outline-none active:scale-90 ${
          currentView === 'HOME'
            ? 'bg-[#00ced1]/15 text-[#00696b] rounded-full px-6 py-2 font-bold scale-100'
            : 'text-neutral-500 hover:text-neutral-800 rounded-full px-4 py-2 font-medium scale-95'
        }`}
      >
        <Home className={`w-5 h-5 ${currentView === 'HOME' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[11px] md:text-xs">Home</span>
      </button>

      {/* Map Link */}
      <button 
        onClick={() => onViewChange('MAP')}
        className={`flex flex-col md:flex-row items-center justify-center gap-1 transition-all focus:outline-none active:scale-90 ${
          currentView === 'MAP'
            ? 'bg-[#00ced1]/15 text-[#00696b] rounded-full px-6 py-2 font-bold scale-100'
            : 'text-neutral-500 hover:text-neutral-800 rounded-full px-4 py-2 font-medium scale-95'
        }`}
      >
        <Map className={`w-5 h-5 ${currentView === 'MAP' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[11px] md:text-xs">Map</span>
      </button>

      {/* Checklist Link */}
      <button 
        onClick={() => onViewChange('CHECKLIST')}
        className={`flex flex-col md:flex-row items-center justify-center gap-1 transition-all focus:outline-none active:scale-90 ${
          currentView === 'CHECKLIST'
            ? 'bg-[#00ced1]/15 text-[#00696b] rounded-full px-6 py-2 font-bold scale-100'
            : 'text-neutral-500 hover:text-neutral-800 rounded-full px-4 py-2 font-medium scale-95'
        }`}
      >
        <CheckSquare className={`w-5 h-5 ${currentView === 'CHECKLIST' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[11px] md:text-xs">Checklist</span>
      </button>
    </nav>
  );
}
