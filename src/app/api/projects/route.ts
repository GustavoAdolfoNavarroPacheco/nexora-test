import { createProject } from '@/server/mutations';
import { createProjectSchema } from '@/server/validation';
import { readJson } from '@/server/http';
import { authed } from '@/server/session';

export const POST = authed(async (userId, request: Request) => createProject(userId, await readJson(request, createProjectSchema)));
