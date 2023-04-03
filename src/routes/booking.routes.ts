import express from "express";

import { verifyJwt } from "../utils/jwt";
import {
  createChairHandler,
  deleteChairHandler,
  generateQrcodeWithChairID,
  getAllChairsHandler,
  getAllChairsWithDeskIDHandler,
  getChairHandler,
  updateChairWithUserHandler,
} from "../controllers/chair.controller";
import {
  createDeskHandler,
  deleteDeskHandler,
  getAllDesksHandler,
  getDeskHandler,
  updateDeskHandler,
} from "../controllers/desk.controller";

const router = express.Router();

router.route("/desks/").get(getAllDesksHandler);
router.route("/chairs/desk/:id").get(getAllChairsWithDeskIDHandler);

// FIXME enable when frontend send bearer token
router.use(verifyJwt);

router.post("/desks/new", createDeskHandler);
router.route("/desks/:id").get(getDeskHandler);
router.route("/desks/edit/:id").put(updateDeskHandler);
router.route("/desks/delete/:id").delete(deleteDeskHandler);

router.post("/chairs/new", createChairHandler);
router.route("/chairs/").get(getAllChairsHandler);
router.route("/chairs/:id").get(getChairHandler);
router.route("/chairs/edit/:id").put(updateChairWithUserHandler);
router.route("/chairs/delete/:id").delete(deleteChairHandler);

router.route("/chairs/qrcode").get(generateQrcodeWithChairID);

export default router;
