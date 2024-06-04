import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createProvider, generateRayTx, getWallet, initSdk, sendTxByJito } from "../../utils/utils";

export class RaydiumService {
  
  async txTracker(poolAddress: string) {
    const connection = new Connection(process.env.RPC!) 
    const [wallet,keypair] = await getWallet(process.env.PRIVATE_KEY!)
    const provider = await createProvider(connection,wallet)
    const raydium = await initSdk(connection, keypair)

    const swapTx = await generateRayTx(raydium, poolAddress, Number(process.env.AMOUNT_IN) * LAMPORTS_PER_SOL)
    const txSign = await sendTxByJito(provider, swapTx)
    console.log(txSign)
  }
}
