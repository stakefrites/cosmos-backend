import express from 'express';

import { DatabaseHandler } from '../db/controller';
import { Price } from "../utils/Price";

import {   IToken } from '../types/Wallet';

const router = express.Router();

const priceApi = new Price();
const db = new DatabaseHandler();


router.use("/:id", async (req, res) => {
    const { id } = req.params;
    const found = await db.getTokenById(id);
    if (!found) {
        const price = await priceApi.getPrice(id);
        if (price[id]) {
            const priceReq: IToken = {
                coingeckoId: id,
                price: price[id]
            }
            const added = await db.addToken(priceReq);
            res.json({
                status: "success",
                token: added
            });
        } else { 
            res.json({
                status: "error",
                message: "No price data for that token id"
            })
        }
    } else { 
        res.json({
            status: "success",
            token: found
        });
    }
})

router.use("/", async (req, res) => { 
    const allTokens = await db.getAllTokens();
    res.json(allTokens);
})


export default router;