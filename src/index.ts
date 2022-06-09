import { fromBech32, normalizeBech32, toBech32 } from "@cosmjs/encoding";
import { AxiosError } from "axios";
import { CosmjsQueryClient } from "./types/Client";
import { NetworksHandler, WalletHandler } from "./utils/NewClient";
import * as fs from 'fs';
import * as path from 'path';



const run = async (): Promise<void> => {
 console.log("hello")
};
run();