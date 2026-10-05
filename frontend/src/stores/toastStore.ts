import { create } from 'zustand';
import { uid } from '@/utils/id';

export type ToastTone = 'success' | 'error' | 'warning';

export interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  push: (tone: ToastTone, message: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (tone, message) => {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, tone, message }] }));
    setTimeout(() => get().dismiss(id), tone === 'success' ? 3500 : 6000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push('success', message),
  warning: (message: string) => useToastStore.getState().push('warning', message),
  error: (message: string) => useToastStore.getState().push('error', message),
};
