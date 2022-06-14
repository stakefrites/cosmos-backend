import express from "express";
import cors from "cors";

import TrakmosRouter from "./routes/trakmos";
import TokensRouter from "./routes/tokens";
import { refreshTrakmosAccountsJob, refreshPricesJob } from './jobs/job';


const port = process.env.PORT || 3000;

const app = express();

refreshTrakmosAccountsJob.start();
refreshPricesJob.start();



app.use(express.json())
app.use(cors())
app.use("/trakmos", TrakmosRouter);
app.use("/tokens", TokensRouter);


app.get("/", async (req, res) => {
    res.send("allo")

})


app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});