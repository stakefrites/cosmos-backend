import nodeCron from 'node-cron';
import * as dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cron = require('cronitor')(process.env.CRONITOR_API_KEY, {
  environment: process.env.NODE_ENV,
});

cron.wraps(nodeCron);

import { DatabaseHandler, IPrice } from '../db/controller';
import CosmosDirectory from '../utils/CosmosDirectory';
import { Price } from '../utils/Price';
import { AccountHandler } from '../utils/Wallet';
import { mapAsync, sleep } from '../utils/utils';
import { IToken } from '../types/Wallet';

const db = new DatabaseHandler();
const directory = new CosmosDirectory();
const priceApi = new Price();

const addTokenData = async (networkName: string) => {
  const token = await directory.getTokenData(networkName);
  const tokens: IToken[] = token.assets.map((t: any) => {
    return {
      network: token.chain_name,
      base: t.base,
      name: t.name,
      symbol: t.symbol,
      units: t.denom_units,
      image: t.logo_URIs.png ? t.logo_URIs.png : t.logo_URIs.svg,
      coingeckoId: t.coingecko_id || false,
    };
  });

  const saved = mapAsync(tokens, async (t: IToken) => {
    db.addToken(t);
  });
};
// TODO: Change the getAllAccountToInclude nested properties
const refreshTrakmosAccounts = async () => {
  console.log('refreshing');
  const accounts = await db.getAllAccounts();
  console.log(accounts[0].portfolios[0].wallets[0].network);
  await mapAsync(accounts, async (account: any) => {
    console.log(`refreshing ${account.id}`);
    const handler = await AccountHandler.Load(account, account.userId);
    await handler.refresh();
    const data = handler.serialize();
    await db.updateAccount(account._id.toString(), data);
  });
};

//refreshTrakmosAccounts().then(console.log);

const refreshPrices = async () => {
  const tokens = await db.getAllTokens();
  console.log('refreshing prices');
  await mapAsync(tokens, async (token: any) => {
    if (token.coinGeckoId) {
      console.log('hi');
      await sleep(1.2);
      const prices: IPrice[] = await priceApi.getPrice(token.coinGeckoId);

      await db.updatePrice(token.id, prices[token.coinGeckoId]);
    }
  });
  return 'ok for prices';
};

const refreshTokenData = async () => {
  const chains = await directory.getChains();
  const chainNames = Object.keys(chains);
  await mapAsync(chainNames, async (networkName: string) => {
    await sleep(1);
    await addTokenData(networkName);
  });
};

export const refreshTrakmosAccountsJob = cron.schedule(
  'Refresh Trakmos Accounts',
  '0 * * * *',
  refreshTrakmosAccounts
);
export const refreshPricesJob = cron.schedule(
  'Refresh Prices',
  '*/15 * * * *',
  refreshPrices
);
export const refreshTokenDataJob = cron.schedule(
  'Refresh Token Data',
  '0 0 * * 0',
  refreshTokenData
);

const addNetworks = async () => {
  const chains = await directory.getChains();
  const chainNames = Object.keys(chains);
  await mapAsync(chainNames, async (networkName: string) => {
    const chain = await directory.getChain(networkName);
    const added = await db.addNetwork(chain.chain);
  });
};
//addNetworks();

const addTokens = async () => {
  const chains: any = await directory.getChains();
  const chainNames = Object.keys(chains);
  const decimals = Object.values(chains).map((c: any) => c.decimals);
  const mixedData = chainNames.map((c: string, i: number) => ({
    name: c,
    decimals: decimals[i],
  }));
  await mapAsync(mixedData, async (mixed: any) => {
    try {
      const token = await directory.getTokenData(mixed.name);
      const tokens: IToken[] = token.assets.map((t: any) => {
        return {
          network: token.chain_name,
          base: t.base,
          name: t.name,
          symbol: t.symbol,
          units: t.denom_units,
          image: t.logo_URIs.png ? t.logo_URIs.png : t.logo_URIs.svg,
          coinGeckoId: t.coingecko_id || null,
          decimals: mixed.decimals,
        };
      });
      const saved = mapAsync(tokens, async (t: IToken) => {
        db.addToken(t);
      });
    } catch (e: any) {
      console.log(e.message);
    }
  });
};

//addTokens();
