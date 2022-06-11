interface IUser { 
  address: string;
  hash: string;
}

interface IPortfolio { 
    user: IUser,
    currency: Currency,
    wallets: WalletParams[],
    created: Date,
    lastFetch: Date,
}