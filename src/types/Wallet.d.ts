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

interface Delegation {
  delegatorAddress: string;
  validatorAddress: string;
  shares: string;
}



interface DelegationResponse {
  delegation?: Delegation;
  balance?: Coin;
}

interface PageResponse {
  nextKey: Uint8Array;
  total: Long;
}

interface QueryValidatorDelegationsResponse {
  delegationResponses: DelegationResponse[];
  pagination?: PageResponse;
}

interface SingleDelegationResponse { 
    delegatorAddress: string,
    validatorAddress: string,
    shares :string
}

type CosmjsQueryClient = QueryClient & StakingExtension & MintExtension & GovExtension & IbcExtension & BankExtension & DistributionExtension;