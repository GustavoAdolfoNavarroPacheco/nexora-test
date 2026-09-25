import { updateTask } from '@/server/mutations';
import { updateTaskSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle(async (request: Request, { params }: Ctx) =>
  updateTask((await params).id, await readJson(request, updateTaskSchema))
);
