import express from "express";
import { verifyJwt } from "../utils/jwt";
import {
  getSettingHandler,
  updateSettingHandler,
} from "../controllers/setting.controller";

const router = express.Router();

router.route("/").get(getSettingHandler);

router.use(verifyJwt);

router.route("/edit").put(updateSettingHandler);

export default router;
