import { fromBech32, normalizeBech32, toBech32 } from "@cosmjs/encoding";
import CosmosDirectory from "./CosmosDirectory";

const directory = new CosmosDirectory();
import _ from "lodash";
import {
  setupStakingExtension,
  QueryClient as CosmjsQueryClient,
  setupBankExtension,
  setupDistributionExtension,
  setupMintExtension,
  setupGovExtension,
  setupIbcExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";


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
  return CosmjsQueryClient.withExtensions(
    tmClient,
    setupStakingExtension,
    setupIbcExtension,
    setupBankExtension,
    setupDistributionExtension,
    setupMintExtension,
    setupGovExtension
  );
};

const ACTIVATED_NETWORKS = ["akash", "juno", "cosmoshub", "sifchain"];


export class PortfolioHandler {
  accounts: Account[];
  total: number;

    private constructor() {
        this.accounts = [];
        this.total = 0;
  }

  public static async Create(p: Portfolio): Promise<PortfolioHandler> { 
    const handler = new PortfolioHandler();
    handler.accounts = p.wallets.map(w => new Account(w.address, ACTIVATED_NETWORKS));
    await mapAsync(handler.accounts, async (acc) => { 
      await acc.init();
      await acc.getPortfolio();
    })
    return handler;
  }

  getAddresses(): string[] { 
    return this.accounts.map(a => a.address);
  }

  getBalances() { 
    return this.accounts.map(a => a.balances);
  }

}


export class Account {
  address: string;
  activated: string[];
  networks: any[];
  addresses: any[];
  rewards: any[];
  staked: any[];
  balances: any[]
  constructor(address: string, activated: string[]) {
    this.address = address;
    this.activated = activated
  }

  init = async () => {
    try {
      const networks = await mapAsync(this.activated, async (network) => {
        const chains = await directory.getChains();
        const chain = chains[network]
        const chainData = await directory.getChainData(network);
        return {
          ...chain,
          data: chainData,
          rpc: directory.rpcUrl(network),
          rest: directory.restUrl(network)
        }
      })
      this.networks = networks;
      await this.getAddresses();
    } catch (error) {
      return error;
    }
  };

  getPortfolio = async () => { 
    try {
      await this.getBalances();
      await this.getRewards();
      await this.getStaked();
      return {
        balances: this.balances,
        rewards: this.rewards,
        staked: this.staked
      }
    } catch (error) {
      console.log(error)
      return error;
    }
  }

  getAddresses = async () => {
    const decoded = fromBech32(this.address);
    const addresses = await mapAsync(this.networks, (network) => {
      try {
        const address = toBech32(network.data.bech32_prefix, decoded.data);
        return {
          address,
          network: network.name,
        }
      } catch (error) {
        console.log(error)
      }
    });
    this.addresses = addresses;

  };

    getIbcDenoms = async (coins, client) => {
    return await mapAsync(coins, async (c) => {
      if (c.denom.includes("ibc")) {
        const hash = c.denom.split("/")[1];
        const denomTrace = await client.ibc.transfer.denomTrace(hash);
        return {
          denom: denomTrace.denomTrace.baseDenom,
          amount: c.amount,
          ibcDenom: c.denom,
        };
      } else {
        return c;
      }
    });
  };


  getBalances = async (): Promise<void> => {
    const balances : Promise<BalanceData> = await mapAsync(this.addresses, async (a) => {
      const network = _.keyBy(this.networks, "name")[a.network];
      const client = await makeClient(network.rpc);
      const allBalances = await client.bank.allBalances(a.address);
      const denoms = await this.getIbcDenoms(allBalances, client);
      const parsedDenoms = denoms.map((d) => {
        return {
          denom: d.denom,
          amount: parseInt(d.amount),
          ibcDenom: d.ibcDenom ? d.ibcDenom : false,
        };
      });
      return {
        address: a.address,
        network: a.network,
        balances: parsedDenoms,
      };
    });
    this.balances = balances;
  };

   getStaked = async () => {
     const staked = await mapAsync(this.addresses, async (a) => {
      const network = _.keyBy(this.networks, "name")[a.network];
      const client = await makeClient(network.rpc);
      const staked = await client.staking.delegatorDelegations(a.address);
      return {
        staked,
        address: a.address,
        network: a.network,
      };
     });
     this.staked = staked;
     return staked
   };
  
   getRewards = async () => {
     const rewards =  await mapAsync(this.addresses, async (a) => {
      const network = _.keyBy(this.networks, "name")[a.network];
      const client = await makeClient(network.rpc);
      const rewards = await client.distribution.delegationTotalRewards(
        a.address
      );
       return {
         network: a.network,
         address: a.address,
         rewards
      };
     });
     this.rewards = rewards;
   };
  

}

export const validateAddress = (address) => {
  try {
    fromBech32(address);
    return true;
  } catch (error) {
    return false;
  }
};