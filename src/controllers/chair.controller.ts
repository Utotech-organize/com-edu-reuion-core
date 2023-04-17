import { Request, Response } from "express";
import { Chairs } from "../entities/chair.entity";

import { AppDataSource } from "../utils/data-source";
import { responseErrors } from "../utils/common";
import { Users } from "../entities/user.entity";

const chairRepository = AppDataSource.getRepository(Chairs);
const userRepository = AppDataSource.getRepository(Users);
const selectChairColumn = [
  "chairs.id AS id",
  "chairs.created_at AS created_at",
  "chairs.updated_at AS updated_at",
  "chairs.deleted_at AS deleted_at",
  "chairs.label AS label",
  "chairs.status AS status",
  "chairs.chair_no AS chair_no",
  "chairs.price AS price",
  "chairs.customer_id AS customer_id",
  "chairs.user_id AS user_id",
];

export const createChairHandler = async (req: Request, res: Response) => {
  try {
    // const userId = req.user.id;
    const input = req.body;

    const newChair = await chairRepository.save(
      chairRepository.create({
        label: input.label,
        status: input.status,
        price: input.price,
        chair_no: input.chair_no,
      })
    );

    await newChair.save();

    try {
      res.status(200).json({
        status: "success",
        id: newChair.id,
        message: "Chair has been created",
        data: newChair,
      });
    } catch (err: any) {
      return responseErrors(
        res,
        500,
        "There was an error to create, please try again",
        err.message
      );
    }
  } catch (err: any) {
    if (err.code === "23505") {
      return responseErrors(
        res,
        409,
        "Chair with that id already exist",
        err.message
      );
    }
    return responseErrors(res, 400, "Can't create Chair", err.message);
  }
};

export const getAllChairsHandler = async (req: Request, res: Response) => {
  try {
    const chairs = await chairRepository
      .createQueryBuilder("chairs")
      .select(selectChairColumn)
      // .where("chairs.deleted_at is null")
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: chairs.length,
      data: chairs,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all Chair", err.message);
  }
};

export const getAllChairsWithDeskIDHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const deskID = req.params.id;

    const chairs = await chairRepository
      .createQueryBuilder("chairs")
      .select(selectChairColumn)
      .where("chairs.desk_id = :id", { id: deskID })
      // .andWhere("chairs.deleted_at is null")
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: chairs.length,
      data: chairs,
    });
  } catch (err: any) {
    return responseErrors(
      res,
      400,
      "Can't get all Chair with desk id",
      err.message
    );
  }
};

export const getChairHandler = async (req: Request, res: Response) => {
  try {
    const chair = await chairRepository
      .createQueryBuilder("chairs")
      .select(selectChairColumn)
      .where("chairs.id = :id", { id: req.params.id })
      // .andWhere("chairs.deleted_at is null")
      .getRawOne();

    if (!chair) {
      return responseErrors(res, 400, "Chair not found", "cannot find chair");
    }

    res.status(200).json({
      status: "success",
      data: chair,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single Chair", err.message);
  }
};

// updateChairWithUserHandler with user
export const updateChairWithUserHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.id;
    const input = req.body;

    const chair = await chairRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!chair) {
      return responseErrors(res, 400, "Chair not found", "cannot find chair");
    }

    const user = await userRepository.findOneBy({
      id: userId as any,
    });

    if (!user) {
      return responseErrors(res, 400, "User not found", "cannot find chair");
    }

    chair.label = input.label;
    chair.status = input.status;
    chair.price = input.price;
    chair.chair_no = input.chair_no;
    chair.customer_name = input.customer_name;
    chair.user_id = userId;

    const updatedChair = await chairRepository.save(chair);

    res.status(200).json({
      status: "success",
      data: updatedChair,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Chair", err.message);
  }
};

export const deleteChairHandler = async (req: Request, res: Response) => {
  try {
    const chair = await chairRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!chair) {
      return responseErrors(res, 400, "Chair not found", "cannot find chair");
    }

    await chairRepository.delete(chair.id); //FIXME

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your Chair", err.message);
  }
};
