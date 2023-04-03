// import { NextFunction, Request, Response } from "express";

// import { Lession } from "../entities/lession.entity";
// import { Pretest } from "../entities/pretest.entity";
// import { AppDataSource } from "../utils/data-source";
// import { OurFile } from "../entities/upload.entity";
// import path from "path";
// import fs from "fs";
// import { PretestResult } from "../entities/pretest-result.entity";
// import { DeleteOurFiles } from "../utils/delete-files";
// import { User } from "../entities/user.entity";
// import { responseErrors } from "../utils/common";

// /* Getting the lession repository from the database. */
// const lessionRepository = AppDataSource.getRepository(Lession);
// /* Getting the pretest repository from the database. */
// const pretestRepository = AppDataSource.getRepository(Pretest);
// /* Getting the repository for the OurFile class. */
// const fileUploadedRepository = AppDataSource.getRepository(OurFile);
// /* Getting the lession repository from the database. */
// const pretestResultRepository = AppDataSource.getRepository(PretestResult);
// /* Getting the lession repository from the database. */
// const userRepository = AppDataSource.getRepository(User);

// export const getAdminAnalyticLessionHandler = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const lessions = await lessionRepository
//       .createQueryBuilder("lession")
//       .where("active IS TRUE")
//       .getMany();

//     const totalUser = await userRepository
//       .createQueryBuilder("user")
//       .where("role != :role", { role: "admin" })
//       .getCount();

//     let result = [];

//     for (let l of lessions) {
//       const pretestUser = await pretestResultRepository
//         .createQueryBuilder("pretest_result")
//         .select("COUNT(DISTINCT pretest_result.user_id) AS total_pretest_user")
//         .leftJoin("pretest_result.pretest", "pretest")
//         .leftJoin("pretest.lession", "lession")
//         .where("lession.id = :id", { id: l.id })
//         .getRawOne();

//       const totalTestUser = +pretestUser["total_pretest_user"];
//       // +posttestUser["total_posttest_user"]) /
//       2;

//       let total_user = (totalTestUser / totalUser) * 100;

//       result.push({
//         lession: l,
//         total_user: Math.round(total_user),
//         over_all_user: totalTestUser,
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         result,
//       },
//     });
//   } catch (err: any) {
//     return responseErrors(res, 400, "Can't get data for analytics");
//   }
// };

// export const getUserAnalyticLessionHandler = async (
//   req: Request,
//   res: Response
// ) => {
//   const userId = req.user.id;

//   try {
//     const lessions = await lessionRepository
//       .createQueryBuilder("lession")
//       .where("active IS TRUE")
//       .getMany();

//     let result = [];

//     for (let l of lessions) {
//       const pretestCorrect = await pretestResultRepository
//         .createQueryBuilder("pretest_result")
//         .select("COUNT(pretest_result.id) AS pretest_correct")
//         .leftJoin("pretest_result.pretest", "pretest")
//         .leftJoin("pretest.lession", "lession")
//         .where("lession.id = :id", { id: l.id })
//         .andWhere("pretest_result.user_id = :userId", { userId: userId })
//         .andWhere("pretest_result.is_answer_correct IS TRUE")
//         .getRawOne();

//       const pretestInCorrect = await pretestResultRepository
//         .createQueryBuilder("pretest_result")
//         .select("COUNT(pretest_result.id) AS pretest_incorrect")
//         .leftJoin("pretest_result.pretest", "pretest")
//         .leftJoin("pretest.lession", "lession")
//         .where("lession.id = :id", { id: l.id })
//         .andWhere("pretest_result.user_id = :userId", { userId: userId })
//         .andWhere("pretest_result.is_answer_correct IS FALSE")
//         .getRawOne();

//       // const posttestCorrect = await posttestResultRepository
//       //   .createQueryBuilder("posttest_result")
//       //   .select("COUNT(posttest_result.id) AS posttest_correct")
//       //   .leftJoin("posttest_result.posttest", "posttest")
//       //   .leftJoin("posttest.lession", "lession")
//       //   .where("lession.id = :id", { id: l.id })
//       //   .andWhere("posttest_result.user_id = :userId", { userId: userId })
//       //   .andWhere("posttest_result.is_answer_correct IS TRUE")
//       //   .getRawOne();

//       // const posttestInCorrect = await posttestResultRepository
//       //   .createQueryBuilder("posttest_result")
//       //   .select("COUNT(posttest_result.id) AS posttest_incorrect")
//       //   .leftJoin("posttest_result.posttest", "posttest")
//       //   .leftJoin("posttest.lession", "lession")
//       //   .where("lession.id = :id", { id: l.id })
//       //   .andWhere("posttest_result.user_id = :userId", { userId: userId })
//       //   .andWhere("posttest_result.is_answer_correct IS FALSE")
//       //   .getRawOne();

//       result.push({
//         lession: l,
//         pretest_correct: +pretestCorrect["pretest_correct"],
//         pretest_incorrect: +pretestInCorrect["pretest_incorrect"],
//         // posttest_correct: +posttestCorrect["posttest_correct"],
//         // posttest_incorrect: +posttestInCorrect["posttest_incorrect"],
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         result,
//       },
//     });
//   } catch (err: any) {
//     return responseErrors(res, 400, "Can't get data for analytics");
//   }
// };
