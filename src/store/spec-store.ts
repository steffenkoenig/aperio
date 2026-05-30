'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ParsedSpec, AppEnvironment, Bookmark } from '@/lib/types';

interface SpecStore {
  parsedSpec: ParsedSpec | null;
  specSource: string | null;
  environments: AppEnvironment[];
  activeEnvironmentId: string | null;
  pathParams: Record<string, string>;
  bookmarks: Bookmark[];
  activeBookmark: Bookmark | null;
  setParsedSpec: (spec: ParsedSpec, source: string) => void;
  clearSpec: () => void;
  addEnvironment: (env: AppEnvironment) => void;
  updateEnvironment: (id: string, env: Partial<AppEnvironment>) => void;
  removeEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string) => void;
  getActiveEnvironment: () => AppEnvironment | null;
  setPathParam: (name: string, value: string) => void;
  clearPathParams: () => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  setActiveBookmark: (bookmark: Bookmark) => void;
  clearActiveBookmark: () => void;
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
      bookmarks: [],
      activeBookmark: null,

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

      addBookmark: (bookmark) => set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),
      removeBookmark: (id) => set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) })),
      setActiveBookmark: (bookmark) => set({ activeBookmark: bookmark }),
      clearActiveBookmark: () => set({ activeBookmark: null }),
    }),
    {
      name: 'aperio-store',
      partialize: (state) => ({
        environments: state.environments,
        activeEnvironmentId: state.activeEnvironmentId,
        specSource: state.specSource,
        bookmarks: state.bookmarks,
      }),
    }
  )
);
