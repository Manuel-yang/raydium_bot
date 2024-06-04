import { getPoolInfo, getTokenMetadata, } from "../../utils/utils";
import { RaydiumService } from "./raydium.service";

export class TelegramService {

  async swapMsgSender(tokenDest: any) {

    if (tokenDest) {
      // const tokenMetadataDest = await getTokenMetadata(tokenDest.mint)

      // const symbolDest = tokenMetadataDest ? tokenMetadataDest.symbol : "Can't get synbol metadata"
  
      // if (symbolDest != "SOL" && symbolDest != "USDT" && symbolDest != "USDC" ) {
        const poolInfo = await getPoolInfo(tokenDest.mint)
        console.log("start to generate swap tx")
        const rayService = new RaydiumService()
        await rayService.txTracker(poolInfo.poolAddress)
        console.log("swap generate successfully")
         
      // }
    }
  }
}
// }