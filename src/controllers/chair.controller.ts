import { Request, Response } from "express";
import { Desk } from "../entities/desk.entity";
import { Chair } from "../entities/chair.entity";

import { AppDataSource } from "../utils/data-source";
import { responseErrors } from "../utils/common";

const chairRepository = AppDataSource.getRepository(Chair);

export const createChairHandler = async (req: Request, res: Response) => {
  try {
    // const userId = req.user.id;
    const input = req.body;

    const newChair = await chairRepository.save(
      chairRepository.create({
        label: input.label,
        status: input.status,
        price: input.price,
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
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: {
          title: "There was an error to create, please try again",
          error: error,
        },
      });
    }
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({
        status: "fail",
        message: "Chair with that tel and liff_id already exist",
      });
    }
    return responseErrors(res, 400, err);
  }
};

export const getAllChairsHandler = async (req: Request, res: Response) => {
  try {
    const chairs = await chairRepository
      .createQueryBuilder("chairs")
      .select([
        "chairs.id AS id",
        "chairs.created_at AS created_at",
        "chairs.updated_at AS updated_at",
        "chairs.label AS label",
        "chairs.status AS status",
        "chairs.price AS price",
      ])
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: chairs.length,
      data: chairs,
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const getChairHandler = async (req: Request, res: Response) => {
  try {
    const chair = await chairRepository
      .createQueryBuilder("chairs")
      .select([
        "chairs.id AS id",
        "chairs.created_at AS created_at",
        "chairs.updated_at AS updated_at",
        "chairs.label AS label",
        "chairs.status AS status",
        "chairs.price AS price",
      ])
      .where("chairs.id = :id", { id: req.params.id })
      .getRawOne();

    if (!chair) {
      return responseErrors(res, 400, "Chairs not found");
    }

    // const lss = await getLessionByUser(+req.params.postId);
    // chair["lessions"] = lss;

    res.status(200).json({
      status: "success",
      data: chair,
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const updateChairHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const chair = await chairRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!chair) {
      return responseErrors(res, 400, "Chair not found");
    }

    // chairs.name = input.name;
    // chairs.information = input.information;
    // chairs.email = input.email;
    chair.status = input.status;

    const updatedChair = await chairRepository.save(chair);

    res.status(200).json({
      status: "success",
      data: updatedChair,
    });
  } catch (err: any) {
    console.log(err);

    return responseErrors(res, 400, "Can't update your Chair");
  }
};

export const deleteChairHandler = async (req: Request, res: Response) => {
  try {
    const chair = await chairRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!chair) {
      return responseErrors(res, 400, "Chair not found");
    }

    await chairRepository.delete(chair.id); //FIXME

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your Chair");
  }
};
