import { cn } from '@/lib/utils';

/**
 * Slow-drifting colour fields behind the sign-in and welcome screens — the same blue, violet
 * and green as the dashboard rings, blurred until only the light remains.
 */
export function Aurora({ className, soft = false }: { className?: string; soft?: boolean }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
      <div
        className={cn(
          'animate-drift absolute -top-[30%] -left-[20%] h-[75%] w-[75%] rounded-full bg-[#2997ff] blur-[90px]',
          soft ? 'opacity-[0.18]' : 'opacity-50'
        )}
      />
      <div
        className={cn(
          'animate-drift absolute top-[25%] -right-[25%] h-[65%] w-[65%] rounded-full bg-[#bf5af2] blur-[100px] [animation-delay:-7s] [animation-duration:23s]',
          soft ? 'opacity-[0.14]' : 'opacity-40'
        )}
      />
      <div
        className={cn(
          'animate-drift absolute -bottom-[35%] left-[10%] h-[65%] w-[65%] rounded-full bg-[#30d158] blur-[110px] [animation-delay:-13s] [animation-duration:27s]',
          soft ? 'opacity-[0.12]' : 'opacity-30'
        )}
      />
    </div>
  );
}
