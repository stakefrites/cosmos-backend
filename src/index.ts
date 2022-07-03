import cors from 'cors';
import express from 'express';

import {
  refreshPricesJob,
  refreshTokenDataJob,
  refreshTrakmosAccountsJob,
} from './jobs/job';
import TokensRouter from './routes/tokens';
import TrakmosRouter from './routes/trakmos';

const port = process.env.PORT || 3001;

const app = express();

refreshTrakmosAccountsJob.start();
refreshPricesJob.start();
refreshTokenDataJob.start();

app.use(express.json());
app.use(cors());
app.use('/trakmos', TrakmosRouter);
app.use('/tokens', TokensRouter);

app.get('/', async (req, res) => {
  res.send('allo mon tabarnak');
});

app.get('*/:id', (req, res) => {
  res.send(
    "DÉGÈLES BIGUE, c'est quoi ÇA ====> " +
      req.params.id +
      " C'est mon serveur ti-coco."
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port} `);
});
