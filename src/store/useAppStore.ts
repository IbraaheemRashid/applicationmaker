import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Application, CV, InterviewStory, ActivityItem, ApplicationStatus } from '../types';

interface AppState {
  applications: Application[];
  cvs: CV[];
  stories: InterviewStory[];
  activity: ActivityItem[];

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

  addActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      applications: [],
      cvs: [],
      stories: [],
      activity: [],

      addApplication: (app) => {
        const id = uuid();
        const now = new Date().toISOString();
        set((state) => ({
          applications: [
            { ...app, id, dateAdded: now, lastUpdated: now },
            ...state.applications,
          ],
        }));
        get().addActivity({
          type: 'new_application',
          description: `Added ${app.company} - ${app.role}`,
          applicationId: id,
        });
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
        const app = get().applications.find((a) => a.id === id);
        if (!app) return;
        const updates: Partial<Application> = { status };
        if (status === 'applied') updates.dateApplied = new Date().toISOString();
        get().updateApplication(id, updates);
        get().addActivity({
          type: 'status_change',
          description: `${app.company} - ${app.role}: ${app.status} → ${status}`,
          applicationId: id,
        });
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
          stories: state.stories.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteStory: (id) => {
        set((state) => ({
          stories: state.stories.filter((s) => s.id !== id),
        }));
      },

      addActivity: (item) => {
        set((state) => ({
          activity: [
            { ...item, id: uuid(), timestamp: new Date().toISOString() },
            ...state.activity.slice(0, 49),
          ],
        }));
      },
    }),
    { name: 'applynow-storage' }
  )
);
