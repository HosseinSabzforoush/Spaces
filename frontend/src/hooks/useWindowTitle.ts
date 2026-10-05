import { useEffect } from 'react';
import { windowApi } from '@/native';

const APP_NAME = 'Spaces';

export function useWindowTitle(title?: string) {
  useEffect(() => {
    void windowApi.setTitle(title ? `${title} — ${APP_NAME}` : APP_NAME);
  }, [title]);
}
