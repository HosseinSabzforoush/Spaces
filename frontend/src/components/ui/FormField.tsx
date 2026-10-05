import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, required, optional, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs text-text-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
        {optional && <span className="ml-1 text-text-disabled">(optional)</span>}
      </label>
      {children}
      {hint && <div className="text-right text-xs text-text-disabled">{hint}</div>}
    </div>
  );
}

export const inputClass =
  'w-full min-w-0 rounded-md border-2 border-border bg-card px-3 py-1.5 text-sm text-text-primary placeholder:text-text-disabled hover:border-border-hover focus:border-border-active focus:outline-none';
