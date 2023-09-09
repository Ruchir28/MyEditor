import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import { pipeline } from 'stream';
import { promisify } from 'util';
const pipe = promisify(pipeline);
import { UploadChunkResponse } from "@ruchir28/common";
import userRouter from './routes/user';
require('events').EventEmitter.defaultMaxListeners = 100;  // Or another appropriate number

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());


function formatTime() {
  const now = new Date();
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  return `[${hours}]-[${minutes}]-[${seconds}]-[${milliseconds}]`;
}


function debug(msg: String) {
  console.log(`[DEBUG] [SERVER] ${formatTime()} + ${msg}`)
}


// Setting up Multer storage to store files in /uploads directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let fileName = req.body.filename.split(".")[0];
    const dirPath = path.join(__dirname, `/uploads/${fileName}`);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true }); // recursive ensures parent directories are created if they don't exist
    }
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.chunkNumber}.chunk`);
  },
});

const upload = multer({ storage });

const processingChunks: Record<string, Set<number>> = {};

app.post(
  "/upload",
  upload.single("fileChunk"),
  (req: Request, res: Response) => {
    let response: UploadChunkResponse = {
      chunkId: req.body.chunkNumber,
      uploadStatus: true,
    };

    debug(`req.body = ${JSON.stringify(req.body)}`);

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
        ...response,
      });
    }

    const { originalname } = req.file;

    const { totalChunks, chunkNumber } = req.body;
    const fileName = req.body.filename.split(".")[0];

    debug(req.file.path);

    processingChunks[fileName] = processingChunks[fileName] || new Set();

    processingChunks[fileName].add(parseInt(chunkNumber));

    const dirPath = path.join(__dirname, `/uploads/${fileName}`);

    // Check if all chunks have been received
    if (processingChunks[fileName].size === parseInt(totalChunks)) {
      const finalFilePath = path.join(
        __dirname,
        "completed",
        req.body.filename
      );

      if (!fs.existsSync(path.join(__dirname, "completed"))) {
        fs.mkdirSync(path.join(__dirname, "completed"));
      }

      const fileStream = fs.createWriteStream(finalFilePath);

      let i = 1;

      let isWriting = false;
      debug(isWriting ? "true" : "false");

      async function writeChunk() {
        debug(` Entering Write Chunk for, i = ${i}, ${isWriting}`);
        if(isWriting){return;}
        debug(` write chunk called, i = ${i}`);

        isWriting = true;
        
        let continueWriting = true;
  
        while (continueWriting && i <= parseInt(totalChunks)) {
          const chunkData = await fs.promises.readFile(path.join(dirPath, `${i}.chunk`));
          // If write returns false, we should stop writing until drain event is fired.
          if (!fileStream.write(chunkData)) {
            debug(`HERE, cannot write data now ${i}`);
            continueWriting = false;
          }
          await fs.promises.unlink((path.join(dirPath, `${i}.chunk`)));
          i++;
        }

        isWriting = false;
  
        if (i > parseInt(totalChunks)) {
          debug("END OF WRITING PHASE");
          fileStream.end();
          await fs.promises.rmdir(dirPath);
          delete processingChunks[fileName];
        } else {
          debug("Calling WriteChunk for next iteration");
          writeChunk();
        }
        debug(`Exiting writeChunk, i = ${i - 1}`); 
      }
  
      fileStream.on("drain", writeChunk);
    
      writeChunk();
    }
    debug(`resposne = ${JSON.stringify(response)}`);
    return res.status(200).json(response);
  }
);

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

app.listen(port, () => {
  debug(`Server started on http://localhost:${port}`);
});
