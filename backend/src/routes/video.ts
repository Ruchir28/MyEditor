import express from "express";
import {uploadChunk,singleUpload, getVideo} from "../controllers/video";
import { verifyUserMiddleware } from "../controllers/user";

const router = express.Router();


router.post("/upload",verifyUserMiddleware, singleUpload, uploadChunk);
router.get("/:videoId",verifyUserMiddleware,getVideo)

export default router;
