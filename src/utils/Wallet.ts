import _ from 'lodash';
import { fromBech32, toBech32 } from '@cosmjs/encoding';
import { Decimal } from '@cosmjs/math';

import CosmosDirectory from './CosmosDirectory';
import { mapAsync, makeClient } from './utils';

import {
  IWalletBalance,
  ITotal,
  IAccount,
  IAccountConfig,
  IWallet,
  IWallet2,
  ITokens,
  IPortfolio,
  Currency,
} from '../types/Wallet';
import {
  DelegationResponse,
  CosmjsQueryClient,
  UnbondingDelegation,
  UnbondingDelegationEntry,
} from '../types/Client';

const directory = new CosmosDirectory();

const reduce = (input: any[], decimals: number): Decimal => {
  return input.reduce(
    (acc: Decimal, data: any) =>
      acc.plus(Decimal.fromAtomics(data.balance.amount, decimals)),
    Decimal.zero(decimals)
  );
};

// @TODO: Create a prefix hash that removes request
// @TODO: Add an abstraction to cover EVMOS addresses
const getAddress = async (address: string, network: string) => {
  const bech32 = fromBech32(address);
  const chainData = await directory.getChainData(network);
  const prefix = chainData.bech32_prefix;
  return toBech32(prefix, bech32.data);
};

export class AccountHandler implements IAccount {
  accounts: IAccountConfig[];
  portfolios: PortfolioHandler[];
  tokens: IWalletBalance | any;
  userId: number;
  currency: Currency;
  constructor(
    accounts: IAccountConfig[],
    portfolios: PortfolioHandler[],
    userId: number,
    currency: Currency
  ) {
    this.accounts = accounts;
    this.portfolios = portfolios;
    this.currency = currency;
    this.tokens = {
      total: [],
      balance: [],
      rewards: [],
      delegations: [],
      unbounding: [],
    };
    this.userId = userId;
  }
  public static async Create(
    accounts: IAccountConfig[],
    networksName: string[],
    userId: number,
    currency: Currency
  ): Promise<AccountHandler> {
    const portfolios = await mapAsync(
      accounts,
      async (account: IAccountConfig) => {
        return await PortfolioHandler.Create(
          account,
          networksName.map((n) => ({ name: n }))
        );
      }
    );
    const account = new AccountHandler(accounts, portfolios, userId, currency);
    account.getAll();
    return account;
  }

  public static async Load(
    a: IAccount,
    userId: number
  ): Promise<AccountHandler> {
    console.log(a, userId);
    const portfolios = await mapAsync(a.portfolios, async (p: IPortfolio) => {
      return await PortfolioHandler.Load(p.account, p.wallets);
    });
    const account = new AccountHandler(
      a.accounts,
      portfolios,
      userId,
      a.currency
    );
    account.tokens = a.tokens;
    return account;
  }

  serialize(): IAccount {
    const serializedPortfolios = this.portfolios.map((portfolio) => {
      return portfolio.serialize();
    });
    return {
      userId: this.userId,
      accounts: this.accounts,
      portfolios: serializedPortfolios,
      tokens: this.tokens,
      currency: this.currency,
    };
  }

  async refresh() {
    await mapAsync(this.portfolios, async (portfolio: any) => {
      await portfolio.refresh();
    });
  }

  getAll() {
    this.getTotal();
    this.getBalance();
    this.getRewards();
    this.getDelegations();
    this.getUnbounding();
  }

  getTotal() {
    const total: ITotal = {};
    this.portfolios.forEach((portfolio) => {
      if (!portfolio) {
        return;
      }
      portfolio.wallets.forEach((wallet) => {
        if (!wallet) {
          return;
        }
        wallet.tokens.total.forEach((tot) => {
          const amount = tot.amount;
          const denom = tot.denom;
          if (!total[denom]) {
            total[wallet.denom] = { amount, denom };
          } else {
            total[wallet.denom].amount += amount;
          }
        });
      });
    });
    this.tokens.total = Object.values(total).map((bal) => ({
      amount: bal.amount,
      denom: bal.denom,
    }));
  }

  getBalance() {
    const balance: ITotal = {};
    this.portfolios.forEach((portfolio) => {
      portfolio.wallets.forEach((wallet) => {
        if (!wallet) {
          return;
        }
        wallet.tokens.balance.forEach((bal) => {
          const amount = bal.amount;
          const denom = bal.denom;
          if (!balance[denom]) {
            balance[wallet.denom] = { amount, denom };
          } else {
            balance[wallet.denom].amount += amount;
          }
        });
      });
    });
    this.tokens.balance = Object.values(balance).map((bal) => ({
      amount: bal.amount,
      denom: bal.denom,
    }));
  }

  getRewards() {
    const rewards: ITotal = {};
    this.portfolios.forEach((portfolio) => {
      portfolio.wallets.forEach((wallet) => {
        if (!wallet) {
          return;
        }
        wallet.tokens.rewards.forEach((reward) => {
          const amount = reward.amount;
          const denom = reward.denom;
          if (!rewards[denom]) {
            rewards[wallet.denom] = { amount, denom };
          } else {
            rewards[wallet.denom].amount += amount;
          }
        });
      });
    });
    this.tokens.rewards = Object.values(rewards).map((reward) => ({
      amount: reward.amount,
      denom: reward.denom,
    }));
  }

  getDelegations() {
    const delegations: ITotal = {};
    this.portfolios.forEach((portfolio) => {
      portfolio.wallets.forEach((wallet) => {
        if (!wallet) {
          return;
        }
        wallet.tokens.delegations.forEach((delegation) => {
          const amount = delegation.amount;
          const denom = delegation.denom;
          if (!delegations[denom]) {
            delegations[wallet.denom] = { amount, denom };
          } else {
            delegations[wallet.denom].amount += amount;
          }
        });
      });
    });
    this.tokens.delegations = Object.values(delegations).map((delegation) => ({
      amount: delegation.amount,
      denom: delegation.denom,
    }));
  }

  getUnbounding() {
    const unbounding: ITotal = {};
    this.portfolios.forEach((portfolio) => {
      portfolio.wallets.forEach((wallet) => {
        if (!wallet) {
          return;
        }
        wallet.tokens.unbounding.forEach((un) => {
          const amount = un.amount;
          const denom = un.denom;
          if (!unbounding[denom]) {
            unbounding[wallet.denom] = { amount, denom };
          } else {
            unbounding[wallet.denom].amount += amount;
          }
        });
      });
    });
    this.tokens.unbounding = Object.values(unbounding).map((bal) => ({
      amount: bal.amount,
      denom: bal.denom,
    }));
  }
}

export class PortfolioHandler implements IPortfolio {
  account: IAccountConfig;
  wallets: WalletHandler[];
  constructor(account: IAccountConfig, wallets: WalletHandler[]) {
    this.account = account;
    this.wallets = wallets;
  }
  public static async Create(
    account: IAccountConfig,
    networksName: { name: string }[]
  ): Promise<PortfolioHandler> {
    const wallets = await mapAsync(networksName, async (network: string) => {
      if (network === 'evmos' && account.evmosAddress) {
        return await WalletHandler.Create(
          await getAddress(account.evmosAddress, network),
          { name: network }
        );
      } else {
        return await WalletHandler.Create(
          await getAddress(account.cosmosAddress, network),
          { name: network }
        );
      }
    });
    return new PortfolioHandler(account, wallets);
  }

  public static async Load(
    account: IAccountConfig,
    wallets: IWallet2[] | boolean[]
  ): Promise<PortfolioHandler> {
    console.log('loading portfolios');
    const walletHandlers: WalletHandler[] = await mapAsync(
      wallets,
      async (wallet: IWallet2) => {
        return await WalletHandler.Load(wallet);
      }
    );
    return new PortfolioHandler(account, walletHandlers);
  }

  serialize(): IPortfolio {
    const serializedWallets = this.wallets.map((wallet) => {
      return wallet.serialize();
    });
    return {
      account: this.account,
      wallets: serializedWallets,
    };
  }

  async refresh() {
    await mapAsync(this.wallets, async (wallet: any) => {
      await wallet.fetchAll();
    });
  }
}

interface Position {
  token: string;
  amount: number;
  type: PositionType;
}

type PositionType = 'staked' | 'rewards' | 'balance' | 'unbounding';

class WalletHandler implements IWallet2 {
  address: string;
  network: {
    name: string;
  };
  denom: string;
  decimals: number;
  holdings: Position[];
  tokens: ITokens;
  _client: CosmjsQueryClient;
  constructor(
    address: string,
    network: { name: string },
    client: CosmjsQueryClient,
    denom: string,
    decimals: number
  ) {
    this.address = address;
    this.network = network;
    this._client = client;
    this.denom = denom;
    this.decimals = decimals;
    this.holdings = [];
    this.tokens = {
      delegations: [],
      balance: [],
      rewards: [],
      unbounding: [],
      redelegations: [],
      total: [],
    };
  }

  public static async Create(
    address: string,
    network: { name: string }
  ): Promise<WalletHandler> {
    const client = await makeClient(directory.rpcUrl(network.name));
    const chain = await directory.getChain(network.name);
    const handler = new WalletHandler(
      address,
      network,
      client,
      chain.chain.denom,
      chain.chain.decimals
    );
    await handler.fetchAll();
    return handler;
  }

  public static async Load(w: IWallet2) {
    console.log(w);
    try {
      const client = await makeClient(directory.rpcUrl(w.network.name));
      const handler = new WalletHandler(
        w.address,
        w.network,
        client,
        w.denom,
        w.decimals
      );
      handler.tokens = w.tokens;
      return handler;
    } catch (e: any) {
      console.log(e.message);
    }
  }

  serialize(): IWallet2 {
    return {
      address: this.address,
      network: this.network,
      denom: this.denom,
      decimals: this.decimals,
      tokens: this.tokens,
      holdings: this.holdings,
    };
  }

  fetchDelegations = async () => {
    const delegations = await this._client.staking.delegatorDelegations(
      this.address
    );
    const amount = reduce(delegations.delegationResponses, this.decimals);
    const denom = this.denom;
    this.holdings.push({
      amount: amount.toFloatApproximation(),
      token: this.denom,
      type: 'staked',
    });
    return { amount: amount.toFloatApproximation(), denom };
  };

  fetchUnboundingDelegations = async () => {
    const unbounding = await this._client.staking.delegatorUnbondingDelegations(
      this.address
    );
    if (unbounding.unbondingResponses.length === 0) {
      return {
        denom: this.denom,
        amount: 0,
      };
    } else {
      const amount = unbounding.unbondingResponses.reduce(
        (acc: any, data: UnbondingDelegation) =>
          acc.plus(
            data.entries.reduce(
              (newAcc: any, data: UnbondingDelegationEntry) => {
                return newAcc.plus(
                  Decimal.fromAtomics(data.balance, this.decimals)
                );
              },
              Decimal.zero(this.decimals)
            )
          ),
        Decimal.zero(this.decimals)
      );
      return { amount: amount.toFloatApproximation(), denom: this.denom };
    }
  };

  fetchRewards = async () => {
    const rewards = await this._client.distribution.delegationTotalRewards(
      this.address
    );
    const denom = this.denom;
    const amount = rewards.total.reduce(
      (acc: any, data: any) =>
        acc.plus(Decimal.fromAtomics(data.amount, this.decimals + 18)),
      Decimal.zero(this.decimals + 18)
    );
    this.holdings.push({
      amount: amount.toFloatApproximation(),
      token: this.denom,
      type: 'rewards',
    });
    return { amount: amount.toFloatApproximation(), denom };
  };

  fetchBalance = async () => {
    const balance = await this._client.bank.balance(this.address, this.denom);
    const amount = Decimal.fromAtomics(balance.amount, this.decimals);
    this.holdings.push({
      amount: amount.toFloatApproximation(),
      token: this.denom,
      type: 'balance',
    });
    return { amount: amount.toFloatApproximation(), denom: this.denom };
  };

  // @TODO: abstract the fetching functions to make use of DECIMALS at this level
  fetchAll = async () => {
    const delegations = await this.fetchDelegations();
    const rewards = await this.fetchRewards();
    const balance = await this.fetchBalance();
    const unbounding = await this.fetchUnboundingDelegations();
    const total = delegations.amount + rewards.amount + balance.amount;
    this.tokens.delegations.push(delegations);
    this.tokens.rewards.push(rewards);
    this.tokens.balance.push(balance);
    this.tokens.unbounding.push(unbounding);
    this.tokens.total.push({
      denom: this.denom,
      amount: total,
    });
  };
}

const accounts = [
  {
    cosmosAddress: 'cosmos1weeu5yuj8n23hd87wsdxqqgfmzzz9zt60cwnnz',
    evmosAddress: 'evmos10zee9936pfxsuvfmenk4vcn70uywnr7zpqgz0c',
    name: 'Jean',
  },
];
const networks = ['cosmoshub', 'juno'];

const testAccount = async () => {
  //const account = await AccountHandler.Create(accounts, networks, 1, 'cad');
  const wallet2 = await WalletHandler.Create(
    'cosmos1zjq5sn0fea6wslhu4kmxlxvluxjs9cpgeu939m',
    { name: 'cosmoshub' }
  );
};
