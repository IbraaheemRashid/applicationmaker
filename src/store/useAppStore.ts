import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Application, CV, InterviewStory, ApplicationStatus } from '../types';

interface AppState {
  applications: Application[];
  cvs: CV[];
  stories: InterviewStory[];
  tourComplete: boolean;

  addApplication: (app: Omit<Application, 'id' | 'dateAdded' | 'lastUpdated'>) => string;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;

  addCV: (cv: Omit<CV, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCV: (id: string, updates: Partial<CV>) => void;
  deleteCV: (id: string) => void;

  addStory: (story: Omit<InterviewStory, 'id'>) => string;
  updateStory: (id: string, updates: Partial<InterviewStory>) => void;
  deleteStory: (id: string) => void;

  completeTour: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      applications: [],
      cvs: [],
      stories: [],
      tourComplete: false,

      addApplication: (app) => {
        const id = uuid();
        const now = new Date().toISOString();
        set((state) => ({
          applications: [
            { ...app, id, dateAdded: now, lastUpdated: now },
            ...state.applications,
          ],
        }));
        return id;
      },

      updateApplication: (id, updates) => {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? { ...a, ...updates, lastUpdated: new Date().toISOString() } : a
          ),
        }));
      },

      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id),
        }));
      },

      updateStatus: (id, status) => {
        set((state) => ({
          applications: state.applications.map((a) => {
            if (a.id !== id) return a;
            const updates: Partial<Application> = {
              status,
              lastUpdated: new Date().toISOString(),
            };
            if (status === 'applied' && !a.dateApplied) {
              updates.dateApplied = new Date().toISOString();
            }
            return { ...a, ...updates };
          }),
        }));
      },

      addCV: (cv) => {
        const id = uuid();
        const now = new Date().toISOString();
        set((state) => ({
          cvs: [{ ...cv, id, createdAt: now, updatedAt: now }, ...state.cvs],
        }));
        return id;
      },

      updateCV: (id, updates) => {
        set((state) => ({
          cvs: state.cvs.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteCV: (id) => {
        set((state) => ({
          cvs: state.cvs.filter((c) => c.id !== id),
        }));
      },

      addStory: (story) => {
        const id = uuid();
        set((state) => ({
          stories: [{ ...story, id }, ...state.stories],
        }));
        return id;
      },

      updateStory: (id, updates) => {
        set((state) => ({
          stories: state.stories.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },

      deleteStory: (id) => {
        set((state) => ({
          stories: state.stories.filter((s) => s.id !== id),
        }));
      },

      completeTour: () => set({ tourComplete: true }),
    }),
    { name: 'applynow-storage' }
  )
);
