import { Request, Response } from 'express';
import { MonitorService } from '../../services/monitor.service';

export class MonitorController {
  async receive(req: Request, res: Response) {
    if (req.body[0].meta.postTokenBalances) {
      const swapRouter = req.body[0].meta.postTokenBalances
      const monitorService = new MonitorService()
      await monitorService.swapMsgSender(swapRouter[swapRouter.length - 1])
      res.status(200).end()
    }
      res.status(404).end()
  }
  
}
export default new MonitorController();
