import express from "express";
import { verifyJwt } from "../utils/jwt";
import {
  createProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
  getSingleProductHandler,
  updateProductHandler,
} from "../controllers/product.controller";

const router = express.Router();

router.route("/").get(getAllProductsHandler);

router.use(verifyJwt);

router.post("/new", createProductHandler);
router.route("/:id").get(getSingleProductHandler);
router.route("/edit/:id").put(updateProductHandler);
router.route("/delete/:id").delete(deleteProductHandler);

export default router;
