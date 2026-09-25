import { markAllNotificationsRead } from '@/server/mutations';
import { authed } from '@/server/session';

export const POST = authed((userId) => markAllNotificationsRead(userId));
