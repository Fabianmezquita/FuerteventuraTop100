/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Activity, UserProfile } from '../types';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Clock, 
  Compass, 
  Camera, 
  MapPin, 
  Check, 
  Trophy, 
  Star,
  Sparkles,
  Waves,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DetailViewProps {
  activity: Activity;
  currentUser: UserProfile | null;
  onBack: () => void;
  onToggleComplete: (activityId: string) => void;
  onOpenAuth: () => void;
}

export default function DetailView({ 
  activity, 
  currentUser, 
  onBack, 
  onToggleComplete, 
  onOpenAuth 
}: DetailViewProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; delay: number }>>([]);
  
  const isCompleted = currentUser?.completedIds.includes(activity.id) || false;

  const handleCompleteClick = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    onToggleComplete(activity.id);

    // If marking as completed, trigger confetti celebration
    if (!isCompleted) {
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    const colors = ['#00ced1', '#feac67', '#00696b', '#ffb77d', '#5af8fb'];
    const p = Array.from({ length: 45 }).map((_, i) => ({
      id: Math.random() + i,
      x: 35 + Math.random() * 30, // center-ish percentage
      y: 70 + Math.random() * 20, // button position height
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 8,
      delay: Math.random() * 0.2
    }));
    setConfettiParticles(p);

    // Clean up particles
    setTimeout(() => {
      setConfettiParticles([]);
    }, 2500);
  };

  const sharePlaceholder = () => {
    if (navigator.share) {
      navigator.share({
        title: activity.title,
        text: activity.shortDescription,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert(`Enlace copiado para compartir: ${activity.title} - ${activity.location}`);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Baja': return 'text-emerald-600 bg-emerald-50';
      case 'Media': return 'text-amber-600 bg-amber-50';
      case 'Alta': return 'text-red-600 bg-red-50';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const openGoogleMaps = () => {
    const query = encodeURIComponent(`${activity.title}, Fuerteventura`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Gallery items - use defaults if activity doesn't have 4 gallery images
  const defaultGallery = [
    activity.imageUrl,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCY8nV5z8PXcGG1fI9tiGeLcmoZrRlG1nGETJroRfkzgf-7fE-u_ya1-kqYUJZtpLLUSGFhz0ovjfWWECMRfXnCsG3dEZN47FdhwR9yA_ucJcXFf_XzJ5Xvkqn4IYtV28kxEJ2nkc5VXsxtKkzAcfxqgK2y6tdS75Vv9kw9044md-dOelfALa9ejdRGr0Fg-OK-OWbQqzGGFrKei5gj4ojSObL-ZCeRgxrifMdm8rcfZQ0AGMrLcxDFeftf5MPngPlVzie5ouqvbFud',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAyRLNClq4tC7SbeWh00lTOkRQHyZIeXpu4IjJRSdHh9Z96293swqxYu0iLbIECdd1IsLhXoXlt68w_dbV-EGiVoam_rf4IT0hiIppMlukC2TKJLNBCnnTFa7V5zSLPOGWjZZa4KUZVOJypmwgH8gRO9iXybyAZInm1PKMdCoo-fDTngyGOBswZAwX17jtRJncwu-95OkXu33phm7qmvEXjP2XxmeJwOSGepSOgaHJGo5i0f7bk_GEcdhhawUrsW4_-z97GfWItOjU',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA7K5tpjIr8-xPIHyzR6TokTLteRDtbPkt4hS9BwPaAa9geybK9U4iUgembO3WDswa4V4tY36dxoLJXYd8vqwDA4P4GMBXmL0hN5Ksye1u38HiOeJLV0Rf-Iru4fI9TxMX_CoE4T4kNxkqG6FzmiqL9NeYXNTC5_nnUvIWi16hXkw1vgQ165yxjKWLQmsaKJ0y1WTGc5aFUwP4UA6q4MB6PESvwCdHQoipMM7BndMndAJFzrOhpLfOJskdF0Ul3yiV4dCmsxY4t2Rp7'
  ];

  const displayGallery = activity.galleryUrls && activity.galleryUrls.length >= 4 
    ? activity.galleryUrls 
    : [
        activity.imageUrl, 
        defaultGallery[1], 
        defaultGallery[2], 
        defaultGallery[3]
      ];

  return (
    <div className="flex-grow pb-32">
      {/* 1. Hero Section with Spectacular Backdrop */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <img 
          className="w-full h-full object-cover" 
          src={activity.imageUrl} 
          alt={activity.title}
        />
        
        {/* Top Floating Icons Overlay */}
        <div className="absolute top-0 left-0 w-full p-margin-mobile md:p-margin-desktop flex justify-between items-start z-10">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-black/25 backdrop-blur-md rounded-full text-white hover:bg-black/45 transition-all active:scale-95 border border-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={sharePlaceholder}
              className="w-12 h-12 flex items-center justify-center bg-black/25 backdrop-blur-md rounded-full text-white hover:bg-black/45 transition-all border border-white/20"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-12 h-12 flex items-center justify-center bg-black/25 backdrop-blur-md rounded-full text-white hover:bg-black/45 transition-all border border-white/20"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero Text Info Overlay with gradient backdrop */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent p-margin-mobile md:p-margin-desktop text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#00696b] text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Compass className="w-3.5 h-3.5" />
              {activity.category}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold">
              {activity.location}
            </span>
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-3xl md:text-4xl font-extrabold tracking-tight leading-tight max-w-2xl drop-shadow-sm">
            <span className="font-mono text-[#00ced1] mr-2">{parseInt(activity.id.replace('act_', ''), 10)}.</span>
            {activity.title}
          </h1>
        </div>
      </section>

      {/* 2. Main Description Section */}
      <main className="px-margin-mobile md:px-margin-desktop -mt-8 relative z-20 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-neutral-100 flex flex-col gap-8">
          
          {/* Grid Stats */}
          <div className="grid grid-cols-3 gap-4 pb-6 border-b border-neutral-100 text-center">
            <div className="flex flex-col items-center">
              <Clock className="w-5 h-5 text-[#00696b] mb-1.5" />
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Duración</p>
              <p className="font-semibold text-sm text-neutral-800 mt-0.5">{activity.duration}</p>
            </div>
            
            <div className="flex flex-col items-center border-x border-neutral-100">
              <Compass className="w-5 h-5 text-[#00696b] mb-1.5" />
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Dificultad</p>
              <p className="font-semibold text-sm text-neutral-800 mt-0.5">{activity.difficulty}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <Camera className="w-5 h-5 text-[#00696b] mb-1.5" />
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tipo</p>
              <p className="font-semibold text-sm text-neutral-800 mt-0.5">{activity.type}</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h2 className="font-headline-md text-xl text-neutral-900 font-bold flex items-center gap-2">
              Acerca del lugar
            </h2>
            <div className="text-neutral-600 space-y-4 leading-relaxed text-sm md:text-base">
              {activity.description.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Bento Grid Mini-Gallery */}
          <div className="space-y-3">
            <h3 className="font-headline-md text-sm text-neutral-400 uppercase tracking-wider font-bold">Galería Aventurera</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {displayGallery.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100 shadow-3xs group">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src={url} 
                    alt={`Photo gallery ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Floating Completion Trigger Pill */}
        <div className="mt-8 flex flex-col items-center gap-4 relative">
          
          {/* Canvas-less particle Confetti Rain animations */}
          {confettiParticles.map((part) => (
            <motion.div
              key={part.id}
              initial={{ 
                x: `${part.x}%`, 
                y: `${part.y}%`, 
                opacity: 1, 
                scale: 1,
                rotate: 0 
              }}
              animate={{ 
                x: `${part.x + (Math.random() * 40 - 20)}%`, 
                y: `${part.y - (100 + Math.random() * 150)}%`, 
                opacity: 0, 
                scale: 0.3,
                rotate: Math.random() * 360 
              }}
              transition={{ duration: 1.8, delay: part.delay, ease: 'easeOut' }}
              className="absolute z-40 pointer-events-none rounded-sm"
              style={{
                width: part.size,
                height: part.size,
                backgroundColor: part.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}

          <button
            onClick={handleCompleteClick}
            className={`w-full md:max-w-md flex items-center justify-between p-1.5 pr-6 rounded-full shadow-lg transition-all active:scale-95 focus:outline-none border-2 h-16 ${
              isCompleted 
                ? 'bg-[#8d4f11] border-[#8d4f11] text-white shadow-[#8d4f11]/10' 
                : 'bg-white border-[#00ced1] text-[#00696b] shadow-neutral-200/50 hover:shadow-xl hover:translate-y-[-1px]'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isCompleted ? 'bg-white/20 text-white' : 'bg-[#00ced1]/15 text-[#00696b]'
            }`}>
              <Check className={`w-6 h-6 stroke-[3] ${isCompleted ? 'scale-110' : ''}`} />
            </div>
            
            <span className="font-extrabold text-sm tracking-widest uppercase flex items-center gap-2">
              {isCompleted ? '¡COMPLETADO CON ÉXITO!' : 'Marcar como Completado'}
              {isCompleted && <Sparkles className="w-4 h-4 fill-white" />}
            </span>
            
            <div className="w-6 h-6 flex items-center justify-center">
              <Trophy className={`w-5 h-5 ${isCompleted ? 'text-amber-300 fill-amber-400' : 'text-neutral-300'}`} />
            </div>
          </button>
          
          <p className="text-xs font-semibold text-neutral-400 italic text-center min-h-[16px]">
            {isCompleted ? '¡Has ganado +50 XP por este logro!' : 'Ganarás +50 XP por este hito'}
          </p>
        </div>
      </main>

      {/* 4. Map Preview Section */}
      <section className="mt-10 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
        <div 
          onClick={openGoogleMaps}
          className="w-full h-48 rounded-2xl overflow-hidden shadow-md relative border border-neutral-100 group cursor-pointer"
        >
          <img 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNkDWN6AH2WXarpaN47uf1kk8wHWvsELxNYMVRA3DinMBFtMv5vkBg11f4sin1ckTjffmvsvvP5tEpD7uepj-aN09G-G0JfUPkV1xKk4sv81jfaxrVoS4xtEsPahPPmibnL4eVwKAkFBABmtUpNZQTtcNohwY-_koxyUvd2P-rkqHN0NI3JawHopMsXhrBzYdTy5cBQjsjJ5dpx9ryHY_MiIMLDuhFxZd_it6SmLPgaYqj9kKa0iWQUenTTITdg85RcJK9eEtmyIhW" 
            alt="Map coordinates"
          />
          <div className="absolute inset-0 bg-neutral-950/15 flex items-center justify-center transition-colors group-hover:bg-neutral-950/20">
            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 shadow-lg border border-neutral-200/55 transform transition-transform group-hover:scale-105 duration-300">
              <MapPin className="w-5 h-5 text-[#00696b] fill-[#00ced1]/25" />
              <span className="font-bold text-sm text-neutral-950">Abrir en Mapas</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
