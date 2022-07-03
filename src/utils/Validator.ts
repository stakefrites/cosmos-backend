import { CosmjsQueryClient } from '../types/Client';
import CosmosDirectory from './CosmosDirectory';
import { makeClient } from './utils';

const directory = new CosmosDirectory();

export class ValidatorHandler {
  address: string;
  network: string;
  denom: string;
  decimals: number;
  _client: CosmjsQueryClient;
  constructor(
    address: string,
    network: string,
    client: CosmjsQueryClient,
    denom: string,
    decimals: number
  ) {
    this.address = address;
    this.network = network;
    this._client = client;
    this.denom = denom;
    this.decimals = decimals;
  }

  public static async Create(
    address: string,
    network: string
  ): Promise<ValidatorHandler> {
    const client = await makeClient('https://rpc.evmos.ezstaking.io');
    const chain = await directory.getChain(network);
    const handler = new ValidatorHandler(
      address,
      network,
      client,
      chain.chain.denom,
      chain.chain.decimals
    );
    return handler;
  }

  getDelegators = async (): Promise<any> => {
    const dels = [];

    let nextKey: Uint8Array = Uint8Array.from([1]);
    let firstRun = true;
    let retry = 0;
    let count = 1;
    while (nextKey?.length > 0 || retry == 5) {
      try {
        const delegators: any =
          firstRun === true
            ? await this._client.staking.validatorDelegations(this.address)
            : await this._client.staking.validatorDelegations(
                this.address,
                nextKey
              );
        firstRun = false;
        if (!delegators.pagination) {
          console.log('noting');
          return;
        }
        dels.push(delegators.delegationResponses);
        nextKey = delegators.pagination.nextKey;
        console.log(nextKey?.length);
        console.log(dels.flat().length, count);
        count++;
      } catch (error: any) {
        console.log(error.message);
        retry++;
      }
    }

    const formatted = dels.flat().map((d: any) => {
      const shares = d.delegation.shares / Math.pow(10, 18 + 18);
      return {
        address: d.delegation.delegatorAddress,
        shares: shares.toFixed(2),
      };
    });

    const result = {
      tier1: formatted
        .filter((d: any) => d.shares > 25)
        .map((de: any) => de.address),
      tier2: formatted
        .filter((d: any) => d.shares > 50)
        .map((de: any) => de.address),
    };

    return result;
  };
}
