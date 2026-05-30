'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ParsedSpec, AppEnvironment } from '@/lib/types';

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
  favorites: Record<string, string[]>;
  savedViews: Record<string, Record<string, Record<string, unknown>>>;
  toggleFavorite: (slug: string) => void;
  saveTableView: (path: string, viewName: string, state: Record<string, unknown>) => void;
  deleteTableView: (path: string, viewName: string) => void;
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

      toggleFavorite: (slug) =>
        set((state) => {
          if (!state.specSource) return state;
          const currentFavs = state.favorites[state.specSource] || [];
          const isFav = currentFavs.includes(slug);
          const newFavs = isFav
            ? currentFavs.filter((f) => f !== slug)
            : [...currentFavs, slug];

          return {
            favorites: {
              ...state.favorites,
              [state.specSource]: newFavs,
            },
          };
        }),

      saveTableView: (path, viewName, viewState) =>
        set((state) => {
          if (!state.specSource) return state;
          const currentViews = state.savedViews[state.specSource] || {};
          const pathViews = currentViews[path] || {};

          return {
            savedViews: {
              ...state.savedViews,
              [state.specSource]: {
                ...currentViews,
                [path]: {
                  ...pathViews,
                  [viewName]: viewState,
                },
              },
            },
          };
        }),

      deleteTableView: (path, viewName) =>
        set((state) => {
          if (!state.specSource) return state;
          const currentViews = state.savedViews[state.specSource] || {};
          const pathViews = { ...currentViews[path] };
          delete pathViews[viewName];

          return {
            savedViews: {
              ...state.savedViews,
              [state.specSource]: {
                ...currentViews,
                [path]: pathViews,
              },
            },
          };
        }),

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
