'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { AtSign, CalendarClock, CheckCircle2, Flag, FolderPlus } from 'lucide-react';
import { ActivityRings } from '@/components/ui/rings';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { NexoraMark } from '@/components/ui/nexora-mark';
import { easeApple, springSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Aurora } from './aurora';

// Same hues as the dashboard's rings: the tile is always dark.
const RINGS = [
  { label: 'Avance', color: '#2997ff', colorEnd: '#64d2ff' },
  { label: 'Tareas', color: '#30d158', colorEnd: '#a4f07a' },
  { label: 'Hitos', color: '#ff9f0a', colorEnd: '#ffd60a' },
];

// A working day compressed into a loop: the rings creep forward as the feed below fills in.
const DAY = [
  [62, 54, 40],
  [66, 58, 40],
  [69, 61, 50],
  [71, 64, 50],
  [74, 69, 60],
];

const FEED = [
  { icon: CheckCircle2, tint: '#30d158', title: 'Laura completó una tarea', body: '«Diseño del onboarding» ya pasó a revisión.' },
  { icon: AtSign, tint: '#2997ff', title: 'Andrés te mencionó', body: '«¿Revisamos la migración mañana a las 10?»' },
  { icon: Flag, tint: '#ff9f0a', title: 'Hito cumplido', body: 'Portal Corporativo · «Beta privada» se entregó a tiempo.' },
  { icon: CalendarClock, tint: '#ff453a', title: 'Vence mañana', body: 'Pruebas de carga en checkout · Elena Rojas' },
  { icon: FolderPlus, tint: '#bf5af2', title: 'Nuevo proyecto', body: 'Diego Morales creó «App de fidelización».' },
];

const FEED_EVERY_MS = 3400;

/** Ticks up forever once started; -1 until the first item should appear. */
function useTicker(everyMs: number, startAfterMs: number) {
  const [tick, setTick] = useState(-1);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setTick(0);
      interval = setInterval(() => setTick((t) => t + 1), everyMs);
    }, startAfterMs);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [everyMs, startAfterMs]);
  return tick;
}

function RingsWidget({ step }: { step: number }) {
  const values = DAY[Math.max(0, step) % DAY.length];
  return (
    <div className="rounded-[28px] bg-white/[0.07] p-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] ring-1 ring-white/10 backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-medium text-white/55">Hoy en tu equipo</span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-white/75">
          <span className="animate-breathe h-1.5 w-1.5 rounded-full bg-[#30d158]" />
          En vivo
        </span>
      </div>
      <div className="flex items-center gap-6">
        <ActivityRings
          rings={RINGS.map((r, i) => ({ ...r, value: values[i] }))}
          size={116}
          stroke={13}
          gap={3}
          trackOpacity={0.22}
        />
        <dl className="space-y-2">
          {RINGS.map((r, i) => (
            <div key={r.label}>
              <dt className="text-[11px] leading-none text-white/50">{r.label}</dt>
              <dd className="mt-1 text-[20px] leading-none font-semibold tracking-[-0.02em]" style={{ color: r.colorEnd }}>
                <AnimatedNumber value={values[i]} suffix="%" />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function NotificationCard({ item }: { item: (typeof FEED)[number] }) {
  const Icon = item.icon;
  return (
    <div className="flex gap-3 rounded-[20px] bg-[rgb(44,44,46)] p-3 pr-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.08]">
      <span className="relative mt-0.5 h-[38px] w-[38px] shrink-0">
        <NexoraMark className="h-full w-full" />
        <span
          className="absolute -right-1 -bottom-1 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-[#2c2c2e]"
          style={{ backgroundColor: item.tint }}
        >
          <Icon className="h-[11px] w-[11px] text-white" strokeWidth={2.6} />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-white">{item.title}</span>
          <span className="shrink-0 text-[11px] text-white/40">ahora</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-white/65">{item.body}</span>
      </span>
    </div>
  );
}

/** iOS lock-screen stack: the newest banner drops in on top, older ones tuck in behind it. */
function NotificationStack({ tick }: { tick: number }) {
  const visible = [0, 1, 2].map((depth) => ({ depth, n: tick - depth })).filter((v) => v.n >= 0);
  return (
    <div className="relative h-[104px]">
      <AnimatePresence initial={false}>
        {visible.map(({ depth, n }) => (
          <motion.div
            key={n}
            className="absolute inset-x-0 top-0"
            style={{ zIndex: 10 - depth, transformOrigin: 'top center' }}
            initial={{ opacity: 0, y: -26, scale: 1.04, filter: 'blur(6px) brightness(1)' }}
            animate={{
              opacity: 1,
              y: depth * 12,
              scale: 1 - depth * 0.06,
              filter: `blur(0px) brightness(${1 - depth * 0.28})`,
            }}
            exit={{ opacity: 0, y: 44, scale: 0.8, transition: { duration: 0.35, ease: easeApple } }}
            transition={springSoft}
          >
            <NotificationCard item={FEED[n % FEED.length]} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * The left half of the sign-in screen (the top on phones): what Nexora feels like once you're in.
 * Purely illustrative, so it is hidden from assistive technology.
 */
export function Showcase({ className }: { className?: string }) {
  const tick = useTicker(FEED_EVERY_MS, 1100);

  // Cursor-follow tilt, mouse only.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 140, damping: 18 });
  const feedX = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 });
  const feedY = useSpring(useTransform(py, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 20 });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.section
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: easeApple }}
      className={cn('relative isolate flex flex-col overflow-hidden bg-tile text-white', className)}
    >
      <Aurora />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] [background-size:22px_22px]"
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: easeApple }}
        className="hidden items-center gap-2.5 lg:flex"
      >
        <NexoraMark className="h-8 w-8" />
        <span className="text-[17px] font-semibold tracking-[-0.02em]">Nexora</span>
      </motion.div>

      <div aria-hidden className="flex flex-1 items-center justify-center py-2 [perspective:1200px] lg:py-6">
        <motion.div style={{ rotateX, rotateY }} className="w-[340px] origin-center scale-[0.9] lg:scale-100">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...springSoft, delay: 0.25 }}
          >
            <RingsWidget step={tick} />
          </motion.div>
          <motion.div style={{ x: feedX, y: feedY }} className="mt-4 hidden sm:block">
            <NotificationStack tick={tick} />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: easeApple }}
        className="hidden lg:block"
      >
        <h2 className="max-w-[440px] text-[34px] leading-[1.08] font-semibold tracking-[-0.035em]">
          Todo el equipo,
          <br />
          <span className="bg-gradient-to-r from-[#64d2ff] via-[#a4f07a] to-[#ffd60a] bg-clip-text text-transparent">al mismo ritmo.</span>
        </h2>
        <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-white/60">
          El avance de cada proyecto en tiempo real, el trabajo bien repartido y un aviso antes de que algo se retrase.
        </p>
      </motion.div>
    </motion.section>
  );
}
