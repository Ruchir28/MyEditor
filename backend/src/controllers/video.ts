import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { UploadChunkResponse, RequestStatus} from "@ruchir28/common";
var appRoot = require('app-root-path');
console.log(appRoot.path);
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

// Setting up Multer storage to store files in /uploads directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let fileName = req.body.filename.split(".")[0];
    const dirPath = path.join(appRoot.path, `/uploads/${fileName}`);
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

export const singleUpload = upload.single("fileChunk");

const processingChunks: Record<string, Set<number>> = {};

export async function uploadChunk(req: express.Request, res: express.Response) {
        let response: UploadChunkResponse = {
          chunkId: req.body.chunkNumber,
          uploadStatus: true,
          status: RequestStatus.SUCCESS
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

        const dirPath = path.join(appRoot.path, `/uploads/${fileName}`);
    
        // Check if all chunks have been received
        if (processingChunks[fileName].size === parseInt(totalChunks)) {
          const finalFilePath = path.join(
            appRoot.path,
            "completed",
            req.body.filename
          );
    
          if (!fs.existsSync(path.join(appRoot.path, "completed"))) {
            fs.mkdirSync(path.join(appRoot.path, "completed"));
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
