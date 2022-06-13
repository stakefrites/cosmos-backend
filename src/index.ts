import express from "express";

import { AccountHandler } from './utils/Wallet';
import { DatabaseHandler } from "./db/controller";

//import cron from "node-cron";
import { IAccountConfig } from './types/Wallet';


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

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    const portfolio = await AccountHandler.Create(
        myAccounts,
        ["cosmoshub", "juno", "akash", "sifchain", "evmos"]
    );
    const all = portfolio;
    res.json(all);
})

app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});