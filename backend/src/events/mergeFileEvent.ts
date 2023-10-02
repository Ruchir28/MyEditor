import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import { log } from "../Utils/Utils";

var appRoot = require("app-root-path");

const mergeEventEmitter = new EventEmitter();

const MERGE_EVENT = "mergeFile";

export function triggerMerge(
  fileName: string,
  totalChunks: string,
  callback: (filePath: string) => void
) {
  mergeEventEmitter.emit(MERGE_EVENT, fileName, totalChunks, callback);
}

mergeEventEmitter.on(MERGE_EVENT, mergeFile);

async function readChunk(filePath: string): Promise<Buffer> {
  return fs.promises.readFile(filePath);
}

async function deleteChunk(filePath: string) {
  return fs.promises.unlink(filePath);
}

async function mergeFile(
  fileName: string,
  totalChunks: string,
  callback: (filePath: string) => void
) {
  const dirPath = path.join(appRoot.path, `/uploads/${fileName}`);

  const finalFilePath = path.join(appRoot.path, "completed", fileName);

  const fileStream = fs.createWriteStream(finalFilePath);

  let currentChunk = 1;

  async function writeNextChunk() {
    try {
      const chunkPath = path.join(dirPath, `${currentChunk}.chunk`);
      const chunkData = await readChunk(chunkPath);

      const canContinueWriting = fileStream.write(chunkData);

      await deleteChunk(chunkPath);
      currentChunk++;

      if (!canContinueWriting) {
        if (currentChunk < parseInt(totalChunks)) {
          fileStream.once("drain", writeNextChunk);
        } else {
          finalizeMerge(dirPath);
          fileStream.end();
          callback(finalFilePath);
        }
        return;
      }

      if (currentChunk < parseInt(totalChunks)) {
        writeNextChunk();
      } else {
        finalizeMerge(dirPath);
        fileStream.end();
        callback(finalFilePath);
      }
    } catch (error: any) {
      log(`Error processing chunk ${currentChunk}: ${error.message}`);
    }
  }

  async function finalizeMerge(dirPath: string) {
    try {
      await fs.promises.rmdir(dirPath);
    } catch (error: any) {
      log(`Error cleaning up chunks directory: ${error.message}`);
    }
  }

  writeNextChunk();
}
