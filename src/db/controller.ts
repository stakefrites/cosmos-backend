import mongoose from 'mongoose';
import { IAddAccount, IUser, IAccount } from '../types/Wallet';
import { AccountModel, UserModel } from './models';
import * as dotenv from 'dotenv';

dotenv.config();
mongoose.connect(process.env.MONGO_DB_URI || 'mongodb+srv://localhost:27017');



export class DatabaseHandler {
    createUser = async (u: IUser) => {
        const user = await UserModel.create({
            username: u.username,
            password: u.password
        });
        return user;
    }

    getUserByUsername = async (username: string) => { 
        const user = await UserModel.findOne({ username });
        if (!user) { 
            return false
        }
        return user;
    }
    createAccount = async (a: IAccount) => {
        const account = await AccountModel.create(a);
        return account
    }
    getAccount = async (userId: string) => { 
        const account = await AccountModel.findOne({ userId });
        if (!account) { 
            return false
        }
        return account
    }
}
