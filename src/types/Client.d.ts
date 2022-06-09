import {
  QueryClient,
  StakingExtension,
  MintExtension,
  GovExtension,
  IbcExtension,
  BankExtension,
  DistributionExtension,
  Coin
} from "@cosmjs/stargate";

type CosmjsQueryClient = QueryClient & StakingExtension & MintExtension & GovExtension & IbcExtension & BankExtension & DistributionExtension;

interface NetworkClient { 
  name: string;
  client: CosmjsQueryClient;
}

interface IbcCoin extends Coin { 
    ibcDenom?: string
}


type Currency = "usd" | "cad" | "eur";

interface WalletParams { 
    name: string;
    address: string;
}

interface Portfolio { 
    user: string,
    currency: Currency,
    wallets: WalletParams[],
    created: Date,
    lastFetch: Date,
}


type CosmjsQueryClient = QueryClient & StakingExtension & MintExtension & GovExtension & IbcExtension & BankExtension & DistributionExtension;

interface NetworkClient { 
  name: string;
  client:  CosmjsQueryClient;
}

interface SingleDelegationResponse { 
    delegatorAddress: string,
    validatorAddress: string,
    shares :string
}

interface DelegationResponse { 
    delegation: SingleDelegationResponse,
    balance: IbcCoin
}