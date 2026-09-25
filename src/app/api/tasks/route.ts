import { createTask } from '@/server/mutations';
import { createTaskSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

export const POST = handle(async (request: Request) => createTask(await readJson(request, createTaskSchema)));
