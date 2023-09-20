import express from "express";
import {uploadChunk,singleUpload} from "../controllers/video";

const router = express.Router();


router.post("/upload", singleUpload, uploadChunk);

export default router;