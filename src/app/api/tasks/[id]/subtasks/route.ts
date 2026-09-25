import { createSubtask } from '@/server/mutations';
import { createSubtaskSchema } from '@/server/validation';
import { readJson } from '@/server/http';
import { authed } from '@/server/session';

type Ctx = { params: Promise<{ id: string }> };

export const POST = authed(async (userId, request: Request, { params }: Ctx) =>
  createSubtask(userId, (await params).id, await readJson(request, createSubtaskSchema))
);
