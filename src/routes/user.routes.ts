import express from "express";
import {
  deleteUserHandler,
  getAllUsersHandler,
  getUserHandler,
  registerUserHandler,
  updateUserHandler,
} from "../controllers/user.controller";
import { verifyJwt } from "../utils/jwt";

const router = express.Router();

// FIXME enable when frontend send bearer token
router.use(verifyJwt);

// Register user
router.post("/register", registerUserHandler);
router.route("/").get(getAllUsersHandler);
router.route("/:id").get(getUserHandler);
router.route("/edit/:id").put(updateUserHandler);
router.route("/delete/:id").delete(updateUserHandler);

export default router;
