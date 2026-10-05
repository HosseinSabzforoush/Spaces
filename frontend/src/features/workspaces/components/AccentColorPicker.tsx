import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

const ACCENT_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
];

interface AccentColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function AccentColorPicker({ value, onChange }: AccentColorPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-text-muted">Accent color</span>
      <div role="radiogroup" aria-label="Accent color" className="flex flex-wrap gap-2.5">
        {ACCENT_COLORS.map((c) => {
          const selected = c.value === value;
          return (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c.name}
              title={c.name}
              onClick={() => onChange(c.value)}
              style={{ backgroundColor: c.value }}
              className={cn(
                'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110',
                selected && 'ring-2 ring-white/80 ring-offset-2 ring-offset-surface-elevated'
              )}
            >
              {selected && <Check size={14} strokeWidth={3} className="text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}