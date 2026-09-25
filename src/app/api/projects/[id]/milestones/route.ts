import { createMilestone } from '@/server/mutations';
import { createMilestoneSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (request: Request, { params }: Ctx) =>
  createMilestone((await params).id, await readJson(request, createMilestoneSchema))
);
