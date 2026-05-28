/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity, Category } from '../types';
import { 
  Filter, 
  MapPin, 
  Star, 
  Locate, 
  Plus, 
  Minus, 
  Compass, 
  Camera, 
  Activity as SportIcon, 
  Compass as NatureIcon,
  Tent,
  AlertCircle,
  Check,
  Map as MapIcon,
  Key,
  Eye,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

// Read API keys safely according to GMP guidelines
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface MapViewProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
}

/** True when lat/lng are WGS84 (e.g. 28.69, -13.82), not 0–100 map percentages. */
export function isGpsCoordinate(lat: number, lng: number): boolean {
  return lng < 0 || lat > 30;
}

// Converts percent coordinates (from decorative image) to actual physical GPS coordinates on Fuerteventura
export function pctToLatLng(latPct: number, lngPct: number) {
  // Bounding box mapping percentage coordinates of the custom Fuerteventura map to actual GPS coordinates
  // Latitude: North is approx 28.76, South is approx 28.02
  // Longitude: West is approx -14.51, East is approx -13.82
  const minPctLat = 5;
  const maxPctLat = 95;
  const minPctLng = 10;
  const maxPctLng = 90;

  const minGpsLat = 28.04;
  const maxGpsLat = 28.76;
  const minGpsLng = -14.51;
  const maxGpsLng = -13.82;

  // Map latitude (note that 0% is North/maxGpsLat, 100% is South/minGpsLat)
  const latFraction = (latPct - minPctLat) / (maxPctLat - minPctLat);
  const lat = maxGpsLat - latFraction * (maxGpsLat - minGpsLat);

  // Map longitude (0% is West/minGpsLng, 100% is East/maxGpsLng)
  const lngFraction = (lngPct - minPctLng) / (maxPctLng - minPctLng);
  const lng = minGpsLng + lngFraction * (maxGpsLng - minGpsLng);

  // Keep markers on/near Fuerteventura
  return {
    lat: Math.min(maxGpsLat + 0.02, Math.max(minGpsLat - 0.02, lat)),
    lng: Math.min(maxGpsLng + 0.02, Math.max(minGpsLng - 0.02, lng))
  };
}

/** Inverse of pctToLatLng — for the illustrated fallback map. */
export function latLngToPct(lat: number, lng: number) {
  const minPctLat = 5;
  const maxPctLat = 95;
  const minPctLng = 10;
  const maxPctLng = 90;
  const minGpsLat = 28.04;
  const maxGpsLat = 28.76;
  const minGpsLng = -14.51;
  const maxGpsLng = -13.82;

  const latFraction = (maxGpsLat - lat) / (maxGpsLat - minGpsLat);
  const lngFraction = (lng - minGpsLng) / (maxGpsLng - minGpsLng);

  return {
    lat: minPctLat + latFraction * (maxPctLat - minPctLat),
    lng: minPctLng + lngFraction * (maxPctLng - minPctLng),
  };
}

export function activityToLatLng(act: Activity) {
  if (isGpsCoordinate(act.lat, act.lng)) {
    return { lat: act.lat, lng: act.lng };
  }
  return pctToLatLng(act.lat, act.lng);
}

export function activityToMapPercent(act: Activity) {
  if (isGpsCoordinate(act.lat, act.lng)) {
    return latLngToPct(act.lat, act.lng);
  }
  return { lat: act.lat, lng: act.lng };
}

export default function MapView({ activities, onSelectActivity }: MapViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'TODAS'>('TODAS');
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [zoom, setZoom] = useState(1);
  const [useFallbackMap, setUseFallbackMap] = useState(false);

  const filteredActivities = selectedCategory === 'TODAS'
    ? activities
    : activities.filter(act => act.category === selectedCategory);

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'OCIO':
        return <Camera className="w-4 h-4" />;
      case 'DEPORTE':
        return <SportIcon className="w-4 h-4" />;
      case 'NATURALEZA':
        return <Tent className="w-4 h-4" />;
    }
  };

  const getPinColor = (category: Category) => {
    switch (category) {
      case 'OCIO':
        return 'text-amber-500 bg-amber-500 hover:bg-amber-600';
      case 'DEPORTE':
        return 'text-cyan-500 bg-cyan-500 hover:bg-cyan-600';
      case 'NATURALEZA':
        return 'text-emerald-500 bg-emerald-500 hover:bg-emerald-600';
    }
  };

  // If the user has not configured Google Maps API Key and hasn't chosen to view the fallback map
  if (!hasValidKey && !useFallbackMap) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-120px)] bg-neutral-50 px-6 py-12">
        <div className="w-full max-w-xl bg-white rounded-3xl p-8 md:p-10 border border-neutral-200/70 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#00696b] via-[#00ced1] to-emerald-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-[#00696b]/10 flex items-center justify-center text-[#00696b] mb-6">
            <MapIcon className="w-8 h-8" />
          </div>

          <h2 className="font-headline-md text-2xl font-black text-neutral-900 leading-tight">
            Google Maps API Key Requerida
          </h2>
          <p className="text-sm text-[#566565] mt-3 leading-relaxed max-w-md">
            Para disfrutar del mapa interactivo premium de Fuerteventura con los puntos exactos geolocalizados, es necesario añadir una clave de Google Maps Platform.
          </p>

          <div className="w-full bg-neutral-50 rounded-2xl p-5 border border-neutral-150 text-left mt-6 space-y-4 text-xs">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00696b]/15 text-[#00696b] font-bold flex items-center justify-center">1</span>
              <div>
                <p className="font-bold text-neutral-800">Obten tu API Key gratis</p>
                <p className="text-[#566565] mt-0.5">
                  Regístrate y obtén tu clave de desarrollo oficial en la <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-[#00696b] underline font-bold">Consola de Google Cloud</a>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00696b]/15 text-[#00696b] font-bold flex items-center justify-center">2</span>
              <div>
                <p className="font-bold text-neutral-800">Añade la clave de entorno</p>
                <p className="text-[#566565] mt-0.5">
                  Abre los <strong>Ajustes</strong> (ícono de ⚙️ en el extremo superior derecho), luego dirígete a <strong>Secrets</strong>, escribe el nombre <code className="bg-neutral-200/80 px-1 py-0.5 rounded font-mono font-bold text-[#00696b]">GOOGLE_MAPS_PLATFORM_KEY</code> y pega tu valor.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00696b]/15 text-[#00696b] font-bold flex items-center justify-center">3</span>
              <div>
                <p className="font-bold text-neutral-800">Carga automática</p>
                <p className="text-[#566565] mt-0.5">
                  Al pulsar Enter en Secrets, la plataforma AI Studio compilará tu aplicación de forma automática reflejando el mapa satelital al instante.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
            <a 
              href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-grow py-3 px-4 bg-[#00696b] hover:bg-[#005354] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              Obtener Clave de Google Maps
            </a>
            <button 
              onClick={() => setUseFallbackMap(true)}
              className="flex-grow py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-neutral-500" />
              Ver Mapa Ilustrativo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow relative overflow-hidden h-[calc(100vh-120px)] bg-neutral-100">
      
      {/* Active Key Indicator or Toggle fallback button */}
      {!hasValidKey && (
        <div className="absolute top-20 left-4 z-20 pointer-events-auto">
          <button 
            onClick={() => setUseFallbackMap(false)}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900/90 hover:bg-neutral-900 border border-amber-500/30 text-amber-500 text-xs font-bold rounded-xl shadow-lg backdrop-blur-md cursor-pointer transition-transform active:scale-95"
          >
            <AlertCircle className="w-4 h-4 animate-bounce text-amber-400" />
            Configurar Clave Real de Google Maps
          </button>
        </div>
      )}

      {/* Render Google Maps if key is valid and we're not manually viewing the fallback */}
      {hasValidKey && !useFallbackMap ? (
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={{ lat: 28.38, lng: -14.15 }} // Center of majestic Fuerteventura Island
            defaultZoom={10}
            maxZoom={15}
            minZoom={9}
            gestureHandling="greedy"
            mapId="DEMO_MAP_ID"
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }} // Sube height collapse
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']} // Required attribution id
          >
            {filteredActivities.map((act) => {
              const gpsPos = activityToLatLng(act);
              const isActive = activeActivity?.id === act.id;

              return (
                <AdvancedMarker
                  key={act.id}
                  position={gpsPos}
                  onClick={() => setActiveActivity(act)}
                  title={act.title}
                >
                  <div 
                    className="relative cursor-pointer transition-transform duration-300 hover:scale-110 flex items-center justify-center" 
                    style={{ width: '36px', height: '36px' }} // Explicit size to prevent invisible markers (CF3)
                  >
                    {/* Ping ring */}
                    {isActive && (
                      <span className="absolute -inset-1.5 rounded-full bg-[#00ced1]/50 opacity-100 animate-ping" />
                    )}
                    
                    {/* Circular Marker Badge */}
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-300 ${
                        isActive 
                          ? 'bg-neutral-900 text-[#00ced1] scale-120 shadow-2xl z-40' 
                          : `${getPinColor(act.category).split(' ')[1]} text-white hover:brightness-105`
                      }`}
                    >
                      {getCategoryIcon(act.category)}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      ) : (
        /* Legacy Offline Visual Map fallback layout */
        <div 
          className="absolute inset-0 transition-transform duration-500 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <img 
            className="w-full h-full object-cover opacity-95 pointer-events-none select-none" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDVf539H9qXYFs8hANpeNGuCCTnmh1B5n-S7lQLk3H0dvo8FeLY6Fb5_JiSmhZqLwditxXvGBReV3gAcgpzP8WJa4JPyB_JGRQDHcohEtjq8hlfPPdckzyJQjNfKe31Ao1zDOFh2zK1T5ZbC63QVzw6QAqpX4PbEVSFjkjTHyZcDXvFFayf2lfpdhIN2m-vgdLnPgODK0Muwnf2l8TTJl45nWwbHMrcM-VenQQ9VfXO7gQuxcYDQtjfF3prD341sNnFReGCt5QGjuM" 
            alt="Mapa interactivo de Fuerteventura"
          />

          {/* Fallback pin elements inside container */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {filteredActivities.map((act) => {
              const mapPos = activityToMapPercent(act);
              return (
              <button
                key={act.id}
                onClick={() => setActiveActivity(act)}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group transition-transform hover:scale-125 focus:outline-none"
                style={{ top: `${mapPos.lat}%`, left: `${mapPos.lng}%` }}
              >
                <div className="relative">
                  {activeActivity?.id === act.id && (
                    <span className="absolute -inset-1.5 rounded-full bg-white opacity-40 animate-ping" />
                  )}
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-300 ${
                      activeActivity?.id === act.id 
                        ? 'bg-neutral-900 text-white scale-110 shadow-2xl' 
                        : `${getPinColor(act.category).split(' ')[1]} text-white`
                    }`}
                  >
                    {getCategoryIcon(act.category)}
                  </div>
                </div>
              </button>
            );
            })}
          </div>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="absolute top-4 inset-x-0 px-4 z-25 flex justify-center pointer-events-none">
        <div className="bg-white/85 backdrop-blur-xl rounded-full py-1.5 px-2.5 shadow-lg flex items-center gap-1 max-w-full overflow-x-auto no-scrollbar pointer-events-auto border border-neutral-100">
          <button 
            onClick={() => {
              setSelectedCategory('TODAS');
              setActiveActivity(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
              selectedCategory === 'TODAS'
                ? 'bg-[#00696b] text-white shadow-sm'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Todas
          </button>
          
          <button 
            onClick={() => {
              setSelectedCategory('OCIO');
              setActiveActivity(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
              selectedCategory === 'OCIO'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-900 border border-amber-100 hover:bg-amber-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Ocio
          </button>

          <button 
            onClick={() => {
              setSelectedCategory('DEPORTE');
              setActiveActivity(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
              selectedCategory === 'DEPORTE'
                ? 'bg-[#00ced1] text-white shadow-sm'
                : 'bg-cyan-50 text-cyan-950 border border-cyan-100 hover:bg-cyan-100'
            }`}
          >
            <SportIcon className="w-3.5 h-3.5" />
            Deporte
          </button>

          <button 
            onClick={() => {
              setSelectedCategory('NATURALEZA');
              setActiveActivity(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
              selectedCategory === 'NATURALEZA'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-100 hover:bg-emerald-100'
            }`}
          >
            <Tent className="w-3.5 h-3.5" />
            Naturaleza
          </button>
        </div>
      </div>

      {/* Manual zoom controls (Only shown for fallback illustrated map) */}
      {(!hasValidKey || useFallbackMap) && (
        <div className="absolute right-4 bottom-28 flex flex-col gap-2 z-20">
          <button 
            onClick={() => setActiveActivity(null)}
            className="w-12 h-12 bg-white/90 backdrop-blur-md text-[#00696b] rounded-full shadow-lg flex items-center justify-center hover:bg-white active:scale-90 transition-transform border border-neutral-100 cursor-pointer"
          >
            <Locate className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoom(z => Math.min(z + 0.25, 2))}
            className="w-12 h-12 bg-white/90 backdrop-blur-md text-[#00696b] rounded-full shadow-lg flex items-center justify-center hover:bg-white active:scale-90 transition-transform border border-neutral-100 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.75))}
            className="w-12 h-12 bg-white/90 backdrop-blur-md text-[#00696b] rounded-full shadow-lg flex items-center justify-center hover:bg-white active:scale-90 transition-transform border border-neutral-100 cursor-pointer"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Floating detail popup drawer for active highlight pin */}
      <AnimatePresence>
        {activeActivity && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-24 inset-x-margin-mobile z-30 max-w-lg mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/50 flex gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100 self-center">
                <img 
                  className="w-full h-full object-cover" 
                  src={activeActivity.imageUrl} 
                  alt={activeActivity.title}
                />
              </div>
              <div className="flex flex-col justify-between py-0.5 flex-grow">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest text-[#00ced1] uppercase">
                      {activeActivity.category} · {activeActivity.type}
                    </span>
                    <button 
                      onClick={() => setActiveActivity(null)}
                      className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold px-1 cursor-pointer"
                    >
                      cerrar
                    </button>
                  </div>
                  <h3 className="font-headline-md text-base text-neutral-900 leading-tight font-bold mt-0.5">
                    <span className="font-mono text-[#00696b] mr-1">{parseInt(activeActivity.id.replace('act_', ''), 10)}.</span>
                    {activeActivity.title}
                  </h3>
                  <p className="text-neutral-500 text-xs line-clamp-1 mt-0.5">
                    {activeActivity.location}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-0.5 border-t border-neutral-100">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-xs text-neutral-800">{activeActivity.rating}</span>
                  </div>
                  <button 
                    onClick={() => onSelectActivity(activeActivity)}
                    className="bg-[#00696b] hover:bg-[#005354] px-4 py-1.5 rounded-xl text-white text-xs font-bold active:scale-95 transition-transform cursor-pointer"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
