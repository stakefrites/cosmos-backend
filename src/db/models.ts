import mongoose from "mongoose";
import { IAccount } from "../types/Database";


// @TODO: Update schema after adding the helper function that gets the normalized data
const accountSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  addresses: [String],
});

export const AccountModel = mongoose.model<IAccount>("Account", accountSchema);
