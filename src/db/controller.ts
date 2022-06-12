import mongoose from 'mongoose';
import { IAddAccount } from '../types/Wallet';
import { AccountModel } from './models';

mongoose.connect(process.env.MONGO_DB_URI || 'mongodb://localhost/test');




export class DatabaseHandler { 
    addAccount = async (config: IAddAccount ) => { 
    const account = AccountModel.create({
        userId: config.userId,
        addresses: config.addresses,
        portfolios: config.portfolios
    })

    console.log(account);
    return account;

}    
}
