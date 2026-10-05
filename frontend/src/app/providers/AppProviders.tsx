import { useEffect, type ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import Toaster from '@/components/ui/Toaster';
import { useWorkspaceStore } from '@/features/workspaces/store/workspaceStore';
import { useAppLibraryStore } from '@/features/library/store/appLibraryStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

export default function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useWorkspaceStore.getState().load();
    void useAppLibraryStore.getState().load();
    void useSettingsStore.getState().hydrate();
  }, []);

  return (

    <MotionConfig reducedMotion="user">
      {children}
      <Toaster />
    </MotionConfig>
  );
}
