import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { UploadChunkResponse, RequestStatus } from "@ruchir28/common";
import { log } from "../Utils/Utils";
import { triggerMerge } from "../events/mergeFileEvent";
import { primsaClient } from "../Utils/prismaClient";

var appRoot = require("app-root-path");

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
    status: RequestStatus.SUCCESS,
  };

  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
      status: RequestStatus.FAILURE,
      uploadStatus: false,
    });
  }

  log(`req.body = ${JSON.stringify(req.body)}`);

  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
      ...response,
    });
  }

  const userID = req.user.id;

  const { originalname } = req.file;

  const { totalChunks, chunkNumber } = req.body;
  log("totalChunks:"+totalChunks);
  const fileName = req.body.filename.split(".")[0];

  log(req.file.path);

  processingChunks[fileName] = processingChunks[fileName] || new Set();

  processingChunks[fileName].add(parseInt(chunkNumber));

  const dirPath = path.join(appRoot.path, `/uploads/${fileName}`);

  // Check if all chunks have been received
  if (processingChunks[fileName].size === parseInt(totalChunks)) {
    // TODO: handle duplicate merge trigger
    triggerMerge(fileName, totalChunks, async (filePath: string) => {
      delete processingChunks[fileName];
      const video = await primsaClient.video.create({
        data: {
          ownerId: userID,
          title: "Demo Title",
          path: filePath
        }
      });
    });
  }
  log(`resposne = ${JSON.stringify(response)}`);
  return res.status(200).json(response);
}

export async function getVideo(req: express.Request, res: express.Response) {
  const videoId = req.params["videoId"];
  if(!videoId) {
    return res.status(400).json({
      status: RequestStatus.FAILURE,
      message: "Video Not Found",
    });
  }
  const videoObj = await primsaClient.video.findUnique({
    where: {
      id: parseInt(videoId)
    },
    select: {
      id: true,
      ownerId: true,
      path: true,
      viewers: true
    }
  });

  if(!req.user) {
    return res.status(401).json({
      status: RequestStatus.FAILURE,
      message: "Unauthorized"
    });
  }

  let userId = req.user.id;
  
  if(!videoObj) {
    return res.status(400).json({
      status: RequestStatus.FAILURE,
      message: "Video Not Found",
    });
  }

  if(userId !== videoObj?.ownerId && videoObj?.viewers.find(viewer => viewer.id === userId)) {
    return res.json({
      status: RequestStatus.FAILURE,
      message: "Unauthorized!"
    });
   }
  
  const videoPath = videoObj.path // Define the path to your video file.
  const videoStat = fs.statSync(videoPath); // Get file details.
  const fileSize = videoStat.size; // Get the total size of the video.

  const range = req.headers.range; // Get the "range" header from the client's request.

  // If a "range" header exists, the client requests only a specific part of the video.
  if (range) {
    // Extract the start and end bytes from the range header.
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10); // Start byte.
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1; // End byte. If not provided, default to file end.

    const chunkSize = end - start + 1; // Calculate the chunk size.

    // Create a read stream for the specific range.
    const stream = fs.createReadStream(videoPath, { start, end });

    // Respond with a 206 Partial Content status.
    // This indicates that only a chunk of the resource is sent to the client.
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    stream.pipe(res); // Pipe the video chunk to the response object.
  }
  // If no "range" header is present, the client requests the whole video.
  else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });

    // Stream the entire video to the client.
    fs.createReadStream(videoPath).pipe(res);
  }
}
