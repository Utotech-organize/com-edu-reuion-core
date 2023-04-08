import express from "express";

import { verifyJwt } from "../utils/jwt";
import { getAllChairsWithDeskIDHandler } from "../controllers/chair.controller";
import { getAllDesksHandler } from "../controllers/desk.controller";
import { createBookingHandler } from "../controllers/booking.contorller";

const router = express.Router();

// FIXME enable when frontend send bearer token
router.use(verifyJwt);

router.route("/new").post(createBookingHandler);
router.route("/desks/").get(getAllDesksHandler);
router.route("/chairs/desk/:id").get(getAllChairsWithDeskIDHandler);

export default router;
