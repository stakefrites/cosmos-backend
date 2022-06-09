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

export interface Coin {
  denom: string;
  amount: string;
}

export interface Delegation {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegatorAddress: string;
  /** validator_address is the bech32-encoded address of the validator. */
  validatorAddress: string;
  /** shares define the delegation shares received. */
  shares: string;
}

export interface DelegationResponse {
  delegation?: Delegation;
  balance?: Coin;
}

export interface PageResponse {
  /**
   * next_key is the key to be passed to PageRequest.key to
   * query the next page most efficiently
   */
  nextKey: Uint8Array;
  /**
   * total is total number of results available if PageRequest.count_total
   * was set, its value is undefined otherwise
   */
  total: Long;
}

export interface QueryValidatorDelegationsResponse {
  delegationResponses: DelegationResponse[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}

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