import dotenv from 'dotenv';
dotenv.config();

import { createApiApp } from '../src/server/apiApp';

const app = createApiApp();

export default function handler(req: any, res: any) {
  return app(req, res);
}


