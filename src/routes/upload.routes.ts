import express from "express";
import { verifyJwt } from "../utils/jwt";
import { uploadFilter } from "../utils/common";
import {
  getFileHandler,
  uploadFileHandler,
} from "../controllers/upload.controller";

const router = express.Router();

router.route("/").post(uploadFilter.single("file"), uploadFileHandler);
router.route("/image/:file_id").get(getFileHandler);

router.use(verifyJwt);
router.route("/receipt").post(uploadFilter.single("file"), uploadFileHandler);
router.route("/profile").post(uploadFilter.single("file"), uploadFileHandler);

export default router;
