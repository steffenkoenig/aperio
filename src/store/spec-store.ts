'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ParsedSpec, AppEnvironment, SpecPreferences, SavedView } from '@/lib/types';

interface SpecStore {
  parsedSpec: ParsedSpec | null;
  specSource: string | null;
  environments: AppEnvironment[];
  activeEnvironmentId: string | null;
  pathParams: Record<string, string>;
  setParsedSpec: (spec: ParsedSpec, source: string) => void;
  clearSpec: () => void;
  addEnvironment: (env: AppEnvironment) => void;
  updateEnvironment: (id: string, env: Partial<AppEnvironment>) => void;
  removeEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string) => void;
  getActiveEnvironment: () => AppEnvironment | null;
  setPathParam: (name: string, value: string) => void;
  clearPathParams: () => void;
  preferences: Record<string, SpecPreferences>;
  toggleFavorite: (resourcePath: string) => void;
  saveView: (view: SavedView) => void;
  deleteView: (viewId: string) => void;

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
      preferences: {},

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

      toggleFavorite: (resourcePath) =>
        set((state) => {
          if (!state.specSource) return state;
          const currentPrefs = state.preferences[state.specSource] || { favorites: [], savedViews: [] };
          const isFavorite = currentPrefs.favorites.includes(resourcePath);
          const newFavorites = isFavorite
            ? currentPrefs.favorites.filter(p => p !== resourcePath)
            : [...currentPrefs.favorites, resourcePath];

          return {
            preferences: {
              ...state.preferences,
              [state.specSource]: { ...currentPrefs, favorites: newFavorites }
            }
          };
        }),

      saveView: (view) =>
        set((state) => {
          if (!state.specSource) return state;
          const currentPrefs = state.preferences[state.specSource] || { favorites: [], savedViews: [] };

          // If view with same name and path exists, update it, else add new
          const existingIndex = currentPrefs.savedViews.findIndex(v => v.id === view.id);
          let newViews;

          if (existingIndex >= 0) {
            newViews = [...currentPrefs.savedViews];
            newViews[existingIndex] = view;
          } else {
            newViews = [...currentPrefs.savedViews, view];
          }

          return {
            preferences: {
              ...state.preferences,
              [state.specSource]: { ...currentPrefs, savedViews: newViews }
            }
          };
        }),

      deleteView: (viewId) =>
        set((state) => {
          if (!state.specSource) return state;
          const currentPrefs = state.preferences[state.specSource];
          if (!currentPrefs) return state;

          const newViews = currentPrefs.savedViews.filter(v => v.id !== viewId);

          return {
            preferences: {
              ...state.preferences,
              [state.specSource]: { ...currentPrefs, savedViews: newViews }
            }
          };
        }),


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
    }),
    {
      name: 'aperio-store',
      partialize: (state) => ({
        environments: state.environments,
        activeEnvironmentId: state.activeEnvironmentId,
        specSource: state.specSource,
        preferences: state.preferences,
      }),
    }
  )
);
