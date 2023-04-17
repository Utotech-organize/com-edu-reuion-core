import express from "express";
import {
  createOrderHandler,
  getSingleOrderHandler,
} from "../controllers/order.controller";

const router = express.Router();

router.route("/").get(createOrderHandler);
router.route("/liff").get(getSingleOrderHandler);
router.post("/new", createOrderHandler);

export default router;
