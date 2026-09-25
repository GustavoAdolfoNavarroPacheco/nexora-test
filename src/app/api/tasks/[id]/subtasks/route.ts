import { createSubtask } from '@/server/mutations';
import { createSubtaskSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (request: Request, { params }: Ctx) =>
  createSubtask((await params).id, await readJson(request, createSubtaskSchema))
);
