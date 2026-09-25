import { deleteProject, updateProject } from '@/server/mutations';
import { updateProjectSchema } from '@/server/validation';
import { readJson } from '@/server/http';
import { authed } from '@/server/session';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = authed(async (userId, request: Request, { params }: Ctx) =>
  updateProject(userId, (await params).id, await readJson(request, updateProjectSchema))
);

export const DELETE = authed(async (userId, _request: Request, { params }: Ctx) => deleteProject(userId, (await params).id));
