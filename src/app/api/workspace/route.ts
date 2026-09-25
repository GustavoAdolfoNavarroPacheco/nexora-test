import { getWorkspace } from '@/server/workspace';
import { authed } from '@/server/session';

export const GET = authed((userId) => getWorkspace(userId));
