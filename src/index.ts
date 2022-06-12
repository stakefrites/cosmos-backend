import express from "express";

import { AccountHandler } from './utils/Wallet';
import { DatabaseHandler } from "./db/controller";

//import cron from "node-cron";


const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    const portfolio = await AccountHandler.Create(
        ["cosmos1xzzwtpwa9x4dmzgrp25g5s3e9n79a8wz7ymq7x","cosmos13x6px55n6neh39jr8vlansrxupgrcwdvp3tz0v", "cosmos1zjq5sn0fea6wslhu4kmxlxvluxjs9cpgeu939m"],
        ["cosmoshub", "juno", "akash", "sifchain", "chihuahua", "cerberus"]
    );
    const all = portfolio;
    res.json(all);
})

app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});