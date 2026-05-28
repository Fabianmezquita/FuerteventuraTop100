/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AVATARS } from '../data';
import { UserProfile } from '../types';
import { User, Mail, Shield, Camera, X } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [genderFilter, setGenderFilter] = useState<'masculino' | 'femenino'>('masculino');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!username || !email || !password) {
        setError('Por favor, completa todos los campos.');
        return;
      }

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('f100_users') || '[]');
      if (existingUsers.some((u: any) => u.email === email)) {
        setError('El correo electrónico ya está registrado.');
        return;
      }

      const newProfile: UserProfile = {
        username,
        email,
        avatarUrl: AVATARS[avatarIndex],
        xp: 0,
        completedIds: [],
        createdAt: new Date().toISOString()
      };

      existingUsers.push({ ...newProfile, password });
      localStorage.setItem('f100_users', JSON.stringify(existingUsers));
      localStorage.setItem('f100_current_user', JSON.stringify(newProfile));
      onLoginSuccess(newProfile);
      onClose();
    } else {
      if (!email || !password) {
        setError('Por favor, completa todos los campos.');
        return;
      }

      const existingUsers = JSON.parse(localStorage.getItem('f100_users') || '[]');
      const user = existingUsers.find((u: any) => u.email === email && u.password === password);

      if (!user) {
        setError('Credenciales incorrectas o usuario no registrado.');
        return;
      }

      const currentProfile: UserProfile = {
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        xp: user.xp || 0,
        completedIds: user.completedIds || [],
        createdAt: user.createdAt
      };

      localStorage.setItem('f100_current_user', JSON.stringify(currentProfile));
      onLoginSuccess(currentProfile);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      id="auth-modal-overlay"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'auth-modal-overlay') onClose();
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-100 flex flex-col relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6 border-b border-neutral-100 pb-5">
            <div className="inline-flex w-16 h-16 rounded-full overflow-hidden border border-neutral-150 shadow-md bg-white mb-3 items-center justify-center p-0.5">
              <img 
                src="/logo_f100.png" 
                alt="Fuerteventura TOP 100 Experiencias" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="font-sans text-xl font-bold text-neutral-900 tracking-tight">
              {isRegister ? 'Crear una Cuenta' : 'Iniciar Sesión'}
            </h3>
            <p className="text-neutral-500 text-sm mt-1">
              {isRegister ? 'Comienza tu viaje en Fuerteventura TOP 100 Experiencias' : 'Accede a tus aventuras guardadas'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Selecciona tu Avatar Aventurero
                  </label>
                  <div className="flex bg-neutral-100 rounded-lg p-0.5 gap-0.5 border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setGenderFilter('masculino');
                        if (avatarIndex >= 5) {
                          setAvatarIndex(0);
                        }
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        genderFilter === 'masculino'
                          ? 'bg-[#00696b] text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGenderFilter('femenino');
                        if (avatarIndex < 5) {
                          setAvatarIndex(5);
                        }
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        genderFilter === 'femenino'
                          ? 'bg-[#00ced1] text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      Femenino
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 justify-center py-1.5 flex-wrap">
                  {AVATARS.map((url, index) => {
                    const isMale = index < 5;
                    if (genderFilter === 'masculino' && !isMale) return null;
                    if (genderFilter === 'femenino' && isMale) return null;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setAvatarIndex(index)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-4 transition-all duration-300 relative ${
                          avatarIndex === index 
                            ? `${genderFilter === 'masculino' ? 'border-[#00696b]' : 'border-[#00ced1]'} scale-105 shadow-md` 
                            : 'border-transparent scale-90 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Avatar option ${index + 1}`} className="w-full h-full object-cover" />
                        {avatarIndex === index && (
                          <div className="absolute inset-0 bg-[#00696b]/25 flex items-center justify-center">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Nombre de aventurero"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#00696b] focus:outline-none text-neutral-900 transition-colors"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                placeholder="Email corporativo o privado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#00696b] focus:outline-none text-neutral-900 transition-colors"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6b7a7a] pointer-events-none">
                <Shield className="w-5 h-5 text-neutral-400" />
              </span>
              <input
                type="password"
                required
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#00696b] focus:outline-none text-neutral-900 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#00696b] hover:bg-[#005354] text-white font-semibold rounded-xl tracking-wider transition-colors active:scale-95 duration-150 shadow-md cursor-pointer"
            >
              {isRegister ? 'CONFIRMAR REGISTRO' : 'CONTINUAR'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#3b4949]">
            <span>
              {isRegister ? '¿Ya tienes una cuenta?' : '¿Quieres guardar tus progresos?'}
            </span>{' '}
            <button
              onClick={() => {
                setError('');
                setIsRegister(!isRegister);
              }}
              className="text-[#00696b] hover:underline font-semibold"
            >
              {isRegister ? 'Inicia sesión aquí' : 'Crea una cuenta gratis'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

