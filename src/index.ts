import express from "express";

import { AccountHandler } from './utils/Wallet';
import { DatabaseHandler } from './db/controller';

//import cron from "node-cron";
import { IAccountConfig } from './types/Wallet';

import AuthRouter from "./routes/auth";

const myAccounts: IAccountConfig[] = [
    {
        bech32Address: "cosmos1xzzwtpwa9x4dmzgrp25g5s3e9n79a8wz7ymq7x",
        name: "Personnel",
        evmosAddress: "evmos10zee9936pfxsuvfmenk4vcn70uywnr7zpqgz0c"
    },
    {
        bech32Address: "cosmos13x6px55n6neh39jr8vlansrxupgrcwdvp3tz0v",
        name: 'Mati',
        'evmosAddress': "evmos1apkrevnfre3k4eds8j7m79cmvrl6c5jn9en55j"
    }
]
const port = process.env.PORT || 3000;

const app = express();
const db = new DatabaseHandler();

app.use(express.json())
app.use("/auth", AuthRouter);


app.get("/", async (req, res) => {
    const portfolio = await AccountHandler.Create(
        myAccounts,
        ["cosmoshub", "juno", "akash", "sifchain", "evmos"],
        "62a6a05db00bfd49ba4e9681"
    );
    const all = portfolio.serialize();
    const created = await db.createAccount(all);
    res.json({
        status: "success",
        account: created._id
    });

})

app.get("/account/:userId", async (req, res) => {
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


app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});