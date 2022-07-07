import * as PrismaPkg from '@prisma/client';
const { PrismaClient } = PrismaPkg;
const client = new PrismaClient();

import { IAccount, IToken, IUser } from '../types/Wallet';

export interface IPrice {
  [key: string]: number;
  usd: number;
  cad: number;
  eur: number;
}

type UpdatePriceRequest = {
  price: IPrice;
};
export class DatabaseHandler {
  createUser = async (u: IUser) => {
    return await client.user.create({
      data: {
        username: u.username,
        password: u.password,
      },
    });
  };

  getUserByUsername = async (username: string) => {
    const user = await client.user.findFirst({ where: { username } });
    if (!user) {
      return false;
    }
    return user;
  };
  createAccount = async (a: IAccount) => {
    return await client.account.create({
      data: {
        userId: a.userId,
        currency: a.currency,
        accountConfig: {
          create: a.accounts.map((config) => ({
            name: config.name,
            cosmosAddress: config.cosmosAddress,
            evmosAddress: config.evmosAddress,
          })),
        },
      },
    });
  };
  getAccount = async (userId: number) => {
    const account = await client.account.findFirst({ where: { userId } });
    if (!account) {
      return false;
    }
    return account;
  };

  getAllAccounts = async () => {
    return await client.account.findMany();
  };

  updateAccount = async (id: number, a: IAccount) => {
    return await client.account.update({
      where: { id },
      data: {
        userId: a.userId,
        currency: a.currency,
        accountConfig: {
          create: a.accounts.map((config) => ({
            name: config.name,
            cosmosAddress: config.cosmosAddress,
            evmosAddress: config.evmosAddress,
          })),
        },
      },
    });
  };
  getAllTokens = async () => {
    return await client.token.findMany();
  };
  updatePrice = async (id: number, prices: IPrice) => {
    return await client.tokenPrice.update({
      where: { id },
      data: {
        tokenId: id,
        ...prices,
      },
    });
  };

  addToken = async (t: IToken) => {
    const network = await client.network.findFirst({
      where: { name: t.network },
    });
    const added = await client.token.upsert({
      where: {
        id: t.id,
      },
      update: {
        name: t.name,
      },
      create: {
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals,
        networkId: network?.id || 1,
      },
    });
  };
  getTokenById = async (id: string) => {
    const token = await client.token.findFirst({ where: {} });
    if (!token) {
      return false;
    } else {
      return token;
    }
  };
  updateTokenById = async (id: number, t: IToken) => {
    return await client.token.update({
      where: { id },
      data: {
        name: t.name,
        decimals: t.decimals,
        coinGeckoId: t.coinGeckoId,
      },
    });
  };
}
