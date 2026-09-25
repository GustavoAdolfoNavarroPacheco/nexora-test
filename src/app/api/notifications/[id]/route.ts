import { updateNotification } from '@/server/mutations';
import { updateNotificationSchema } from '@/server/validation';
import { readJson } from '@/server/http';
import { authed } from '@/server/session';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = authed(async (userId, request: Request, { params }: Ctx) =>
  updateNotification(userId, (await params).id, await readJson(request, updateNotificationSchema))
);
