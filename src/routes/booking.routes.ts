// import express from "express";
// import {
//   createLessionHandler,
//   deleteLessionHandler,
//   getLessionHandler,
//   getAllLessionsHandler,
//   updateLessionHandler,
// } from "../controllers/lession.controller";
// import {
//   createPretestResult,
//   getAllPretestWithLessionIDHandler,
//   getPretestResult,
// } from "../controllers/qustion.controller";
// import { verifyJwt } from "../utils/jwt";

// const router = express.Router();

// // FIXME enable when frontend send bearer token
// // router.use(verifyJwt);

// router.route("/").post(createLessionHandler).get(getAllLessionsHandler);

// router
//   .route("/:postId")
//   .get(getLessionHandler)
//   .put(updateLessionHandler)
//   .delete(deleteLessionHandler);

// router.route("/pretest/:postId").get(getAllPretestWithLessionIDHandler);

// router
//   .route("/:postId/pretest-result")
//   .get(getPretestResult)
//   .post(createPretestResult);

// router.route("/:postId/posttest-result");

// export default router;
