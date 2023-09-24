import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import userRouter from './routes/user';
import videoRouter from './routes/video';
import cookieParser from 'cookie-parser';

const app = express();
const port = 8000;

app.use(cors({
  origin: ' http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.raw({type:'json'}));

function formatTime() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `[${hours}]-[${minutes}]-[${seconds}]-[${milliseconds}]`;
}

function debug(msg: String) {
  console.log(`[DEBUG] [SERVER] ${formatTime()} + ${msg}`);
}


app.use('/user',userRouter );
app.use('/video',videoRouter );

app.listen(port, () => {
  debug(`Server started on http://localhost:${port}`);
});
