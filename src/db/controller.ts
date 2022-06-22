import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

import { IAccount, IToken, IUser } from '../types/Wallet';
import { AccountModel, TokenModel, UserModel } from './models';

dotenv.config();
mongoose.connect(process.env.MONGO_DB_URI || 'mongodb+srv://localhost:27017').then(r => console.log('connected'));

export class DatabaseHandler {
  createUser = async (u: IUser) => {
    return await UserModel.create({
      username: u.username,
      password: u.password,
    });
  };

  getUserByUsername = async (username: string) => {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return false;
    }
    return user;
  };
  createAccount = async (a: IAccount) => {
    return await AccountModel.create(a);
  };
  getAccount = async (userId: string) => {
    const account = await AccountModel.findOne({ userId });
    if (!account) {
      return false;
    }
    return account;
  };

  getAllAccounts = async () => {
    return AccountModel.find();
  };

  updateAccount = async (id: string, a: IAccount) => {
    return AccountModel.findByIdAndUpdate(id, a);
  };
  getAllTokens = async () => {
    return TokenModel.find();
  };
  updatePrice = async (id: string, t: any) => {
    return TokenModel.findByIdAndUpdate(id, t);
  };

  addToken = async (t: IToken) => {
    const found = await TokenModel.findOne({ name: t.name });
    if (!found) {
      return await TokenModel.create(t);
    } else {
      return TokenModel.findByIdAndUpdate(found._id, t);
    }
  };
  getTokenById = async (id: string) => {
    const token = await TokenModel.findOne({ coingeckoId: id });
    if (!token) {
      return false;
    } else {
      return token;
    }
  };
  updateTokenById = async (id: string, t: IToken) => {
    return TokenModel.findOneAndUpdate({ coingeckoId: id }, t);
  };
}
