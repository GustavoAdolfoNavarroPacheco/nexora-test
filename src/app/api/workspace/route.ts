import { getWorkspace } from '@/server/workspace';
import { handle } from '@/server/http';

export const GET = handle(() => getWorkspace());
