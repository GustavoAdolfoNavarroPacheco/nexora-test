import { createMilestone } from '@/server/mutations';
import { createMilestoneSchema } from '@/server/validation';
import { readJson } from '@/server/http';
import { authed } from '@/server/session';

type Ctx = { params: Promise<{ id: string }> };

export const POST = authed(async (_userId, request: Request, { params }: Ctx) =>
  createMilestone((await params).id, await readJson(request, createMilestoneSchema))
);
