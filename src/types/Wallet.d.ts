export type mapFunction = (v: any, i: any, a: any) => Promise<any>;
export type Currency = "usd" | "cad" | "eur";



export interface NetworkClient { 
  name: string;
  client:  CosmjsQueryClient;
}


//

export interface IUser { 
  address: string;
  hash: string;
}


export interface IWalletParams { 
    name: string;
    address: string;
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
  portfolios: IPortfolio[];
  tokens: ITokens[];
}

export interface IAddAccount { 
    userId: string;
    addresses: string[];
    portfolios: IPortfolio[];
}

// PORTFOLIO

export interface IPortfolio { 
  account: IAccountConfig;
  wallets: any[];
}

// WALLET 

export interface IWallet { 
  address: string;
  network: string;
  denom: string;
  decimals: number;
  tokens: ITokens;
  _client: any
}



export interface ITokens { 
  total: IBalance[];
  delegations: IBalance[];
  balance: IBalance[];
  rewards: IBalance[];
  unbounding: IBalance[];
  redelegations?: IBalance[];
}
