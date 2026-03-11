/**
 * favoriteDoctorsStore.ts — Patient's favorite doctors (persistent).
 * Used by: PatientDashboard
 *
 * // TODO BACKEND: Replace with API
 */
import { createStore, useStore } from "./crossRoleStore";

export interface FavoriteDoctor {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
  acceptsMessages: boolean;
}

const initialFavorites: FavoriteDoctor[] = [
  { name: "Dr. Bouazizi", specialty: "Généraliste", avatar: "AB", id: 1, acceptsMessages: true },
  { name: "Dr. Gharbi", specialty: "Cardiologue", avatar: "SG", id: 2, acceptsMessages: false },
  { name: "Dr. Hammami", specialty: "Dermatologue", avatar: "KH", id: 3, acceptsMessages: true },
];

const store = createStore<FavoriteDoctor[]>("medicare_favorite_doctors", initialFavorites);

export function useFavoriteDoctors() {
  return useStore(store);
}

export function addFavoriteDoctor(doc: FavoriteDoctor) {
  // TODO BACKEND: POST /api/patient/favorites
  store.set(prev => prev.some(d => d.id === doc.id) ? prev : [...prev, doc]);
}

export function removeFavoriteDoctor(id: number) {
  // TODO BACKEND: DELETE /api/patient/favorites/:id
  store.set(prev => prev.filter(d => d.id !== id));
}
