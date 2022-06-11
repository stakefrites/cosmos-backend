import mongoose from "mongoose";
import { PortfolioHandler, IPortfolio, IAccount } from '../utils/Wallet';


const accountSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  addresses: [String],
  portfolios: [Mixed]
});

export const AccountModel = mongoose.model<IAccount>("Account", accountSchema);
