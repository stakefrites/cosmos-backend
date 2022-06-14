import cron from "node-cron";

import { DatabaseHandler } from '../db/controller';
import { Price } from "../utils/Price";
import { AccountHandler } from '../utils/Wallet';
import { mapAsync } from '../utils/utils';

const db = new DatabaseHandler();
const priceApi = new Price();

const refreshTrakmosAccounts = async () => { 
    const accounts = await db.getAllAccounts();
    await mapAsync(accounts, async (account) => {
        console.log(`refreshing ${account._id}`)
        const handler = await AccountHandler.Load(account, account.userId);
        await handler.refresh();
        const data = handler.serialize();
        await db.updateAccount(account._id.toString() ,data);
    })

}

const refreshPrices = async () => {
    console.log("refreshing prices")
    const tokens = await db.getAllTokens();
    await mapAsync(tokens, async token => {
        const prices = await priceApi.getPrice(token.coingeckoId);
        await db.updatePrice(token._id.toString(), prices);
     })
} 

export const refreshTrakmosAccountsJob = cron.schedule("0 * * * *", refreshTrakmosAccounts);
export const refreshPricesJob = cron.schedule("*/1 * * * *", refreshPrices);
