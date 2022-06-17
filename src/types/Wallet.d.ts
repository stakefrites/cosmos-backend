export type mapFunction = (v: any, i: any, a: any) => Promise<any>;
export type Currency = "usd" | "cad" | "eur";

export interface NetworkClient {
  name: string;
  client: CosmjsQueryClient;
}

//

export interface IUser {
  username: string;
  password: string;
}

interface IWalletBalance {
  delegations: IBalance;
  rewards: IBalance;
  balance: IBalance;
  unbounding: IBalance;
  total: IBalance;
  redelegations: IBalance;
}

interface ITotal {
  [key: string]: IBalance;
}

export interface ITokens {
  total: IBalance[];
  delegations: IBalance[];
  balance: IBalance[];
  rewards: IBalance[];
  unbounding: IBalance[];
  redelegations?: IBalance[];
}

interface IBalance {
  denom: string;
  amount: number;
}

// ACCOUNT

export interface IAccountConfig {
  bech32Address: string;
  evmosAddress?: string;
  name: string;
}

export interface IAccount {
  accounts: IAccountConfig[];
  portfolios: IPortfolio[] | boolean[];
  tokens: ITokens[];
  userId: string;
  currency: string;
}

// PORTFOLIO

export interface IPortfolio {
  account: IAccountConfig;
  wallets: IWallet[] | boolean[];
}

// WALLET

export interface IWallet {
  address: string;
  network: string;
  denom: string;
  decimals: number;
  tokens: ITokens;
}

// Tokens/Currency

export interface ITokenValue {
  usd: number;
  eur: number;
  cad: number;
}

export interface IToken {
  network: string;
  base: string;
  name: string;
  symbol: string;
  units: IDenomUnits[];
  coingeckoId: string;
  price: ITokenValue | false;
  image: string;
}

// Validators

export interface IEntity {
  name: string;
  identity: string;
  validators: IValidator[];
}

// Entity

export interface IValidator {
  name: string;
  identity: string;
  votingPower: number;
  delegators: IDelegator[];
  network: string;
  address: string;
}

// Delegator delegation

export interface IDelegator {
  address: string;
  delegation: Coin;
}
