import { checkCoinInfo, getCoinInfo, getPoolInfo, getTokenMetadata, } from "../../utils/utils";
import { RaydiumService } from "./raydium.service";
import logger from '../../common/logger';


export class MonitorService {

  async swapMsgSender(tokenDest: any) {
    try {
      if (tokenDest) {
        const tokenMetadataDest = await getTokenMetadata(tokenDest.mint)
        const symbolDest = tokenMetadataDest ? tokenMetadataDest.symbol : "Can't get synbol metadata"
        if (symbolDest != "SOL" && symbolDest != "USDT" && symbolDest != "USDC" ) {
          const poolInfo = await getPoolInfo(tokenDest.mint)
          const coinInfo = await getCoinInfo(tokenDest.mint)
          // console.log(coinInfo)
          logger.info(`receive info: poolInfo:${JSON.stringify(poolInfo)}-----coinInfo:${JSON.stringify(coinInfo)}`)
          if (checkCoinInfo(coinInfo)) {
            logger.info(`start to swap: poolInfo:${JSON.stringify(poolInfo)}-----coinInfo:${JSON.stringify(coinInfo)}`)
            const rayService = new RaydiumService()
            await rayService.txTracker(poolInfo.poolAddress)
          }
        }
      }
    }catch(error: any) {
      throw new Error(error)
    }
  }
}
// }