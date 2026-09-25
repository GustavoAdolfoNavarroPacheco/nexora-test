import { updateSubtask } from '@/server/mutations';
import { updateSubtaskSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle(async (request: Request, { params }: Ctx) =>
  updateSubtask((await params).id, await readJson(request, updateSubtaskSchema))
);
