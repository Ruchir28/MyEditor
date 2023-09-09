import express from "express";
import { loginUser, registerUser, verifyUserMiddleware,protectedHandler } from "../controllers/user";

const router = express.Router();


router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/protectedRoute",verifyUserMiddleware,protectedHandler)

export default router;