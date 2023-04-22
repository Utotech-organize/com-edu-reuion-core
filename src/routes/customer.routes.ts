import express from "express";
import {
  changeCustomerStatusHandler,
  createCustomerHandler,
  deleteCustomerHandler,
  getAllCustomersHandler,
  getCustomerByLiffIDHandler,
  getCustomerHandler,
  updateCustomerHandler,
} from "../controllers/customer.controller";

import { verifyJwt } from "../utils/jwt";

const router = express.Router();

router.post("/new", createCustomerHandler);
router.route("/liff").get(getCustomerByLiffIDHandler);
router.route("/approve").put(changeCustomerStatusHandler);
router.route("/edit/:id").put(updateCustomerHandler);
router.route("/:id").get(getCustomerHandler);
router.route("/").get(getAllCustomersHandler);

// FIXME enable when frontend send bearer token
router.use(verifyJwt);

// Register user
router.route("/delete/:id").delete(deleteCustomerHandler);

export default router;
