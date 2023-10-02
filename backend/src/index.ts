import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import userRouter from './routes/user';
import videoRouter from './routes/video';
import cookieParser from 'cookie-parser';
import { log } from './Utils/Utils'
const app = express();
const port = 8000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.raw({type:'json'}));


app.use('/user',userRouter );
app.use('/video',videoRouter );

app.listen(port, () => {
  log(`Server started on http://localhost:${port}`);
});
