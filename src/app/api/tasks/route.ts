import { createTask } from '@/server/mutations';
import { createTaskSchema } from '@/server/validation';
import { readJson } from '@/server/http';
import { authed } from '@/server/session';

export const POST = authed(async (userId, request: Request) => createTask(userId, await readJson(request, createTaskSchema)));
