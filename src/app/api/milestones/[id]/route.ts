import { updateMilestone } from '@/server/mutations';
import { updateMilestoneSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle(async (request: Request, { params }: Ctx) =>
  updateMilestone((await params).id, await readJson(request, updateMilestoneSchema))
);
