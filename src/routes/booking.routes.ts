import express from "express";

import { verifyJwt } from "../utils/jwt";
import { getAllChairsWithDeskIDHandler } from "../controllers/chair.controller";
import {
  createBookingHandler,
  getAllBookingsHandler,
  getAllBookingsWithLiffIDHandler,
  getSingleBookingWithSlugTicketHandler,
  getSingleBookingsHandler,
  getTicketBookingAndMergeCustomerHandler,
  rejectBookingHandler,
  updateBookingWithUserHandler,
} from "../controllers/booking.contorller";
import { uploadFilter } from "../utils/common";
import { uploadFileHandler } from "../controllers/upload.controller";

const router = express.Router();

router.route("/new").post(createBookingHandler);
router.route("/liff").get(getAllBookingsWithLiffIDHandler);
router.route("/ticket/:ticket").get(getSingleBookingWithSlugTicketHandler);
// router.route("/ticket").get(getTicketBookingAndMergeCustomerHandler);
router.route("/:id").get(getSingleBookingsHandler);

// FIXME enable when frontend send bearer token
router.use(verifyJwt);

router.route("/").get(getAllBookingsHandler);

router.route("/edit/:id").put(updateBookingWithUserHandler);
router.route("/delete/:id").delete(rejectBookingHandler);
router.route("/chairs/desk/:id").get(getAllChairsWithDeskIDHandler);

router
  .route("/upload/receipt")
  .post(uploadFilter.single("file"), uploadFileHandler);

export default router;
