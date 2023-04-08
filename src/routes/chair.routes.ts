import express from "express";
import { verifyJwt } from "../utils/jwt";
import {
  createChairHandler,
  deleteChairHandler,
  getAllChairsHandler,
  getAllChairsWithDeskIDHandler,
  getChairHandler,
  updateChairWithUserHandler,
} from "../controllers/chair.controller";

const router = express.Router();

router.route("/desk/:id").get(getAllChairsWithDeskIDHandler);

router.use(verifyJwt);

router.post("/new", createChairHandler);
router.route("/").get(getAllChairsHandler);
router.route("/:id").get(getChairHandler);
router.route("/edit/:id").put(updateChairWithUserHandler);
router.route("/delete/:id").delete(deleteChairHandler);

export default router;
