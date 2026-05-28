/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity } from '../types';
import { ArrowRight, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  onStartAdventure: () => void;
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
}

export default function HomeView({ onStartAdventure, activities, onSelectActivity }: HomeViewProps) {
  // Select specific trending activities to match the preview
  const trendingIds = ['act_23', 'act_18', 'act_61'];
  const trendingActivities = activities.filter(act => trendingIds.includes(act.id));

  // If we didn't find those specific ones, fall back to first 3
  const displayTrending = trendingActivities.length === 3 ? trendingActivities : activities.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-grow flex flex-col">
      {/* Hero Section with spectacular cinematic photograph of sand dunes */}
      <section className="relative h-[65vh] min-h-[480px] md:h-[70vh] w-full overflow-hidden">
        <img 
          className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none" 
          id="hero-image" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw9otEAjVsKhL_41s_AiC9NdSHwlVbMKHpjhPTlg02ORoO5WsqDuPO2QbP37h5jFIz__ZoyrNL1qksSHkWG1e-IzhZhjH1y8iO0TYza9SWGI0dSjPGrQryAl5TzXOA0H9aEZQ_bcV-75pf0SV3_ekGOYvPXDJInhMIAEB6wzX1yZAF2QL09kPuvFr5GuuGFwfG98Nfj_WJtQ5ChlqWLeO07QXUj8iRsPVTIo9TxqJKmcor_Tr76QY9TOzE805ZTtaBMzeUcryyfcge" 
          alt="Corralejo dunes cinematic shot"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-margin-mobile md:p-margin-desktop pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            id="content-card"
            className="bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl max-w-xl shadow-xl border border-white/40"
          >
            <h2 className="font-headline-lg-mobile md:font-display-lg text-headline-lg-mobile md:text-display-lg text-neutral-900 mb-2 leading-tight tracking-tight animate-fade-in">
              Fuerteventura TOP 100 Experiencias
            </h2>
            <p className="font-body-md text-base text-neutral-700 mb-6 max-w-md">
              Vive la belleza salvaje de las Islas Canarias. Cien aventuras seleccionadas al detalle, desde cráteres volcánicos hasta lagunas escondidas.
            </p>
            <button 
              onClick={onStartAdventure}
              className="group relative flex items-center justify-center gap-3 bg-[#00ced1] hover:bg-[#00696b] text-white hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-[#00ced1]/20 active:scale-95 w-full md:w-auto"
            >
              Comenzar Aventura
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Trending Today section with bento grid cards */}
      <section className="px-margin-mobile py-8 md:py-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-headline-md text-headline-md text-neutral-900">Populares Hoy</h3>
          </div>
          <span 
            onClick={onStartAdventure}
            className="text-[#00696b] hover:text-[#005354] font-semibold text-sm cursor-pointer hover:underline"
          >
            Ver todas
          </span>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {displayTrending.map((activity) => (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              onClick={() => onSelectActivity(activity)}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-neutral-100/50"
            >
              <img 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                src={activity.imageUrl} 
                alt={activity.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent flex flex-col justify-end p-5">
                <span 
                  className={`px-3 py-1 rounded-full text-xs font-bold self-start mb-2 uppercase tracking-wide ${
                    activity.category === 'OCIO' 
                      ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                      : activity.category === 'DEPORTE' 
                        ? 'bg-[#00ced1]/20 text-[#00ced1] border border-[#00ced1]/30 backdrop-blur-md'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  {activity.category}
                </span>
                <h4 className="text-white font-headline-md text-xl font-bold tracking-tight mb-1 group-hover:text-[#00ced1] transition-colors">
                  <span className="font-mono text-[#00ced1] mr-1.5">{parseInt(activity.id.replace('act_', ''), 10)}.</span>
                  {activity.title}
                </h4>
                <p className="text-neutral-300 text-xs line-clamp-1">
                  {activity.location}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
