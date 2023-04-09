import express from "express";

import { verifyJwt } from "../utils/jwt";
import { getAllChairsWithDeskIDHandler } from "../controllers/chair.controller";
import {
  createBookingHandler,
  getAllBookingsHandler,
  getAllBookingsWithCustomerIDHandler,
  getSingleBookingsHandler,
  updateBookingWithUserHandler,
} from "../controllers/booking.contorller";
import { uploadFilter } from "../utils/common";
import { uploadFileHandler } from "../controllers/upload.controller";

const router = express.Router();

router.route("/new").post(createBookingHandler);
router.route("/:id").get(getSingleBookingsHandler);
router.route("/customer/:id").get(getAllBookingsWithCustomerIDHandler);

// FIXME enable when frontend send bearer token
router.use(verifyJwt);

router.route("/").get(getAllBookingsHandler);

router
  .route("/upload/receipt")
  .post(uploadFilter.single("file"), uploadFileHandler);

router.route("/edit/:id").put(updateBookingWithUserHandler);
router.route("/chairs/desk/:id").get(getAllChairsWithDeskIDHandler);

export default router;
