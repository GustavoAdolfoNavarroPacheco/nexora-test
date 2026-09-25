import { updateNotification } from '@/server/mutations';
import { updateNotificationSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle(async (request: Request, { params }: Ctx) =>
  updateNotification((await params).id, await readJson(request, updateNotificationSchema))
);
