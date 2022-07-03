import * as fs from 'fs';

import { ValidatorHandler } from './utils/Validator';

const run = async () => {
  const validator = await ValidatorHandler.Create(
    'evmosvaloper1pz3mcahcrglf3md4lggax5r95gvmppc6x5w7hw',
    'evmos'
  );

  let deleg;
  try {
    deleg = await validator.getDelegators();
    console.log(deleg.tier1);
    fs.writeFileSync('evmos_25.csv', deleg.tier1.join('\n'));
    fs.writeFileSync('evmos_50.csv', deleg.tier2.join('\n'));
  } catch (error: any) {
    console.log(error.message);
    run();
  }
};

run();
