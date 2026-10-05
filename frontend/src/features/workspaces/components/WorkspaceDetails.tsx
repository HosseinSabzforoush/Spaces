import { fileSystemApi } from '@/native';
import { cn } from '@/utils/cn';
import FormField, { inputClass } from '@/components/ui/FormField';
import AccentColorPicker from './AccentColorPicker';
import WorkspaceIconPicker from './WorkspaceIconPicker';
import BehaviorSettings from './BehaviorSettings';
import AdvancedSettings from './AdvancedSettings';
import type { useWorkspaceForm } from '../hooks/useWorkspaceForm';

const MAX_DESC = 160;

type FormApi = ReturnType<typeof useWorkspaceForm>;

export default function WorkspaceDetails({ form }: { form: FormApi }) {
  const { values, setField, setBehavior, addEnvVar, updateEnvVar, removeEnvVar } = form;

  const browseDirectory = async () => {
    const dir = await fileSystemApi.selectDirectory();
    if (dir) setField('workingDirectory', dir);
  };

  return (
    <div className="custom-scrollbar flex w-full flex-col gap-6 overflow-x-hidden p-5 text-text-primary @4xl:min-h-0 @4xl:w-2/5 @4xl:overflow-y-auto">
      <h2 className="text-base font-semibold">Workspace details</h2>

      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <WorkspaceIconPicker icon={values.icon} accentColor={values.accentColor} onChange={(i) => setField('icon', i)} />
        <AccentColorPicker value={values.accentColor} onChange={(c) => setField('accentColor', c)} />
      </div>

      <FormField label="Title" htmlFor="title" required>
        <input
          id="title"
          type="text"
          required
          maxLength={50}
          value={values.title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder="e.g. Coding"
          className={inputClass}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        optional
        hint={`${values.description.length}/${MAX_DESC}`}
      >
        <textarea
          id="description"
          rows={2}
          maxLength={MAX_DESC}
          spellCheck={false}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="What is this workspace for?"
          className={cn(inputClass, 'resize-none custom-scrollbar')}
        />
      </FormField>

      <hr className="border-border" />
      <BehaviorSettings value={values.behavior} onChange={setBehavior} />

      <hr className="border-border" />
      <AdvancedSettings
        workingDirectory={values.workingDirectory}
        envVars={values.envVars}
        onDirectoryChange={(d) => setField('workingDirectory', d)}
        onBrowse={browseDirectory}
        onAddVar={addEnvVar}
        onUpdateVar={updateEnvVar}
        onRemoveVar={removeEnvVar}
      />
    </div>
  );
}