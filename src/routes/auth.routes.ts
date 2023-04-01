import express from "express";
import { getMeHandler, loginUserHandler } from "../controllers/auth.controller";
import { registerUserHandler } from "../controllers/user.controller";
import { verifyJwt } from "../utils/jwt";

const router = express.Router();

// Login user
router.post("/login", loginUserHandler);

// get me user
router.get("/me", verifyJwt, getMeHandler);

export default router;
