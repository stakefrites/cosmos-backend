import express from 'express';

import { AccountHandler } from '../../utils/Wallet';
import { DatabaseHandler } from '../../db/controller';

import { IAccountConfig } from '../../types/Wallet';

interface ICreateAccount { 
    accounts: IAccountConfig[];
    networks: string[];
    userId: string;
}

const router = express.Router();
const db = new DatabaseHandler();


router.post("/", async (req, res) => {
    const config: ICreateAccount = req.body.config;
    const found = await db.getAccount(config.userId);
    console.log(found)
    if (found) {
        res.json({
            status: "error",
            message: "An account already exists"
        })
    } else { 
         const portfolio = await AccountHandler.Create(
            config.accounts,
            config.networks,
            config.userId
        );
        const all = portfolio.serialize();
        const created = await db.createAccount(all);
        res.json({
            status: "success",
            account: created._id
        });
    }

})


router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    const found = await db.getAccount(userId);
    if (!found) { 
        res.json({
            status: "error",
            message: "Not found!"
        })
    } else {
        res.json({
            status: "success",
            account: found
        });
    }
})


export default router;