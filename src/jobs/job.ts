import cron from "node-cron";

import { DatabaseHandler } from '../db/controller';
import { AccountHandler } from '../utils/Wallet';
import { mapAsync } from '../utils/utils';

const db = new DatabaseHandler();

export const refreshAccounts = async () => { 
    const accounts = await db.getAllAccounts();
    const updates = await mapAsync(accounts, async (account) => {
        console.log(`refreshing ${account._id}`)
        const handler = await AccountHandler.Load(account, account.userId);
        await handler.refresh();
        const data = handler.serialize();
        await db.updateAccount(account._id.toString() ,data);
    })

}

export const refreshAccountJob = cron.schedule("0 * * * *", refreshAccounts);
