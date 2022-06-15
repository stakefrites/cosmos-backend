import mongoose from 'mongoose';
import {  IUser, IAccount, IToken } from '../types/Wallet';
import { AccountModel, UserModel, TokenModel } from './models';
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

    getAllAccounts = async () => { 
        const accounts = await AccountModel.find();
        return accounts;
    }

    updateAccount = async (id: string, a: IAccount) => { 
        const updated = await AccountModel.findByIdAndUpdate(id, a);
        return updated;
    }
    getAllTokens = async () => { 
        const allTokens = await TokenModel.find();
        return allTokens;
    }
    updatePrice = async (id: string, t: any) => {
        const updated = await TokenModel.findByIdAndUpdate(id, t);
        return updated;
    }

    addToken = async (t: IToken) => {
        const found = await TokenModel.findOne({ name: t.name });
        if (!found) {
            const added = await TokenModel.create(t);
            return added;
        } else { 
            return found;
        }
    }
    getTokenById = async (id: string) => { 
        const token = await TokenModel.findOne({ coingeckoId: id });
        if (!token) {
            return false
        } else { 
            return token;
        }
    } 
    updateTokenById = async (id: string, t: IToken) => { 
        const updated = await TokenModel.findOneAndUpdate({ coingeckoId: id }, t);
        return updated;
    }
}
