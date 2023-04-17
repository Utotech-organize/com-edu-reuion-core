import express from "express";
import {
  createOrderHandler,
  getSingleOrderHandler,
} from "../controllers/order.controller";

const router = express.Router();

router.route("/").get(createOrderHandler);
router.post("/new", createOrderHandler);
router.route("/:id").get(getSingleOrderHandler);

export default router;
