import { createComment } from '@/server/mutations';
import { createCommentSchema } from '@/server/validation';
import { handle, readJson } from '@/server/http';

type Ctx = { params: Promise<{ id: string }> };

export const POST = handle(async (request: Request, { params }: Ctx) =>
  createComment((await params).id, await readJson(request, createCommentSchema))
);
