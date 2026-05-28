/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'OCIO' | 'DEPORTE' | 'NATURALEZA';

export interface Activity {
  id: string;
  title: string;
  category: Category;
  duration: string;
  difficulty: 'Baja' | 'Media' | 'Alta';
  type: string;
  location: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  galleryUrls: string[];
  lat: number;   // GPS (28.x) or map % (0–100) — see MapView activityToLatLng
  lng: number;   // GPS (-13.x / -14.x) or map % (0–100)
  rating: number;
  xpAward: number;
}

export interface UserProfile {
  username: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  xp: number;
  completedIds: string[];
}
