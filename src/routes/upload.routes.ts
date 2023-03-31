import express from "express";
import {
  deleteUploadHandler,
  getAllUploadHandler,
  getUploadHandler,
  uploadsHandler,
} from "../controllers/upload.controller";
import {
  uploadLessionFileDisk,
  uploadLessionPhotoDisk,
} from "../upload/single-upload-disk";
import { verifyJwt } from "../utils/jwt";

const router = express.Router();

// get image data
router.route("/:fileId").get(getUploadHandler);

// auth enable when frontend send bearer token
// router.use(verifyJwt);

// upload
router.route("/").post(uploadLessionPhotoDisk, uploadsHandler);

router.route("/files/data").get(getAllUploadHandler);

// upload
router.route("/file").post(uploadLessionFileDisk, uploadsHandler);

// delete
router.route("/:fileId").delete(deleteUploadHandler);

export default router;
