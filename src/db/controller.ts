import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_DB_URI || 'mongodb://localhost/test');
import { PortfolioHandler } from '../utils/Wallet';
import { AccountModel } from './models';


interface IAddAccount { 
    userId: string;
    addresses: string[];
    portfolios: PortfolioHandler[];
}

export const addAccount = async (config: IAddAccount ) => { 
    const account = AccountModel.create({
        userId: config.userId,
        addresses: config.addresses,
        portfolios: config.portfolios
    })

    console.log(account);
    return account;

}