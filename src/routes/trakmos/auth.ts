import express from 'express';
import bcrypt from "bcrypt";

import { DatabaseHandler } from '../../db/controller';

const router = express.Router();
const db = new DatabaseHandler();

const hashPasword = async (pw: string): Promise<string> => { 
    return await bcrypt.hash(pw, 10);
}

const compare = async (pw: string, hash: string): Promise<boolean> => { 
    return await bcrypt.compare(pw, hash);
}


router.post("/signup", async (req, res) => { 
    const { user } = req.body;
    const found = await db.getUserByUsername(user.username);
    if (!found) {
        const hash = await hashPasword(user.password);
        const created = await db.createUser({ username: user.username, password: hash });
        res.json({
            status: "success",
            user: created._id
        })
    } else { 
        const isAuth = await compare(user.password, found.password);
        if (!isAuth) {
            res.json({
                status: "error",
                message: "You are not authorized"
            })
        } else { 
            res.json({
            status: "success",
            user: found._id
        })
        }
    }
})

router.post("/login", async (req, res) => { 
    const { user } = req.body;
    const found = await db.getUserByUsername(user.username);
    if (!found) {
        res.json({
            error: "User not found"
        })
    } else { 
        const isAuth = await compare(user.password, found.password);
        if (!isAuth) {
            res.json({
                status: "error",
                message: "You are not authorized"
            })
        } else { 
            res.json({
            status: "success",
            user: found._id
        })
        }
    }
})

export default router;