import dotenv from 'dotenv'
import {} from 'dotenv/config'
dotenv.config()
import express from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database.js";
import router from "./routes/index.js";
import Users from "./models/UserModel.js";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(router);

const start = async () => {
    try {
        console.log(process.env.DB_USER)
        await db.authenticate()
        await db.sync()
        app.listen(process.env.PORT, () => console.log('Server running at port 5000'));
    } catch (error) {
        console.log(error)
    }
}
start()
