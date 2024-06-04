import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createCuLimitIns, createCuPriceIns, createProvider, generateRayTx, getWallet, initSdk, sendTxByJito } from "../../utils/utils";
const cuLimit = createCuLimitIns()
const cuPrice = createCuPriceIns()

export class RaydiumService {
  
  async txTracker(poolAddress: string) {
    const connection = new Connection(process.env.RPC!) 
    console.time("executionTime");
    const [wallet,keypair] = await getWallet(process.env.PRIVATE_KEY!)
    const provider = await createProvider(connection,wallet)
    const raydium = await initSdk(connection, keypair)
    console.timeEnd("executionTime");

    const swapTx = await generateRayTx(raydium, poolAddress, Number(process.env.AMOUNT_IN) * LAMPORTS_PER_SOL)
    swapTx
    .add(cuLimit)
    .add(cuPrice)

    // const totalTasks: any[] = []
    // for (let i = 0; i < 3; i++) {
    //   totalTasks.push(sendTxByJito(provider, swapTx))
    // }
    const txSign = await sendTxByJito(provider, swapTx)
    // const txSign = await provider.sendAndConfirm(swapTx)
    // const res = await (Promise.all(totalTasks))
    // console.log(res)

    console.log(txSign)
  }
}
