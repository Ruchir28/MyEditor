import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import {UploadChunkResponse} from './Common';


const app = express();
const port = 8000;

app.use(cors());


// Setting up Multer storage to store files in /uploads directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let fileName = req.body.filename.split('.')[0];
    const dirPath = path.join(__dirname, `/uploads/${fileName}`);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // recursive ensures parent directories are created if they don't exist
    }
    cb(null,dirPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.chunkNumber}.chunk`);
  }
});

const upload = multer({ storage });

const processingChunks: Record<string, Set<number>> = {};

app.post('/upload', upload.single('fileChunk'), (req: Request, res: Response) => {
  let response: UploadChunkResponse = {
    chunkId: req.body.chunkNumber,
    uploadStatus: true,
  };

  console.log(`[DEBUG] req.body = ${JSON.stringify(req.body)}`);

  // randonly return 500 error for testing 
  // if (Math.random() < 0.1) {
  //   return res.status(500).json({
  //     message: "Internal server error",
  //     ...response,
  //   });
  // }


  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
      ...response,
    });
  }

  const { originalname } = req.file;

  const { totalChunks, chunkNumber } = req.body;
  const fileName = req.body.filename.split(".")[0];

  console.log(req.file.path);

  processingChunks[fileName] = processingChunks[fileName] || new Set();

  processingChunks[fileName].add(parseInt(chunkNumber));

  const dirPath = path.join(__dirname, `/uploads/${fileName}`);

  // Check if all chunks have been received
  if (processingChunks[fileName].size === parseInt(totalChunks)) {
    const finalFilePath = path.join(__dirname, "completed", req.body.filename);

    if (!fs.existsSync(path.join(__dirname, "completed"))) {
      fs.mkdirSync(path.join(__dirname, "completed"));
    }

    const fileStream = fs.createWriteStream(finalFilePath);

    let i = 1;

    function writeChunk() {
      console.log(`[DEBUG] write chunk called, i = ${i}`);

      let continueWriting = true;

      while (continueWriting && i <= parseInt(totalChunks)) {
        const chunkData = fs.readFileSync(path.join(dirPath, `${i}.chunk`));
        // If write returns false, we should stop writing until drain event is fired.
        if (!fileStream.write(chunkData)) {
          console.log(`[DEBUG] HERE, cannot write data now`, i);
          continueWriting = false;
        }
        fs.unlinkSync(path.join(dirPath, `${i}.chunk`));
        i++;
      }

      if (i > parseInt(totalChunks)) {
        console.log("[DEBUG] END OF WRITING PHASE");
        fileStream.end();
        fs.rmdirSync(dirPath);
        delete processingChunks[fileName];
      }
    }

    fileStream.on("drain", writeChunk);

    writeChunk();
  }
  console.log(`[DEBUG SERVER] resposne = ${JSON.stringify(response)}`);
  return res.status(200).json(response);
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
