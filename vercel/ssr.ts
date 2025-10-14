import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import { createApp } from '../server';

const app = createApp();
const handler = serverless(app);

export default async (req: VercelRequest, res: VercelResponse) => {
  return handler(req, res);
};
