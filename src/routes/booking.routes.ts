import express from "express";

import { verifyJwt } from "../utils/jwt";
import { getAllChairsWithDeskIDHandler } from "../controllers/chair.controller";
import {
  createBookingHandler,
  getAllBookingsHandler,
  getSingleBookingsHandler,
  updateBookingWithUserHandler,
  uploadFileHandler,
} from "../controllers/booking.contorller";
import { uploadFilter } from "../utils/common";

const router = express.Router();

router.route("/new").post(createBookingHandler);
router.route("/:id").get(getSingleBookingsHandler);

// FIXME enable when frontend send bearer token
router.use(verifyJwt);

router.route("/").get(getAllBookingsHandler);

router
  .route("/upload/receipt")
  .post(uploadFilter.single("file"), uploadFileHandler);

router.route("/edit/:id").put(updateBookingWithUserHandler);
router.route("/chairs/desk/:id").get(getAllChairsWithDeskIDHandler);

export default router;
