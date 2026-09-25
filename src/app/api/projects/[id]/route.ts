import { deleteProject, updateProject } from '@/server/mutations';
import { updateProjectSchema } from '@/server/validation';
import { readJson } from '@/server/http';
import { authed } from '@/server/session';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = authed(async (_userId, request: Request, { params }: Ctx) =>
  updateProject((await params).id, await readJson(request, updateProjectSchema))
);

export const DELETE = authed(async (_userId, _request: Request, { params }: Ctx) => deleteProject((await params).id));
