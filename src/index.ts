import express from "express";
import cors from "cors";

import TrakmosRouter from "./routes/trakmos";
import TokensRouter from "./routes/tokens";
import { refreshTrakmosAccountsJob, refreshPricesJob, refreshTokenDataJob } from './jobs/job';

import { ValidatorHandler } from "./utils/Validator";


const port = process.env.PORT || 3000;

const app = express();

refreshTrakmosAccountsJob.start();
refreshPricesJob.start();
refreshTokenDataJob.start();


app.use(express.json())
app.use(cors())
app.use("/trakmos", TrakmosRouter);
app.use("/tokens", TokensRouter);


app.get("/", async (req, res) => {
    const validator = await ValidatorHandler.Create("junovaloper1uepjmgfuk6rnd0djsglu88w7d0t49lml7kqufu", "juno");
    console.log(await validator.getDelegators())
    res.send("allo")

})


app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});
