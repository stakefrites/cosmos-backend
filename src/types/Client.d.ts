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

export interface DelegationResponse {
  delegation?: Delegation;
  balance?: Coin;
}


export interface PageResponse {
  nextKey: Uint8Array;
  total: Long;
}

export interface QueryValidatorDelegationsResponse {
  delegationResponses: DelegationResponse[];
  pagination?: PageResponse;
}

export interface SingleDelegationResponse { 
    delegatorAddress: string,
    validatorAddress: string,
    shares :string
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

export interface Delegation {
  delegatorAddress: string;
  validatorAddress: string;
  shares: string;
}

export type CosmjsQueryClient = QueryClient & StakingExtension & MintExtension & GovExtension & IbcExtension & BankExtension & DistributionExtension;


