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
}


interface ITotal { 
  [key: string]: IBalance;
}



export interface IWallet { 
  address: string;
  network: string;
  denom: string;
  decimals: number;
  tokens: ITokens;
  private _client: any
}


interface IBalance {
  denom: string;
  amount: number;
}

export interface IAccount { 
  addresses: string[];
  portfolios: IPortfolio[];
  tokens: ITokens[];
}

export interface IPortfolio { 
  address: string;
  wallets: any[];
}



export interface ITokens { 
  total: IBalance[];
  delegations: IBalance[];
  balance: IBalance[];
  rewards: IBalance[];
  unbounding: IBalance[];
  redelegations: IBalance[];
}


export interface IAddAccount { 
    userId: string;
    addresses: string[];
    portfolios: IPortfolio[];
}