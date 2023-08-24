import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';


const app = express();
const port = 8000;

app.use(cors());


// Setting up Multer storage to store files in /uploads directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let fileName = req.body.filename.split('.')[0];
    let destinationPath = `uploads/${fileName}`;
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true }); // recursive ensures parent directories are created if they don't exist
    }
    cb(null,`uploads/${fileName}`);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.chunkNumber}.blob`);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('fileChunk'), (req: Request, res: Response) => {
  
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { originalname } = req.file;
  
  const { totalChunks, chunkNumber } = req.body;
  const fileName = req.body.filename.split('.')[0];

  console.log(req.file.path);

  const dirPath = path.join(__dirname, `/uploads/${fileName}`);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  fs.renameSync(req.file.path, path.join(dirPath, `${chunkNumber}.chunk`));

  // Check if all chunks have been received
  if (fs.readdirSync(dirPath).length === parseInt(totalChunks)) {
    const finalFilePath = path.join(__dirname, 'completed', req.body.filename);
    
    if (!fs.existsSync(path.join(__dirname, 'completed'))) {
      fs.mkdirSync(path.join(__dirname, 'completed'));
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
          console.log(`[DEBUG] HERE, cannot write data now`,i);
          continueWriting = false;
        } 
        fs.unlinkSync(path.join(dirPath, `${i}.chunk`));
        i++;
      }
  
      if (i > parseInt(totalChunks)) {
        console.log("[DEBUG] END OF WRITING PHASE");
        fileStream.end();
        fs.rmdirSync(dirPath);
      }
    }
  
    fileStream.on('drain', writeChunk);
    
    writeChunk();
  }
  
  res.send('Chunk received');
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
