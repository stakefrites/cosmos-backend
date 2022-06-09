import axios from "axios";


class CosmosDirectory  {
  directoryProtocol: string;
  directoryDomain: string;
  chainsUrl: string;
  rpcBase: string;
  restBase: string;
  validatorsUrl: string;
  constructor() {
    this.directoryProtocol = "https";
    this.directoryDomain = "cosmos.directory";
    this.rpcBase = `${this.directoryProtocol}://rpc.${this.directoryDomain}`;
    this.restBase = `${this.directoryProtocol}://rest.${this.directoryDomain}`;
    this.chainsUrl = `${this.directoryProtocol}://chains.${this.directoryDomain}`;
    this.validatorsUrl = `${this.directoryProtocol}://validators.${this.directoryDomain}`;
  }
  rpcUrl = (name: string)  => {
    return this.rpcBase + "/" + name;
  }

  restUrl = (name: string)  => {
    return this.restBase + "/" + name;
  }


  getChains = () => {
    return axios
      .get(this.chainsUrl)
      .then((res) => res.data)
      .then((data) => (Array.isArray(data) ? data : data.chains)) // deprecate
      .then((data) => data.reduce((a: any, v: any) => ({ ...a, [v.path]: v }), {}));
  }

  getChainData = (name: string) => {
    return axios
      .get([this.chainsUrl, name, "chain"].join("/"))
      .then((res) => res.data);
  }

   getTokenData = async  (name: string) => {
    return axios
      .get([this.chainsUrl, name, "assetlist"].join("/"))
      .then((res) => res.data);
  }
}

export default CosmosDirectory;