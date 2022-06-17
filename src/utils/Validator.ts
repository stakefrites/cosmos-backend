import _ from "lodash";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { Decimal } from "@cosmjs/math";

import CosmosDirectory from "./CosmosDirectory";
import { mapAsync, makeClient } from "./utils";

import {
  IWalletBalance,
  ITotal,
  IAccount,
  IAccountConfig,
  IWallet,
  ITokens,
  IPortfolio,
} from "../types/Wallet";
import {
  DelegationResponse,
  CosmjsQueryClient,
  UnbondingDelegation,
  UnbondingDelegationEntry,
} from "../types/Client";

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
    const client = await makeClient(directory.rpcUrl(network));
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
    const delegators = await this._client.staking.validatorDelegations(
      this.address
    );
    return delegators;
  };
}
