import {
  setupStakingExtension,
  QueryClient,
  setupBankExtension,
  setupDistributionExtension,
  setupMintExtension,
  setupGovExtension,
  setupIbcExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { mapFunction } from "../types/Wallet";

export function mapAsync(arr: any, fn: Function){
  return arr.reduce((lastProm: Promise<any>, val: any) => lastProm.then(
    (resultArrSoFar) => fn(val)
      .then((result: any) => [...resultArrSoFar, result])
  ), Promise.resolve([]));
}

export const makeClient = async (rpcUrl: string) => {
  const tmClient = await Tendermint34Client.connect(rpcUrl);
  return QueryClient.withExtensions(
    tmClient,
    setupStakingExtension,
    setupIbcExtension,
    setupBankExtension,
    setupDistributionExtension,
    setupMintExtension,
    setupGovExtension
  );
}; 

export const sleep = (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}