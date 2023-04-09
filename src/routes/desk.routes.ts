import express from "express";
import { verifyJwt } from "../utils/jwt";
import {
  createDeskHandler,
  deleteDeskHandler,
  getAllDesksHandler,
  getDeskHandler,
  updateDeskHandler,
} from "../controllers/desk.controller";

const router = express.Router();

router.route("/").get(getAllDesksHandler);

router.use(verifyJwt);

router.post("/new", createDeskHandler);
router.route("/:id").get(getDeskHandler);
router.route("/edit/:id").put(updateDeskHandler);
router.route("/delete/:id").delete(deleteDeskHandler);

export default router;
