import express from "express";

import { verifyJwt } from "../utils/jwt";
import {
  createChairHandler,
  deleteChairHandler,
  getAllChairsHandler,
  getChairHandler,
  updateChairHandler,
} from "../controllers/chair.controller";
import {
  createDeskHandler,
  deleteDeskHandler,
  getAllDesksHandler,
  getDeskHandler,
  updateDeskHandler,
} from "../controllers/desk.controller";

const router = express.Router();

// FIXME enable when frontend send bearer token
// router.use(verifyJwt);

router.post("/desks/new", createDeskHandler);
router.route("/desks/").get(getAllDesksHandler);
router.route("/desks/:id").get(getDeskHandler);
router.route("/desks/edit/:id").put(updateDeskHandler);
router.route("/desks/delete/:id").delete(deleteDeskHandler);

router.post("/chairs/new", createChairHandler);
router.route("/chairs/").get(getAllChairsHandler);
router.route("/chairs/:id").get(getChairHandler);
router.route("/chairs/edit/:id").get(updateChairHandler);
router.route("/chairs/delete/:id").get(deleteChairHandler);

export default router;
