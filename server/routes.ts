import { Application } from 'express';
import examplesRouter from './api/controllers/examples/router';
import monitorController from './api/controllers/monitor/router';

export default function routes(app: Application): void {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/monitor', monitorController);
}
