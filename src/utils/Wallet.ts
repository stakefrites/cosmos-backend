import CosmosDirectory from "./CosmosDirectory";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import _ from "lodash";
import { mapAsync, makeClient } from './utils';
import { DelegationResponse } from "../types/Wallet";
import { CosmjsQueryClient } from "../types/Client";
import { Coin } from "@cosmjs/stargate";
import { Decimal } from "@cosmjs/math";


const directory = new CosmosDirectory();

const reduce = (input: any[], decimals :number): Decimal => { 
  return input.reduce((acc: Decimal, data: any) => acc.plus(Decimal.fromAtomics(data.balance.amount, decimals)), Decimal.zero(decimals));
}

interface IBalance {
  denom: string;
  amount: number;
}


interface IWalletBalance { 
  delegations: IBalance;
  rewards: IBalance;
  balance: IBalance;
  unbounding: IBalance;
  total: IBalance;
}

export interface UnbondingDelegation {
    /** delegator_address is the bech32-encoded address of the delegator. */
    delegatorAddress: string;
    /** validator_address is the bech32-encoded address of the validator. */
    validatorAddress: string;
    /** entries are the unbonding delegation entries. */
    entries: UnbondingDelegationEntry[];
}

export interface UnbondingDelegationEntry {
    /** creation_height is the height which the unbonding took place. */
    creationHeight: Long;
    /** completion_time is the unix time for unbonding completion. */
    /** initial_balance defines the tokens initially scheduled to receive at completion. */
    initialBalance: string;
    /** balance defines the tokens to receive at completion. */
    balance: string;
}



// @TODO: Create a prefix hash that removes request
// @TODO: Add an abstraction to cover EVMOS addresses
const getAddress = async (address: string, network: string) => { 
  const bech32 = fromBech32(address);
  const chainData = await directory.getChainData(network);
  const prefix = chainData.bech32_prefix;
  return toBech32(prefix, bech32.data);

}

interface ITotal { 
  [key: string]: IBalance;
}


export interface IPortfolio { 
  address: string;
  name: string;
}


export interface IAccount { 
  addresses: IPortfolio[];
  portfolios: PortfolioHandler[];

}

export class AccountHandler { 
  addresses: string[];
  portfolios: PortfolioHandler[];
  tokens: IWalletBalance | any;
  constructor(addresses: string[], portfolios: PortfolioHandler[]) {
    this.addresses = addresses;
    this.portfolios = portfolios;
    this.tokens = {total : [], balance: [], rewards: [], delegations: [], unbounding: []};
  };
  public static async Create(addresses: string[], networksName: string[]): Promise<AccountHandler> {
    const portfolios = await mapAsync(addresses, async (address) => { 
      return await PortfolioHandler.Create(address, networksName);
    })
    const account = new AccountHandler(addresses, portfolios);
    account.getAll();
    return account;
  }

  getAll() { 
    this.getTotal();
    this.getBalance();
    this.getRewards();
    this.getDelegations();
    this.getUnbounding();
  }

  getTotal() { 
    let total: ITotal = {};
    this.portfolios.forEach(portfolio => { 
      portfolio.wallets.forEach(wallet => { 
        const amount = wallet.tokens.total.amount;
        const denom = wallet.denom;
        if (!total[denom]) {
          total[wallet.denom] = { amount, denom };
        } else { 
          total[wallet.denom].amount += amount;
        }
      })
    })
    this.tokens.total = Object.values(total).map(bal => ({
      amount: bal.amount,
      denom: bal.denom
    }));

  }

  getBalance() { 
    let balance: ITotal = {};
    this.portfolios.forEach(portfolio => { 
      portfolio.wallets.forEach(wallet => { 
        const amount = wallet.tokens.balance.amount;
        const denom = wallet.denom;
        if (!balance[denom]) {
          balance[wallet.denom] = { amount, denom };
        } else { 
          balance[wallet.denom].amount += amount;
        }
      })
    })
    this.tokens.balance = Object.values(balance).map(bal => ({
      amount: bal.amount,
      denom: bal.denom
    }));
  }

  getRewards() { 
    let rewards: ITotal = {};
    this.portfolios.forEach(portfolio => { 
      portfolio.wallets.forEach(wallet => { 
        const amount = wallet.tokens.rewards.amount;
        const denom = wallet.denom;
        if (!rewards[denom]) {
          rewards[wallet.denom] = { amount, denom };
        } else { 
          rewards[wallet.denom].amount += amount;
        }
      })
    })
    this.tokens.rewards = Object.values(rewards).map(bal => ({
      amount: bal.amount,
      denom: bal.denom
    }));
  }

  getDelegations() { 
    let delegations: ITotal = {};
    this.portfolios.forEach(portfolio => { 
      portfolio.wallets.forEach(wallet => { 
        const amount = wallet.tokens.delegations.amount;
        const denom = wallet.denom;
        if (!delegations[denom]) {
          delegations[wallet.denom] = { amount, denom };
        } else { 
          delegations[wallet.denom].amount += amount;
        }
      })
    })
    this.tokens.delegations = Object.values(delegations).map(bal => ({
      amount: bal.amount,
      denom: bal.denom
    }));
  }

  getUnbounding() { 
    let unbounding: ITotal = {};
    this.portfolios.forEach(portfolio => { 
      portfolio.wallets.forEach(wallet => { 
        const amount = wallet.tokens.unbounding.amount;
        const denom = wallet.denom;
        if (!unbounding[denom]) {
          unbounding[wallet.denom] = { amount, denom };
        } else { 
          unbounding[wallet.denom].amount += amount;
        }
      })
    })
    this.tokens.unbounding = Object.values(unbounding).map(bal => ({
      amount: bal.amount,
      denom: bal.denom
    }));
  }

    
}


export class PortfolioHandler { 
  address: string;
  wallets: WalletHandler[];
  constructor(address: string, wallets: WalletHandler[]) {
    this.address = address;
    this.wallets = wallets;
  }
  public static async Create(address: string, networksName: string[]): Promise<PortfolioHandler> {
    const wallets = await mapAsync(networksName, async (network) => { 
      const wallet = await WalletHandler.Create(await getAddress(address, network), network);
      return wallet;
    })
    const portfolio = new PortfolioHandler(address, wallets);
    return portfolio;
  }
}



export class WalletHandler {
  address: string;
  network: string;
  denom: string;
  decimals: number;
  tokens: IWalletBalance;
  delegations?: DelegationResponse[]
  private _client: CosmjsQueryClient;
  constructor(address: string, network: string, client: CosmjsQueryClient, denom: string, decimals: number) {
    this.address = address;
    this.network = network
    this._client = client;
    this.denom = denom;
    this.decimals = decimals;
    this.tokens = {
      delegations: {
        denom,
        amount: 0
      },
      balance: {
       denom,
        amount: 0
      },
      rewards: {
        denom,
        amount: 0
      },
      unbounding: {
        denom,
        amount: 0
      },
      total: {
        denom, 
        amount: 0
      }
    }
  }

  public static async Create(address: string, network: string): Promise<WalletHandler> { 
    const client = await makeClient(directory.rpcUrl(network));
    const chain = await directory.getChain(network);
    const handler = new WalletHandler(address, network, client,  chain.chain.denom, chain.chain.decimals);
    await handler.fetchAll();
    return handler;
  }


  fetchDelegations = async () => {
    const delegations = await this._client.staking.delegatorDelegations(this.address);
    const amount = reduce(delegations.delegationResponses, this.decimals);
    const denom = this.denom;
    return {amount: amount.toFloatApproximation(),denom}
  }

  fetchUnboundingDelegations = async () => { 
    const unbounding = await this._client.staking.delegatorUnbondingDelegations(this.address);
    if (unbounding.unbondingResponses.length === 0) {
      return {
        denom: this.denom,
        amount: 0
      }
    } else { 
      const amount = unbounding.unbondingResponses.reduce(
        (acc: any, data: UnbondingDelegation) => acc.plus(
            data.entries.reduce(
              (newAcc: any, data: UnbondingDelegationEntry) => {
                console.log(Decimal.fromAtomics(data.balance, this.decimals), newAcc);
                return newAcc.plus(
                  Decimal.fromAtomics(
                    data.balance,
                    this.decimals
                  )
                )
              },
               Decimal.zero(this.decimals)
            )
        ),
        Decimal.zero(this.decimals)
        );
      return  { amount: amount.toFloatApproximation(), denom: this.denom };
    }
  }

  fetchRewards = async () => { 
    const rewards = await this._client.distribution.delegationTotalRewards(this.address);
    const denom = this.denom
    const amount = rewards.total.reduce((acc: any, data: any) => acc.plus(Decimal.fromAtomics(data.amount, this.decimals+ 18)), Decimal.zero(this.decimals+ 18));
    return {amount: amount.toFloatApproximation(), denom}
  }

  fetchBalance = async () => {
    const balance = await this._client.bank.balance(this.address, this.denom);
    const amount = Decimal.fromAtomics(balance.amount, this.decimals);
    return { amount: amount.toFloatApproximation(), denom: this.denom };
  }

  // @TODO: abstract the fetching functions to make use of DECIMALS at this level
  fetchAll = async () => {
    const delegations = await this.fetchDelegations();
    const rewards = await this.fetchRewards();
    const balance = await this.fetchBalance();
    const unbounding = await this.fetchUnboundingDelegations();
    const total = delegations.amount + rewards.amount + balance.amount;
    this.tokens.delegations = delegations;
    this.tokens.rewards = rewards;
    this.tokens.balance = balance;
    this.tokens.unbounding = unbounding;
    this.tokens.total = {
      denom: this.denom,
      amount: total
    }
  }


}
