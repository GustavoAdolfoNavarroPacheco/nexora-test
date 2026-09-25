import { markAllNotificationsRead } from '@/server/mutations';
import { handle } from '@/server/http';

export const POST = handle(() => markAllNotificationsRead());
