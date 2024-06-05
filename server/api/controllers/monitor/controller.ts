import { Request, Response } from 'express';
import { TelegramService } from '../../services/telegram.service';

export class MonitorController {
  async receive(req: Request, res: Response) {
    console.log(req.body)
    if (req.body[0].meta.postTokenBalances) {
      const swapRouter = req.body[0].meta.postTokenBalances
      const telegramService = new TelegramService()
      await telegramService.swapMsgSender(swapRouter[swapRouter.length - 1])
      res.status(200).end()
    }
      res.status(404).end()
  }
  
}
export default new MonitorController();
