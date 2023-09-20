import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import userRouter from './routes/user';
import videoRouter from './routes/video';

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());


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

app.get('/video', (req: Request, res: Response) => {

  const videoPath = path.join(__dirname,`completed/WhatsApp Video 2023-07-21 at 2.40.19 PM.mp4`);    // Define the path to your video file.
  const videoStat = fs.statSync(videoPath);      // Get file details.
  const fileSize = videoStat.size;               // Get the total size of the video.

  const range = req.headers.range;               // Get the "range" header from the client's request.

  // If a "range" header exists, the client requests only a specific part of the video.
  if (range) {
      // Extract the start and end bytes from the range header.
      const parts = range.replace(/bytes=/, "").split("-");   
      const start = parseInt(parts[0], 10);       // Start byte.
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;  // End byte. If not provided, default to file end.

      const chunkSize = (end - start) + 1;  // Calculate the chunk size.

      // Create a read stream for the specific range.
      const stream = fs.createReadStream(videoPath, {start, end});  

      // Respond with a 206 Partial Content status. 
      // This indicates that only a chunk of the resource is sent to the client.
      res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`, 
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
      });

      stream.pipe(res);   // Pipe the video chunk to the response object.
  } 
  // If no "range" header is present, the client requests the whole video.
  else {
      res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
      });

      // Stream the entire video to the client.
      fs.createReadStream(videoPath).pipe(res);   
  }
});

app.use('/user',userRouter );
app.use('/video',videoRouter );

app.listen(port, () => {
  debug(`Server started on http://localhost:${port}`);
});
