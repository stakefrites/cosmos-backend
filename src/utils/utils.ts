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

export const mapAsync = async (array: any[], fn: mapFunction): Promise<any | boolean> => {
  let promises = await Promise.allSettled(array.map(fn));
  return promises.map((p) => {
    if (p.status == "fulfilled") {
      return p.value;
    } else {
      return false;
    }
  });
};

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