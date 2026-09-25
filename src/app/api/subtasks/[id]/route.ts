import { updateSubtask } from '@/server/mutations';
import { updateSubtaskSchema } from '@/server/validation';
import { readJson } from '@/server/http';
import { authed } from '@/server/session';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = authed(async (_userId, request: Request, { params }: Ctx) =>
  updateSubtask((await params).id, await readJson(request, updateSubtaskSchema))
);
