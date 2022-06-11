import CosmosDirectory from "./CosmosDirectory";
import _ from "lodash";
import { mapAsync, makeClient } from './utils';
import { DelegationResponse } from "../types/Wallet";
import { CosmjsQueryClient, NetworkClient } from "../types/Client";


const directory = new CosmosDirectory();



export class NetworksHandler { 
  clients: NetworkClient[];
  constructor(clients: NetworkClient[]) {
    this.clients = clients
  }
  public static async Create(networks: string[]) {
    const clients = await mapAsync(networks, async (n) => {
      const client = await makeClient(directory.rpcUrl(n));
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
