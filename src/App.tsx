/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar, { ViewType } from './components/Navbar';
import HomeView from './components/HomeView';
import MapView from './components/MapView';
import ChecklistView from './components/ChecklistView';
import DetailView from './components/DetailView';
import AuthModal from './components/AuthModal';
import AchievementsModal from './components/AchievementsModal';
import UnlockCelebration from './components/UnlockCelebration';
import { checkNewUnlocks, Achievement } from './achievements';
import { ACTIVITIES } from './data';
import { Activity, UserProfile } from './types';
import { Compass, LogOut, User, Trophy, ShieldCheck, CheckSquare, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewType>('HOME');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Authentication & Profile States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Achievements / Logros States
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [activeUnlockToast, setActiveUnlockToast] = useState<Achievement | null>(null);
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);

  // Handle Toast Queueing
  useEffect(() => {
    if (!activeUnlockToast && toastQueue.length > 0) {
      const nextToast = toastQueue[0];
      setActiveUnlockToast(nextToast);
      setToastQueue(prev => prev.slice(1));
    }
  }, [activeUnlockToast, toastQueue]);

  // Initialize Auth state from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('f100_current_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user data', e);
      }
    }
  }, []);

  // Handle successful login or registration
  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
  };

  // Toggle checklist activity completion state
  const handleToggleComplete = (activityId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    let updatedCompletedIds = [...currentUser.completedIds];
    const isAlreadyCompleted = updatedCompletedIds.includes(activityId);
    let updatedXp = currentUser.xp;

    if (isAlreadyCompleted) {
      updatedCompletedIds = updatedCompletedIds.filter(id => id !== activityId);
      updatedXp = Math.max(0, updatedXp - activity.xpAward);
    } else {
      updatedCompletedIds.push(activityId);
      updatedXp += activity.xpAward;
    }

    // Check for newly unlocked achievements
    let newlyUnlocked: Achievement[] = [];
    if (!isAlreadyCompleted) {
      newlyUnlocked = checkNewUnlocks(
        currentUser.completedIds,
        currentUser.xp,
        updatedCompletedIds,
        updatedXp,
        ACTIVITIES
      );
    }

    const updatedProfile: UserProfile = {
      ...currentUser,
      completedIds: updatedCompletedIds,
      xp: updatedXp
    };

    // Save globally in current profile session
    setCurrentUser(updatedProfile);
    localStorage.setItem('f100_current_user', JSON.stringify(updatedProfile));

    // Update inside cumulative users table
    const existingUsers = JSON.parse(localStorage.getItem('f100_users') || '[]');
    const userIndex = existingUsers.findIndex((u: any) => u.email === currentUser.email);
    if (userIndex !== -1) {
      existingUsers[userIndex] = {
        ...existingUsers[userIndex],
        completedIds: updatedCompletedIds,
        xp: updatedXp
      };
      localStorage.setItem('f100_users', JSON.stringify(existingUsers));
    }

    // Trigger visual notification of unlock
    if (newlyUnlocked.length > 0) {
      setToastQueue(prev => [...prev, ...newlyUnlocked]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('f100_current_user');
    setCurrentUser(null);
    setProfileDropdownOpen(false);
  };

  // Render the currently active subview
  const renderContentView = () => {
    switch (currentView) {
      case 'HOME':
        return (
          <HomeView 
            onStartAdventure={() => setCurrentView('CHECKLIST')}
            activities={ACTIVITIES}
            onSelectActivity={(act) => setSelectedActivity(act)}
          />
        );
      case 'MAP':
        return (
          <MapView 
            activities={ACTIVITIES}
            onSelectActivity={(act) => setSelectedActivity(act)}
          />
        );
      case 'CHECKLIST':
        return (
          <ChecklistView 
            activities={ACTIVITIES}
            currentUser={currentUser}
            onToggleComplete={handleToggleComplete}
            onSelectActivity={(act) => setSelectedActivity(act)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen flex flex-col font-sans select-none relative pb-12">
      
      {/* Dynamic Header App Bar */}
      <header className="bg-white/80 backdrop-blur-xl shadow-xs sticky top-0 z-40 flex items-center justify-between px-margin-mobile md:px-margin-desktop w-full h-16 border-b border-neutral-100">
        <div 
          onClick={() => {
            setSelectedActivity(null);
            setCurrentView('HOME');
          }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-transparent shrink-0">
            <img 
              src="/logo_f100.png" 
              alt="Fuerteventura TOP 100 Experiencias" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-sans text-lg md:text-xl font-extrabold text-[#00696b] tracking-tight">
            Fuerteventura TOP 100 Experiencias
          </h1>
        </div>

        {/* User profile actions */}
        <div className="relative">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Simple current level visual flag */}
              <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#00696b] bg-[#00ced1]/15 px-3 py-1 rounded-full border border-[#00ced1]/20">
                <Trophy className="w-3.5 h-3.5" />
                <span>Nivel {Math.floor(currentUser.xp / 100) + 1}</span>
              </div>

              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00ced1] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <img 
                  alt={currentUser.username} 
                  className="w-full h-full object-cover" 
                  src={currentUser.avatarUrl} 
                />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-4 py-2 bg-white hover:bg-neutral-50 text-[#00696b] hover:text-[#005354] border border-[#00ced1] text-xs font-bold rounded-full transition-colors cursor-pointer shadow-sm active:scale-95 duration-100 uppercase tracking-widest"
            >
              Iniciar Sesión
            </button>
          )}

          {/* User profile dropdown drawer */}
          <AnimatePresence>
            {profileDropdownOpen && currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-neutral-100 p-4 z-50 flex flex-col gap-4 text-left"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200">
                    <img 
                      alt={currentUser.username} 
                      className="w-full h-full object-cover" 
                      src={currentUser.avatarUrl} 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 leading-none">{currentUser.username}</h4>
                    <p className="text-xs text-neutral-400 mt-1 truncate max-w-[180px]">{currentUser.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tus Hitos</p>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                      <span className="text-lg font-black text-neutral-800 block">
                        {currentUser.completedIds.length}
                      </span>
                      <span className="text-[9px] text-[#3b4949] font-semibold uppercase">Completados</span>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                      <span className="text-lg font-black text-neutral-800 block">
                        {currentUser.xp}
                      </span>
                      <span className="text-[9px] text-[#3b4949] font-semibold uppercase">Puntos XP</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsAchievementsOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full py-2.5 bg-[#00696b]/5 hover:bg-[#00696b]/10 text-[#00696b] rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 border border-[#00696b]/20 transition-colors"
                >
                  <Award className="w-4 px-0.5 h-4" />
                  MIS LOGROS Y MEDALLAS
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100/80 text-red-600 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 border border-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  CERRAR SESIÓN
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main content frame with sliding page triggers */}
      <div className="flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {selectedActivity ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <DetailView 
                activity={selectedActivity}
                currentUser={currentUser}
                onBack={() => setSelectedActivity(null)}
                onToggleComplete={handleToggleComplete}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex-grow flex flex-col"
            >
              {renderContentView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent global Navigation view bar (if not viewing detail screen for maximum layout polish) */}
      {!selectedActivity && (
        <Navbar currentView={currentView} onViewChange={setCurrentView} />
      )}

      {/* Absolute auth registration modal popup flow */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal 
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      {/* Achievements / Logros Modal popup flow */}
      <AnimatePresence>
        {isAchievementsOpen && (
          <AchievementsModal
            isOpen={isAchievementsOpen}
            onClose={() => setIsAchievementsOpen(false)}
            currentUser={currentUser}
            activities={ACTIVITIES}
          />
        )}
      </AnimatePresence>

      {/* Visual notification of newly unlocked achievements toast popups */}
      <AnimatePresence>
        {activeUnlockToast && (
          <UnlockCelebration
            achievement={activeUnlockToast}
            onClose={() => setActiveUnlockToast(null)}
            onViewAll={() => setIsAchievementsOpen(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
