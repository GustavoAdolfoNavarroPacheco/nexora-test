'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Ellipsis, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/sheet';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { primaryNav, teamNav, systemNav, isActivePath } from './nav-items';

const tabs = [...primaryNav, teamNav[0]];
const overflow = [...teamNav.slice(1), ...systemNav];

/** Floating iOS tab bar for phones and small tablets. */
export function TabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const overflowActive = overflow.some((i) => isActivePath(pathname, i.href));

  return (
    <>
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(10px,env(safe-area-inset-bottom))] lg:hidden"
      >
        <div className="glass flex w-full max-w-[460px] items-stretch rounded-[28px] bg-chrome p-1.5 shadow-pop">
          {tabs.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] py-1.5 text-[10px] font-medium transition-colors',
                  active ? 'text-accent-ink' : 'text-ink-2'
                )}
              >
                {active && (
                  <motion.span layoutId="tabbar-active" transition={spring} className="absolute inset-0 rounded-[22px] bg-fill-2" />
                )}
                <Icon className="relative h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                <span className="relative">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] py-1.5 text-[10px] font-medium transition-colors',
              overflowActive ? 'text-accent-ink' : 'text-ink-2'
            )}
          >
            {overflowActive && (
              <motion.span layoutId="tabbar-active" transition={spring} className="absolute inset-0 rounded-[22px] bg-fill-2" />
            )}
            <Ellipsis className="relative h-[22px] w-[22px]" strokeWidth={overflowActive ? 2.2 : 1.8} />
            <span className="relative">Más</span>
          </button>
        </div>
      </nav>

      <Modal isOpen={moreOpen} onClose={() => setMoreOpen(false)} title="Más" width="sm">
        <ul className="divide-y divide-line overflow-hidden rounded-[16px] bg-fill">
          {overflow.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-fill-2"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent text-white">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex-1 text-[15px] text-ink">{item.name}</span>
                  <ChevronRight className="h-4 w-4 text-ink-3" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}
