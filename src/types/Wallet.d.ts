export type mapFunction = (v: any, i: any, a: any) => Promise<any>;
export type Currency = "usd" | "cad" | "eur";



export interface NetworkClient { 
  name: string;
  client:  CosmjsQueryClient;
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
  portfolios: IPortfolio[];
  tokens: ITokens[];
  userId: string;
}


// PORTFOLIO

export interface IPortfolio { 
  account: IAccountConfig;
  wallets: IWallet[];
}

// WALLET 

export interface IWallet { 
  address: string;
  network: string;
  denom: string;
  decimals: number;
  tokens: ITokens;
}

