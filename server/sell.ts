import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createProvider, generateRayTx, getCurrentToken, getPoolInfo, getWallet, initSdk, sendTxByJito } from "./utils/utils"
import * as dotenv from 'dotenv';
import * as path from 'path';
import { BN } from "@project-serum/anchor";
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function sellScan() {
  let count = 0
  const connection = new Connection(process.env.RPC!) 
  const [wallet,keypair] = await getWallet(process.env.PRIVATE_KEY!)
  const provider = await createProvider(connection,wallet)
  const raydium = await initSdk(connection, keypair)
  const holdings = await getCurrentToken(wallet.publicKey)

  for (let token of holdings) {
    if (token.total_profit_pnl > 1 && token.balance > 0 && token.position_percent > 0.5) {
      const balance = token.balance
      const decimals = token.decimals
      const poolInfo = await getPoolInfo(token.address)
      const poolAddress = poolInfo.poolAddress
      const swapTx = await generateRayTx(raydium, poolAddress, new BN(Number((balance/4)) * 10 ** decimals), false)
      await sendTxByJito(provider, swapTx)
      count++
    }
  }
  if (count > 0) {
    console.log(`${count} tokens have been sold....`)
  }
  else {
    console.log("wait for next scan...")
  }
  return 
}

setInterval(sellScan, 20000);