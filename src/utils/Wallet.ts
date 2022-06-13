import _ from "lodash";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { Decimal } from "@cosmjs/math";

import CosmosDirectory from "./CosmosDirectory";
import { mapAsync, makeClient } from './utils';

import { IWalletBalance, ITotal, IAccount, IAccountConfig, IWallet, ITokens, IPortfolio } from '../types/Wallet';
import { DelegationResponse, CosmjsQueryClient, UnbondingDelegation, UnbondingDelegationEntry } from "../types/Client";



const directory = new CosmosDirectory();

const reduce = (input: any[], decimals :number): Decimal => { 
  return input.reduce((acc: Decimal, data: any) => acc.plus(Decimal.fromAtomics(data.balance.amount, decimals)), Decimal.zero(decimals));
}



// @TODO: Create a prefix hash that removes request
// @TODO: Add an abstraction to cover EVMOS addresses
const getAddress = async (address: string, network: string) => { 
  const bech32 = fromBech32(address);
  const chainData = await directory.getChainData(network);
  const prefix = chainData.bech32_prefix;
  return toBech32(prefix, bech32.data);

}

export class AccountHandler { 
  accounts: IAccountConfig[];
  portfolios: PortfolioHandler[];
  tokens: IWalletBalance | any;
  constructor(accounts: IAccountConfig[], portfolios: PortfolioHandler[]) {
    this.accounts = accounts;
    this.portfolios = portfolios;
    this.tokens = {total : [], balance: [], rewards: [], delegations: [], unbounding: []};
  };
  public static async Create(accounts: IAccountConfig[], networksName: string[]): Promise<AccountHandler> {
    const portfolios = await mapAsync(accounts, async (account: IAccountConfig) => { 
      return await PortfolioHandler.Create(account, networksName);
    })
    const account = new AccountHandler(accounts, portfolios);
    account.getAll();
    return account;
  }

  public static async Load(a: IAccount): Promise<AccountHandler> {
    const portfolios = await mapAsync(a.portfolios, async (p: IPortfolio) => {
      return await PortfolioHandler.Load(p.account,p.wallets);
    })
    const account = new AccountHandler(a.accounts, portfolios);
    account.tokens = a.tokens;
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
        wallet.tokens.total.forEach(tot => { 
          const amount = tot.amount;
          const denom = tot.denom;
          if (!total[denom]) {
            total[wallet.denom] = { amount, denom };
          } else { 
            total[wallet.denom].amount += amount;
          }
        })
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
        wallet.tokens.balance.forEach(bal => { 
          const amount = bal.amount;
          const denom = bal.denom;
          if (!balance[denom]) {
            balance[wallet.denom] = { amount, denom };
          } else { 
            balance[wallet.denom].amount += amount;
          }
        })
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
        wallet.tokens.rewards.forEach(reward => { 
          const amount = reward.amount;
          const denom = reward.denom;
          if (!rewards[denom]) {
            rewards[wallet.denom] = { amount, denom };
          } else { 
            rewards[wallet.denom].amount += amount;
          }
        })
      })
    })
    this.tokens.rewards = Object.values(rewards).map(reward => ({
      amount: reward.amount,
      denom: reward.denom
    }));
  }

  getDelegations() { 
    let delegations: ITotal = {};
    this.portfolios.forEach(portfolio => { 
      portfolio.wallets.forEach(wallet => { 
        wallet.tokens.delegations.forEach(delegation => { 
          const amount = delegation.amount;  
          const denom = delegation.denom;
           if (!delegations[denom]) {
          delegations[wallet.denom] = { amount, denom };
        } else { 
          delegations[wallet.denom].amount += amount;
        }
        })
      })
    })
    this.tokens.delegations = Object.values(delegations).map(delegation => ({
      amount: delegation.amount,
      denom: delegation.denom
    }));
  }

  getUnbounding() { 
    let unbounding: ITotal = {};
    this.portfolios.forEach(portfolio => { 
      portfolio.wallets.forEach(wallet => {
        wallet.tokens.unbounding.forEach(un => { 
          const amount = un.amount;
          const denom = un.denom;
          if (!unbounding[denom]) {
            unbounding[wallet.denom] = { amount, denom };
          } else { 
            unbounding[wallet.denom].amount += amount;
          }
        })
      })
    })
    this.tokens.unbounding = Object.values(unbounding).map(bal => ({
      amount: bal.amount,
      denom: bal.denom
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
  public static async Create(account: IAccountConfig, networksName: string[]): Promise<PortfolioHandler> {
    const wallets = await mapAsync(networksName, async (network: string) => { 
       if (network === "evmos" && account.evmosAddress) {
         return await WalletHandler.Create(await getAddress(account.evmosAddress, network), network);
       } else {  
         return await WalletHandler.Create(await getAddress(account.bech32Address, network), network);
       }
    })
    const portfolio = new PortfolioHandler(account, wallets);
    return portfolio;
  }

   public static async Load(account: IAccountConfig, wallets: IWallet[]): Promise<PortfolioHandler> {
     const walletHandlers: WalletHandler[] = await mapAsync(wallets, async (wallet: IWallet) => {
       return await WalletHandler.Load(wallet);
    })
    const portfolio = new PortfolioHandler(account, walletHandlers);
    return portfolio;
  }
}



export class WalletHandler implements IWallet {
  address: string;
  network: string;
  denom: string;
  decimals: number;
  tokens: ITokens;
  delegations?: DelegationResponse[]
  _client: CosmjsQueryClient;
  constructor(address: string, network: string, client: CosmjsQueryClient, denom: string, decimals: number) {
    this.address = address;
    this.network = network
    this._client = client;
    this.denom = denom;
    this.decimals = decimals;
    this.tokens = {
      delegations: [],
      balance: [],
      rewards: [],
      unbounding: [],
      redelegations: [],
      total: []
    }
  }

  public static async Create(address: string, network: string): Promise<WalletHandler> { 
    const client = await makeClient(directory.rpcUrl(network));
    const chain = await directory.getChain(network);
    const handler = new WalletHandler(address, network, client,  chain.chain.denom, chain.chain.decimals);
    await handler.fetchAll();
    return handler;
  }

  public static async Load(w: IWallet) {
    const client = await makeClient(directory.rpcUrl(w.network));
    const handler = new WalletHandler(w.address, w.network, client, w.denom, w.decimals);
    handler.tokens = w.tokens;
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

  fetchRedelegations = async () => { 
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
    this.tokens.delegations.push(delegations);
    this.tokens.rewards.push(rewards);
    this.tokens.balance.push(balance);
    this.tokens.unbounding.push(unbounding);
    this.tokens.total.push({
      denom: this.denom,
      amount: total
    })
  }


}
