import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent-cyan)] text-[var(--background)] hover:bg-[var(--accent-cyan)]/90',
        destructive:
          'bg-[var(--error)] text-white hover:bg-[var(--error)]/90',
        outline:
          'border border-[var(--border)] bg-transparent hover:bg-[var(--background-tertiary)] hover:border-[var(--border-light)]',
        secondary:
          'bg-[var(--background-tertiary)] text-[var(--foreground)] hover:bg-[var(--border)]',
        ghost:
          'hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]',
        link: 'text-[var(--accent-cyan)] underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-magenta)] text-[var(--background)] hover:opacity-90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

