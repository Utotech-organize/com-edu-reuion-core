import express from "express";
import {
  createCustomerHandler,
  deleteCustomerHandler,
  getAllCustomersHandler,
  getCustomerHandler,
  updateCustomerHandler,
} from "../controllers/customer.controller";

import { verifyJwt } from "../utils/jwt";

const router = express.Router();

// FIXME enable when frontend send bearer token
// router.use(verifyJwt);

// Register user
router.post("/new", createCustomerHandler);
router.route("/").get(getAllCustomersHandler);
router.route("/:id").get(getCustomerHandler);
router.route("/edit/:id").get(updateCustomerHandler);
router.route("/delete/:id").get(deleteCustomerHandler);

export default router;
