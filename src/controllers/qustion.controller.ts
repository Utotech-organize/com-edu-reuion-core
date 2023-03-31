import { NextFunction, Request, Response } from "express";
import { Lession } from "../entities/lession.entity";
import { Pretest } from "../entities/pretest.entity";

import { AppDataSource } from "../utils/data-source";
import { PretestResult } from "../entities/pretest-result.entity";
import { pickBy } from "lodash";
import { User } from "../entities/user.entity";
import { responseErrors } from "../utils/common";

/* Getting the pretest repository from the database. */
const pretestRepository = AppDataSource.getRepository(Pretest);
/* Getting the lession repository from the database. */
const lessionRepository = AppDataSource.getRepository(Lession);

/* Getting the lession repository from the database. */
const pretestResultRepository = AppDataSource.getRepository(PretestResult);

export const getAllPretestWithLessionIDHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const pretest = await pretestRepository
      .createQueryBuilder("pretest")
      .where("lession_id = :lession_id", {
        lession_id: req.params.postId as any,
      })
      .getMany();

    if (!pretest) {
      return responseErrors(res, 400, "pretest not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        pretest,
      },
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const getSingleLessionRelatedPreAndPostTest = async (lssId: any) => {
  const lession = await lessionRepository.findOneBy({
    id: lssId as any,
  });

  if (!lession) {
    throw "lession with that ID not found";
  }

  const pretest = await pretestRepository
    .createQueryBuilder("pretest")
    .where("lession_id = :lession_id", {
      lession_id: lession?.id,
    })
    .getMany();

  lession!.pretests = pretest;

  return lession;
};

export const createPretestResult = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const input = req.body;

    await checkUserAlreadyDoPreTest(req.params.postId, userId);
    const lession = await getSingleLessionRelatedPreAndPostTest(
      req.params.postId
    );

    let preResults: PretestResult[] = [];

    lession.pretests.forEach((pt: Pretest) => {
      input.pretests.forEach((inPt: any) => {
        if (pt.id === inPt.id) {
          let isCorrect = inPt.answer === pt.correct_answer;
          let labelAnswer = "";

          switch (inPt.answer) {
            case "1":
              labelAnswer = pt.answer_1;
              break;

            case "2":
              labelAnswer = pt.answer_2;
              break;

            case "3":
              labelAnswer = pt.answer_3;
              break;

            case "4":
              labelAnswer = pt.answer_4;
              break;
          }

          preResults.push({
            answer_choosed: inPt.answer,
            label_answer_choosed: labelAnswer,
            is_answer_correct: isCorrect,
            user: { id: userId } as User,
            pretest: { id: pt.id } as Pretest,
          } as PretestResult);
        }
      });
    });

    await pretestResultRepository.save(preResults);

    res.status(200).json({
      status: "success",
      data: {
        lession,
      },
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const getPretestResult = async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    const pretestResult = await pretestResultRepository
      .createQueryBuilder("pretest_result")
      .leftJoinAndSelect("pretest_result.pretest", "pretest")
      .leftJoin("pretest.lession", "lession")
      .where("lession.id = :id", { id: req.params.postId })
      .andWhere("pretest_result.user_id = :userId", { userId: userId })
      .getMany();

    let result = {
      total_correct: 0,
      total_incorrect: 0,
    };

    pretestResult.forEach((r) => {
      if (r.is_answer_correct) {
        result.total_correct += 1;
      } else {
        result.total_incorrect += 1;
      }
    });

    res.status(200).json({
      status: "success",
      data: {
        pretestResults: pretestResult,
        summary: result,
      },
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const checkUserAlreadyDoPreTest = async (lssId: any, userId: any) => {
  try {
    const pretestResult = await pretestResultRepository
      .createQueryBuilder("pretest_result")
      .leftJoin("pretest_result.pretest", "pretest")
      .leftJoin("pretest.lession", "lession")
      .where("lession.id = :id", { id: lssId })
      .andWhere("pretest_result.user_id = :userId", { userId: userId })
      .getMany();

    if (pretestResult.length > 0) {
      throw "error user already do pretest";
    }

    // return;
  } catch (err: any) {
    throw err;
  }
};
