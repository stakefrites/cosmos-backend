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

interface INetwork {
  name: string;
  slip44: number;
  prefix: string;
}

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
    function findIdByBase(tokens: any[], base: string): number {
      return tokens.find((t) => t.base === base).id;
    }
    const tokens = await client.token.findMany();
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
        portfolios: {
          create: a.portfolios.map((portfolio) => ({
            wallets: {
              create: portfolio.wallets.map((wallet) => ({
                holdings: {
                  create: wallet.holdings.map((position) => ({
                    type: position.type,
                    amount: position.amount,
                    token: {
                      connect: {
                        id: findIdByBase(tokens, position.token),
                      },
                    },
                  })),
                },
              })),
            },
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
    return await client.account.findMany({
      include: {
        portfolios: {
          include: {
            wallets: {
              include: {
                holdings: true,
                network: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
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
    console.log(id, prices);
    if (prices.usd) {
      const price = await client.tokenPrice.create({
        data: {
          tokenId: id,
          price: prices,
          usd: prices.usd,
          cad: prices.cad,
          eur: prices.eur,
        },
      });
    }
  };
  addNetwork = async (n: any) => {
    const created = await client.network.upsert({
      where: { name: n.name },
      update: {
        prefix: n.bech32_prefix,
        coinType: n.slip44,
      },
      create: {
        name: n.chain_name,
        prefix: n.bech32_prefix,
        coinType: n.slip44,
      },
    });
    console.log(created);
  };
  addToken = async (t: any) => {
    try {
      const network = await client.network.findFirst({
        where: { name: t.network },
      });

      const existing = await client.token.findFirst({
        where: { name: t.name },
      });

      console.log(existing);

      console.log('token', t);

      if (!existing) {
        const added = await client.token.create({
          data: {
            name: t.name,
            base: t.base,
            symbol: t.symbol,
            networkId: network ? network.id : 1,
            coinGeckoId: t.coinGeckoId,
            decimals: t.decimals,
            image: t.image,
          },
        });
      } else {
        const updated = await client.token.update({
          where: { id: existing.id },
          data: {
            name: t.name,
            base: t.base,
            symbol: t.symbol,
            networkId: network ? network.id : 1,
            coinGeckoId: t.coinGeckoId,
            decimals: t.decimals,
            image: t.image,
          },
        });
      }
    } catch (e: any) {
      console.log(e.message);
    }
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
