/* 
const portfolio = {
  user: '6291980e9c7ec681d99e7bb2',
  currency: 'cad',
  wallets: [
    {
      name: 'personal',
      address: 'cosmos1zjq5sn0fea6wslhu4kmxlxvluxjs9cpgeu939m'
    }
  ]
}



import { NetworksHandler, WalletHandler } from "./utils/NewClient";
const ACTIVATED_NETWORKS = ["akash", "juno", "cosmoshub", "sifchain"];


const run = async () => {
  const myWallet = await WalletHandler.Create("cosmos1zjq5sn0fea6wslhu4kmxlxvluxjs9cpgeu939m", "cosmoshub");
  console.log(await myWallet.fetchDelegations())
  console.log(await myWallet.fetchUnboundingDelegations())
  console.log(await myWallet.fetchRewards())


};


import { fromBech32, normalizeBech32, toBech32 } from "@cosmjs/encoding";

export interface Coin {
  denom: string;
  amount: string;
}

export interface Delegation {
  delegatorAddress: string;
  validatorAddress: string;
  shares: string;
}

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

import { CosmjsQueryClient } from "./types/Client";
import { NetworksHandler, WalletHandler } from "./utils/NewClient";
import * as fs from 'fs';
import * as path from 'path';

async function getAllValidDelegators(validatorAddress: string, c: CosmjsQueryClient): Promise<string[]> {
  const client = await NetworksHandler.Create(["juno", "cosmoshub"])
  let hasNextPage = true;
  let nextKey: Uint8Array | undefined = undefined;
  let delegatorsAddress: string[] = [];
  while (hasNextPage) { 
    try {
      const delegators: QueryValidatorDelegationsResponse = await c.staking.validatorDelegations(validatorAddress, nextKey);
      delegators.delegationResponses.map(async (d) => { 
      if (d.delegation) { 
        const amount = d.balance ? parseInt(d.balance?.amount) : 0;
        const parsedAmount = amount / Math.pow(10, 6);
        const isAmountValid = parsedAmount > 5 

        const isCosmosValid = await isDelegatorValidOnCosmos(toBech32("cosmos" , fromBech32(validatorAddress).data), client.getClient("cosmoshub"))
        isAmountValid && isCosmosValid  ? delegatorsAddress.push(d.delegation.delegatorAddress) : "";
      }
    })
    hasNextPage = delegators.pagination ? delegators.pagination?.nextKey.length > 0 : false
    console.log(delegatorsAddress.length)
    nextKey = delegators.pagination?.nextKey
    } catch (error) {
      console.log("Network error")
    }
  }
  
  return delegatorsAddress;
}
 
async function isDelegatorValidOnCosmos(delegatorAddress: string, c: CosmjsQueryClient) { 
  const res = await c.staking.delegatorValidator(delegatorAddress, "cosmosvaloper1uepjmgfuk6rnd0djsglu88w7d0t49lmljdpae2");
  const tokens = res.validator ? parseInt(res.validator?.tokens) : 0;
  const parsed = tokens / Math.pow(10, 6);
  return parsed > 5;
}

const run = async () => {
  const client = await NetworksHandler.Create(["juno", "cosmoshub"])
  const validJunoAddresses = await getAllValidDelegators("junovaloper1uepjmgfuk6rnd0djsglu88w7d0t49lml7kqufu", client.getClient("juno"));
  const res = await client.getClient("cosmoshub").staking.delegatorValidator("cosmos1qvj6xdgtfa3w5n63733wlu4qscenvak09s69r3", "cosmosvaloper1uepjmgfuk6rnd0djsglu88w7d0t49lmljdpae2");
  console.log(res.validator?.tokens);
  //const validCosmosAddresses = await getAllValidDelegators("cosmosvaloper1uepjmgfuk6rnd0djsglu88w7d0t49lmljdpae2", client.getClient("cosmoshub"));
  //console.log(validCosmosAddresses.length)
  const bothAddresses = validJunoAddresses.map((a) => {
    return `${a} - ${toBech32("cosmos", fromBech32(a).data)}`
  })
  fs.writeFileSync("junoValidators.csv", bothAddresses.join("\n") ) 
  fs.writeFileSync("junoValidatorsVALIDONCOSMOS.csv", validJunoAddresses.join("\n"))
  //fs.writeFileSync("cosmosValidators.csv", validCosmosAddresses.join("\n") )
  
};
run();

*/
