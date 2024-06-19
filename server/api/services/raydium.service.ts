import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createCuLimitIns, createCuPriceIns, createProvider, generateRayTx, getWallet, initSdk, sendTxByJito } from "../../utils/utils";
import { BN } from "@project-serum/anchor";
const cuLimit = createCuLimitIns()
const cuPrice = createCuPriceIns()

export class RaydiumService {
  
  async txTracker(poolAddress: string) {
    const connection = new Connection(process.env.RPC!) 
    const [wallet,keypair] = await getWallet(process.env.PRIVATE_KEY!)
    const provider = await createProvider(connection,wallet)
    const raydium = await initSdk(connection, keypair)
    // console.log(poolAddress)
    const swapTx = await generateRayTx(raydium, poolAddress, new BN(Number(process.env.AMOUNT_IN) * LAMPORTS_PER_SOL))
    swapTx
    .add(cuLimit)
    .add(cuPrice)


    const txSign = await provider.sendAndConfirm(swapTx,[], {skipPreflight:true})
    // const res = await (Promise.all(totalTasks))
    // console.log(res)

    console.log(txSign)
  }
}
