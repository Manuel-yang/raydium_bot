import { TokenListProvider } from "@solana/spl-token-registry";
import { PoolInfo } from "server/type/poolInfo";
import moment from 'moment-timezone';
import * as anchor from "@project-serum/anchor"
import { ApiV3PoolInfoStandardItem, Raydium, TxVersion, fetchMultipleInfo, parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2/lib/index'
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { ComputeBudgetProgram, Connection, Keypair, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import base58 from "bs58";
const axios = require('axios');


export async function getTokenMetadata(mintAddress: string) {
  const tokens = await new TokenListProvider().resolve()
  const tokenList = await tokens.filterByClusterSlug('mainnet-beta').getList();
  const result = tokenList.filter((token: any) => token.address == mintAddress)[0]
  return result
}

export const getPoolInfo = async (mintAddress: string) => {
  let data = JSON.stringify({
    "method": "getProgramAccounts",
    "jsonrpc": "2.0",
    "params": [
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      {
        "encoding": "jsonParsed",
        "commitment": "confirmed",
        "filters": [
          {
            "dataSize": 165
          },
          {
            "memcmp": {
              "offset": 0,
              "bytes": "AbjsQGUr6GUvM8xT5YGnRZG1CPn3aBj6WZSp7wvfgiwH"
            }
          }
        ]
      }
    ],
    "id": "ec3d1b2b-a3d3-4b0e-a7a5-e7612e15bad4"
  });
  
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
    headers: { 
      'Content-Type': 'application/json', 
      'Cookie': process.env.COOKIE
    },
    data : data
  };
  
  const res = await axios.request(config)
  const rawData = res.data
  if(rawData.pairs) {
    const pairs = rawData.pairs
    const pair = pairs.filter((e: any) => e.dexId == "raydium")[0]
    if (pair.dexId == "raydium") {
      const baseToken = pair.baseToken
      const pairCreatedAt = pair.pairCreatedAt
      const poolInfo: PoolInfo = {
        tokenName: baseToken.name,
        tokenSymbol: baseToken.symbol,
        poolAddress: pair.pairAddress,
        timestamp: pairCreatedAt,
      }
      return poolInfo
    }
  }

  const poolInfo: PoolInfo = {
    tokenName: "can't get data",
    tokenSymbol: "can't get data",
    poolAddress: "can't get data",
    timestamp: 0,
  }
  return poolInfo
}

export const initSdk = async (connection: Connection, keypair: Keypair) => {
  let raydium: Raydium | undefined
  const owner = keypair
  if (raydium) return raydium
  raydium = await Raydium.load({
    owner,
    connection,
    disableFeatureCheck: true,
  })
  return raydium
}

export const sendTxByJito = async (provider: anchor.AnchorProvider, transaction: Transaction) => {
  const lastBlockhash = await provider.connection.getLatestBlockhash()

  transaction
  .add(
    anchor.web3.SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: new anchor.web3.PublicKey("DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL"),
      lamports: Number(process.env.JITO_FEE) * LAMPORTS_PER_SOL
    })
  )

  transaction.recentBlockhash = lastBlockhash.blockhash
  transaction.lastValidBlockHeight = lastBlockhash.lastValidBlockHeight
  transaction.feePayer = provider.publicKey


  provider.wallet.signTransaction(transaction)
  const serializeTx = base58.encode(transaction.serialize())
  const result = jitoSendApi(serializeTx)
  return result
}

export const jitoSendApi = async (serializeTx: string) => {
  const jitoURL = `https://tokyo.mainnet.block-engine.jito.wtf/api/v1/transactions`;
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "sendTransaction",
    params: [serializeTx],
  };

  try {
    console.log("tet")
    const response = await axios.post(jitoURL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data.result;
  } catch (error) {
    console.error(error);
    throw new Error("cannot send!");
  }
}

export function createProvider(connection:any, wallet: NodeWallet) : anchor.AnchorProvider {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return provider
}

export async function getWallet(privateKey: string) : Promise<[NodeWallet , Keypair]> {
  const decodedKey1= bs58.decode(privateKey as string);
  const keypair = Keypair.fromSecretKey(decodedKey1);
  const nodeWallet = new NodeWallet(keypair)
  return [nodeWallet, keypair];
}


export async function generateRayTx(raydium: Raydium, poolId: string, amountIn: number, txVersion = TxVersion.LEGACY): Promise<Transaction> {

  const data = (await raydium.api.fetchPoolById({ ids: poolId })) as any
  const poolInfo = data[0] as ApiV3PoolInfoStandardItem
  const poolKeys = await raydium.liquidity.getAmmPoolKeys(poolId)

  const res = await fetchMultipleInfo({
    connection: raydium.connection,
    poolKeysList: [poolKeys],
    config: undefined,
  })
  const pool = res[0]

  await raydium.liquidity.initLayout()
  const out = raydium.liquidity.computeAmountOut({
    poolInfo: {
      ...poolInfo,
      baseReserve: pool.baseReserve,
      quoteReserve: pool.quoteReserve,
    },
    amountIn: new anchor.BN(amountIn),
    mintIn: poolInfo.mintA.address, 
    mintOut: poolInfo.mintB.address,
    slippage: Number(process.env.SLIPPAGE!),
  })

  // console.log(poolInfo)

  const executeTx = await raydium.liquidity.swap({
    poolInfo,
    amountIn: new anchor.BN(amountIn),
    amountOut: out.amountOut,
    fixedSide: 'in',
    inputMint: poolInfo.mintA.address,
    associatedOnly: false,
    txVersion,
  })
  return executeTx.transaction as Transaction
}

export function createCuLimitIns() {
  return ComputeBudgetProgram.setComputeUnitLimit({ 
    units: 1000000 
  });
}

export function createCuPriceIns() {
  return ComputeBudgetProgram.setComputeUnitPrice({ 
    microLamports: 50_000 
  });
}