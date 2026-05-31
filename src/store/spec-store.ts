'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ParsedSpec, AppEnvironment, SavedView } from '@/lib/types';

interface SpecStore {
  parsedSpec: ParsedSpec | null;
  specSource: string | null;
  environments: AppEnvironment[];
  activeEnvironmentId: string | null;
  pathParams: Record<string, string>;
  favorites: Record<string, string[]>; // Map specKey to list of resource slugs
  savedViews: Record<string, Record<string, SavedView[]>>; // Map specKey -> resource path -> views

  setParsedSpec: (spec: ParsedSpec, source: string) => void;
  clearSpec: () => void;
  addEnvironment: (env: AppEnvironment) => void;
  updateEnvironment: (id: string, env: Partial<AppEnvironment>) => void;
  removeEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string) => void;
  getActiveEnvironment: () => AppEnvironment | null;
  setPathParam: (name: string, value: string) => void;
  clearPathParams: () => void;

  // Favorites
  toggleFavorite: (specKey: string, slug: string) => void;
  isFavorite: (specKey: string, slug: string) => boolean;
  getFavorites: (specKey: string) => string[];

  // Saved Views
  addSavedView: (specKey: string, path: string, view: SavedView) => void;
  removeSavedView: (specKey: string, path: string, viewId: string) => void;
  getSavedViews: (specKey: string, path: string) => SavedView[];
}

export const useSpecStore = create<SpecStore>()(
  persist(
    (set, get) => ({
      parsedSpec: null,
      specSource: null,
      environments: [
        {
          id: 'default',
          name: 'Default',
          baseUrl: '',
          authType: 'none',
        },
      ],
      activeEnvironmentId: 'default',
      pathParams: {},
      favorites: {},
      savedViews: {},

      setParsedSpec: (spec, source) => {
        const baseUrl = spec.baseUrl ?? '';
        set((state) => {
          // Update default environment with base URL
          const updatedEnvs = state.environments.map((e) =>
            e.id === 'default' ? { ...e, baseUrl } : e
          );
          return {
            parsedSpec: spec,
            specSource: source,
            environments: updatedEnvs,
          };
        });
      },

      clearSpec: () => set({ parsedSpec: null, specSource: null }),

      setPathParam: (name, value) =>
        set((state) => ({ pathParams: { ...state.pathParams, [name]: value } })),

      clearPathParams: () => set({ pathParams: {} }),

      addEnvironment: (env) =>
        set((state) => ({ environments: [...state.environments, env] })),

      updateEnvironment: (id, updates) =>
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      removeEnvironment: (id) =>
        set((state) => ({
          environments: state.environments.filter((e) => e.id !== id),
          activeEnvironmentId:
            state.activeEnvironmentId === id ? 'default' : state.activeEnvironmentId,
        })),

      setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),

      getActiveEnvironment: () => {
        const { environments, activeEnvironmentId } = get();
        return environments.find((e) => e.id === activeEnvironmentId) ?? null;
      },

      toggleFavorite: (specKey, slug) =>
        set((state) => {
          const specFavorites = state.favorites[specKey] || [];
          const isFav = specFavorites.includes(slug);
          const newFavorites = isFav
            ? specFavorites.filter((s) => s !== slug)
            : [...specFavorites, slug];
          return {
            favorites: { ...state.favorites, [specKey]: newFavorites },
          };
        }),

      isFavorite: (specKey, slug) => {
        const { favorites } = get();
        return (favorites[specKey] || []).includes(slug);
      },

      getFavorites: (specKey) => {
        const { favorites } = get();
        return favorites[specKey] || [];
      },

      addSavedView: (specKey, path, view) =>
        set((state) => {
          const specViews = state.savedViews[specKey] || {};
          const pathViews = specViews[path] || [];
          return {
            savedViews: {
              ...state.savedViews,
              [specKey]: {
                ...specViews,
                [path]: [...pathViews, view],
              },
            },
          };
        }),

      removeSavedView: (specKey, path, viewId) =>
        set((state) => {
          const specViews = state.savedViews[specKey] || {};
          const pathViews = specViews[path] || [];
          return {
            savedViews: {
              ...state.savedViews,
              [specKey]: {
                ...specViews,
                [path]: pathViews.filter((v) => v.id !== viewId),
              },
            },
          };
        }),

      getSavedViews: (specKey, path) => {
        const { savedViews } = get();
        return (savedViews[specKey] || {})[path] || [];
      },
    }),
    {
      name: 'aperio-store',
      partialize: (state) => ({
        environments: state.environments,
        activeEnvironmentId: state.activeEnvironmentId,
        specSource: state.specSource,
        favorites: state.favorites,
        savedViews: state.savedViews,
      }),
    }
  )
);
