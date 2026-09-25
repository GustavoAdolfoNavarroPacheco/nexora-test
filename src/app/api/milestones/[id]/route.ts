import { updateMilestone } from '@/server/mutations';
import { updateMilestoneSchema } from '@/server/validation';
import { readJson } from '@/server/http';
import { authed } from '@/server/session';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = authed(async (userId, request: Request, { params }: Ctx) =>
  updateMilestone(userId, (await params).id, await readJson(request, updateMilestoneSchema))
);
