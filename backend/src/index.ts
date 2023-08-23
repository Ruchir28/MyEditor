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
    console.log("[DEBUG-1]",req.body);
    let fileName = req.body.filename.split('.')[0];
    let destinationPath = `uploads/${fileName}`;
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true }); // recursive ensures parent directories are created if they don't exist
    }
    cb(null,`uploads/${fileName}`);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.chunkNumber}.blob`);
  },

});

const upload = multer({ storage });

app.post('/upload', upload.single('fileChunk'), (req: Request, res: Response) => {
  
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  console.log(req.body);

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
    let finalFilePath = path.join(__dirname, 'completed', req.body.filename);
    if (!fs.existsSync(path.join(__dirname, 'completed'))) {
      fs.mkdirSync(path.join(__dirname, 'completed'));
    }
    const fileStream = fs.createWriteStream(finalFilePath);

    for (let i = 1; i <= parseInt(totalChunks); i++) {
      const chunkData = fs.readFileSync(path.join(dirPath, `${i}.chunk`));
      fileStream.write(chunkData);
      fs.unlinkSync(path.join(dirPath, `${i}.chunk`)); // Deleting chunk after writing to final file
    }

    fileStream.end();
    fs.rmdirSync(dirPath); // Delete the directory for chunks
  }

  res.send('Chunk received');
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
