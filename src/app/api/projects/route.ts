import { createProject } from '@/server/mutations';
import { createProjectSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

export const POST = handle(async (request: Request) => createProject(await readJson(request, createProjectSchema)));
