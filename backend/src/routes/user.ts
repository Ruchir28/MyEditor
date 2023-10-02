import express from "express";
import { loginUser, registerUser, verifyUserMiddleware,checkAuthStatus } from "../controllers/user";

const router = express.Router();


router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/isLoggedIn",verifyUserMiddleware,checkAuthStatus);

export default router;