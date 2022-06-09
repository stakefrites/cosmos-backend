import { fromBech32, normalizeBech32, toBech32 } from "@cosmjs/encoding";
import CosmosDirectory from "./CosmosDirectory";

const directory = new CosmosDirectory();
import _ from "lodash";
import {
  setupStakingExtension,
  QueryClient,
  setupBankExtension,
  setupDistributionExtension,
  setupMintExtension,
  setupGovExtension,
  setupIbcExtension,
  StakingExtension,
  MintExtension,
  GovExtension,
  IbcExtension,
  BankExtension,
  DistributionExtension
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { DelegationResponse } from "../types/Client";


type mapFunction = (v: any, i: any ,a: any) => Promise<any>;

const mapAsync = async (array: any[], fn: mapFunction): Promise<any | boolean> => {
  let promises = await Promise.allSettled(array.map(fn));
  return promises.map((p) => {
    if (p.status == "fulfilled") {
      return p.value;
    } else {
      return false;
    }
  });
};

const makeClient = async (rpcUrl: string) => {
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

type CosmjsQueryClient = QueryClient & StakingExtension & MintExtension & GovExtension & IbcExtension & BankExtension & DistributionExtension;

interface NetworkClient { 
  name: string;
  client: CosmjsQueryClient;
}



export class NetworksHandler { 
  clients: NetworkClient[];
  constructor(clients: NetworkClient[]) {
    this.clients = clients
  }
  public static async Create(networks: string[]) {
    const clients = await mapAsync(networks, async (n) => {
      const client = await makeClient(n === "cosmoshub" ? "https://rpc-cosmoshub.ecostake.com" :  directory.rpcUrl(n));
      return {
        name: n,
        client
      }
    })
    return new NetworksHandler(clients);
  }

  public getClient(network: string) { 
    const client = _.find(this.clients, { name: network });
    if (client) { 
      return client.client;
    } else { 
      throw new Error(`Network ${network} not found`);
    }
  }
}



export class WalletHandler {
  address: string;
  network: string;
  delegations?: DelegationResponse[]
  private _client: CosmjsQueryClient;
  constructor(address: string, network: string, client: CosmjsQueryClient) {
    this.address = address;
    this.network = network
    this._client = client;
  }

  public static async Create(address: string, network: string) { 
    const client = await makeClient(directory.rpcUrl(network));
    return new WalletHandler(address, network, client);
  }

  fetchDelegations = async () => {
    const delegations = await this._client.staking.delegatorDelegations(this.address);
    if (delegations.pagination?.total.toNumber() === 1) {
      return delegations.delegationResponses;
    }
  }

  fetchUnboundingDelegations = async () => { 
    const unbounding = await this._client.staking.delegatorUnbondingDelegations(this.address);
    if (unbounding.pagination?.total.toNumber() === 1) { 

      return unbounding.unbondingResponses;
    }
  }

  fetchRewards = async () => { 
    const rewards = await this._client.distribution.delegationTotalRewards(this.address);
    return rewards.total
  }


}
