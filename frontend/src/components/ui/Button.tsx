import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'success' | 'secondary' | 'danger' | 'dangerOutline' | 'ghost';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:bg-accent-active',
  success: 'bg-success-hover text-white shadow-3d-dark hover:bg-success',
  secondary: 'border border-border bg-card text-text-primary hover:border-border-hover hover:bg-card-active',
  danger: 'bg-danger text-white hover:bg-danger-hover',
  dangerOutline: 'border border-danger/50 text-danger hover:bg-danger/10',
  ghost: 'text-text-secondary hover:bg-card-hover hover:text-text-primary',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;

  iconAfter?: boolean;
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconAfter = false,
  type = 'button',
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const visual = loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : icon;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        loading && 'disabled:cursor-progress disabled:opacity-80',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {!iconAfter && visual}
      {children}
      {iconAfter && visual}
    </button>
  );
}
