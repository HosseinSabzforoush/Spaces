import { useState } from 'react';
import type { Application, ApplicationSettings, NewApplication } from '@/features/applications/types';
import { createApplication } from '@/features/applications/utils/createApplication';
import { uid } from '@/utils/id';
import { pathKey } from '@/utils/paths';
import type { EnvVariable, Workspace, WorkspaceBehavior, WorkspaceForm } from '../types';

export function toWorkspaceForm(w: Workspace): WorkspaceForm {
  const { title, description, icon, accentColor, behavior, workingDirectory, envVars, apps } = w;
  return { title, description, icon, accentColor, behavior, workingDirectory, envVars, apps };
}

export function useWorkspaceForm(initial: WorkspaceForm) {
  const [baseline, setBaseline] = useState<WorkspaceForm>(initial);
  const [values, setValues] = useState<WorkspaceForm>(initial);

  const setField = <K extends keyof WorkspaceForm>(key: K, value: WorkspaceForm[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const setBehavior = (key: keyof WorkspaceBehavior, checked: boolean) =>
    setValues((v) => ({ ...v, behavior: { ...v.behavior, [key]: checked } }));

  const addEnvVar = () =>
    setValues((v) => ({ ...v, envVars: [...v.envVars, { id: uid(), key: '', value: '' }] }));
  const updateEnvVar = (id: string, patch: Partial<EnvVariable>) =>
    setValues((v) => ({ ...v, envVars: v.envVars.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const removeEnvVar = (id: string) =>
    setValues((v) => ({ ...v, envVars: v.envVars.filter((e) => e.id !== id) }));

  const addApps = (list: NewApplication[]) =>
    setValues((v) => {
      const known = new Set(v.apps.map((a) => pathKey(a.executablePath)));
      const fresh: Application[] = [];
      for (const item of list) {
        const key = pathKey(item.executablePath);
        if (known.has(key)) continue;
        known.add(key);
        fresh.push(createApplication(item));
      }
      return fresh.length > 0 ? { ...v, apps: [...v.apps, ...fresh] } : v;
    });
  const updateApp = (id: string, settings: ApplicationSettings) =>
    setValues((v) => ({ ...v, apps: v.apps.map((a) => (a.id === id ? { ...a, ...settings } : a)) }));
  const toggleApp = (id: string, enabled: boolean) =>
    setValues((v) => ({ ...v, apps: v.apps.map((a) => (a.id === id ? { ...a, enabled } : a)) }));
  const removeApp = (id: string) =>
    setValues((v) => ({ ...v, apps: v.apps.filter((a) => a.id !== id) }));

  const isDirty = JSON.stringify(values) !== JSON.stringify(baseline);
  const isValid = values.title.trim().length > 0;

  const commit = () => setBaseline(values);

  const reset = () => setValues(baseline);

  return {
    values, isDirty, isValid,
    setField, setBehavior,
    addEnvVar, updateEnvVar, removeEnvVar,
    addApps, updateApp, toggleApp, removeApp,
    commit, reset,
  };
}
