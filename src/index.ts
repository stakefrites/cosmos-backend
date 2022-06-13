import express from "express";

import TrakmosRouter from "./routes/trakmos";
import {refreshTrakmosAccountsJob } from "./jobs/job"


const port = process.env.PORT || 3000;

const app = express();

refreshTrakmosAccountsJob.start();



app.use(express.json())
app.use("/trakmos", TrakmosRouter);


app.get("/", async (req, res) => {
    res.send("allo")

})


app.listen(port, () => {
    console.log(`Server is running on port ${port} `);
});