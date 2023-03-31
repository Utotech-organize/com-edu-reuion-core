import express from "express";
import { getMeHandler, loginUserHandler } from "../controllers/auth.controller";
import { registerUserHandler } from "../controllers/user.controller";
import { verifyJwt } from "../utils/jwt";

const router = express.Router();

// Register user
router.post("/register", registerUserHandler);

// Login user
router.post("/login", loginUserHandler);

// Login user
router.get("/me", verifyJwt, getMeHandler);

export default router;
