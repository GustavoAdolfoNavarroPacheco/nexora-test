import { deleteProject, updateProject } from '@/server/mutations';
import { updateProjectSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle(async (request: Request, { params }: Ctx) =>
  updateProject((await params).id, await readJson(request, updateProjectSchema))
);

export const DELETE = handle(async (_request: Request, { params }: Ctx) => deleteProject((await params).id));
