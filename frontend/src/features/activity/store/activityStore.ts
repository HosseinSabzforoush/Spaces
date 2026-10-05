import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uid } from '@/utils/id';

export type ActivityType =
  | 'workspace.created'
  | 'workspace.edited'
  | 'workspace.deleted'
  | 'workspace.launched'
  | 'app.opened'
  | 'app.added'
  | 'app.removed'
  | 'library.added'
  | 'library.removed'
  | 'launch.failed';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  workspaceId?: string;
  timestamp: number;
}

const MAX_EVENTS = 100;

interface ActivityState {
  events: ActivityEvent[];
  add: (type: ActivityType, message: string, workspaceId?: string) => void;
  clear: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      events: [],
      add: (type, message, workspaceId) =>
        set((s) => ({
          events: [{ id: uid(), type, message, workspaceId, timestamp: Date.now() }, ...s.events].slice(0, MAX_EVENTS),
        })),
      clear: () => set({ events: [] }),
    }),
    { name: 'wm.activity', partialize: (s) => ({ events: s.events }) },
  ),
);
