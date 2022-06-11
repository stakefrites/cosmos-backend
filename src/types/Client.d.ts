import {
  QueryClient,
  StakingExtension,
  MintExtension,
  GovExtension,
  IbcExtension,
  BankExtension,
  DistributionExtension,
} from "@cosmjs/stargate";

type mapFunction = (v: any, i: any, a: any) => Promise<any>;
type Currency = "usd" | "cad" | "eur";


interface Coin {
  denom: string;
  amount: string;
}

interface IbcCoin extends Coin { 
    ibcDenom?: string
}
type CosmjsQueryClient = QueryClient & StakingExtension & MintExtension & GovExtension & IbcExtension & BankExtension & DistributionExtension;

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

interface SingleDelegationResponse { 
    delegatorAddress: string,
    validatorAddress: string,
    shares :string
}

interface DelegationResponse { 
    delegation: SingleDelegationResponse,
    balance: IbcCoin
}
interface NetworkClient { 
  name: string;
  client:  CosmjsQueryClient;
}