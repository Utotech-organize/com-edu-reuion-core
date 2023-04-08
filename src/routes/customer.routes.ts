import express from "express";
import {
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

router.route("/edit/:id").put(updateCustomerHandler);
router.route("/:id").get(getCustomerHandler);

// FIXME enable when frontend send bearer token
router.use(verifyJwt);

// Register user
router.route("/").get(getAllCustomersHandler);
router.route("/delete/:id").delete(deleteCustomerHandler);

export default router;
