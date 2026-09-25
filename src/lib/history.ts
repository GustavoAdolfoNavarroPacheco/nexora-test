import type { Task } from './types';
import { today } from './utils';

export interface Bucket {
  /** Local midnight that opens the bucket. */
  start: Date;
  /** Local midnight that closes it (exclusive). */
  end: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** `count` consecutive buckets of `stepDays`, the last one ending tonight. */
export function dayBuckets(count: number, stepDays: number): Bucket[] {
  const tomorrow = new Date(startOfDay(today()).getTime() + DAY_MS);
  return Array.from({ length: count }, (_, i) => {
    const end = new Date(tomorrow.getTime() - (count - 1 - i) * stepDays * DAY_MS);
    return { start: new Date(end.getTime() - stepDays * DAY_MS), end };
  });
}

/** Calendar months, the last one being the current (partial) month. */
export function monthBuckets(count: number): Bucket[] {
  const base = today();
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(base.getFullYear(), base.getMonth() - (count - 1 - i), 1);
    return { start, end: new Date(start.getFullYear(), start.getMonth() + 1, 1) };
  });
}

const time = (iso?: string) => (iso ? Date.parse(iso) : NaN);

/** Tasks marked done inside each bucket. */
export function closedPerBucket(tasks: Task[], buckets: Bucket[]): number[] {
  return buckets.map(({ start, end }) =>
    tasks.filter((t) => {
      const at = time(t.completedAt);
      return at >= start.getTime() && at < end.getTime();
    }).length
  );
}

/** Share of the tasks that existed at the end of each bucket which were already done by then. */
export function completionAt(tasks: Task[], buckets: Bucket[]): number[] {
  return buckets.map(({ end }) => {
    const limit = end.getTime();
    const existing = tasks.filter((t) => time(t.createdAt) < limit);
    if (existing.length === 0) return 0;
    const done = existing.filter((t) => time(t.completedAt) < limit).length;
    return Math.round((done / existing.length) * 100);
  });
}
