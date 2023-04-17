import { Request, Response } from "express";
import { Desks } from "../entities/desk.entity";

import { AppDataSource } from "../utils/data-source";
import { responseErrors } from "../utils/common";
import { Chairs } from "../entities/chair.entity";

const deskRepository = AppDataSource.getRepository(Desks);
const chairRepository = AppDataSource.getRepository(Chairs);
const selectDeskColumn = [
  "desks.id AS id",
  "desks.created_at AS created_at",
  "desks.updated_at AS updated_at",
  "desks.deleted_at AS deleted_at",
  "desks.active AS active",
  "desks.price AS price",
  "desks.chair_price AS chair_price",
  "desks.label AS label",
  "desks.status AS status",
];

export const createDeskHandler = async (req: Request, res: Response) => {
  try {
    // const userId = req.user.id;
    const input = req.body;

    let new_desk = {
      active: input.active,
      label: input.label,
      status: input.status,
      price: input.price,
      chair_price: input.chair_price,
    } as Desks;

    const desks = await deskRepository.save(new_desk);

    let chairs;

    let input_chairs: any = input.chairs;
    let new_chairs: Chairs[] = [];

    for (var i of input_chairs) {
      let chairTemp = {
        chair_no: i.chair_no,
        label: i.label,
        status: i.status,
        price: i.price,
        desk: {
          id: desks.id,
        } as Desks,
      } as Chairs;

      new_chairs.push(chairTemp);
    }

    chairs = await chairRepository.save(new_chairs);

    desks!.chairs = chairs as Chairs[];

    try {
      res.status(200).json({
        status: "create success",
        id: desks.id,
        message: "Desk has been created",
        data: desks,
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
        "Desk with that id already exist",
        err.message
      );
    }
    return responseErrors(res, 400, "Can't create desk", err.message);
  }
};

export const getAllDesksHandler = async (req: Request, res: Response) => {
  try {
    const desks = await deskRepository
      .createQueryBuilder("desks")
      .select(selectDeskColumn)
      .orderBy("desks.id", "ASC")
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: desks.length,
      data: desks,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all desk", err.message);
  }
};

export const getDeskHandler = async (req: Request, res: Response) => {
  try {
    const Desk = await deskRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!Desk) {
      return responseErrors(res, 400, "Desks not found", "cannot find desk");
    }

    const chairs = await chairRepository
      .createQueryBuilder("chairs")
      .where("desk_id = :desk_id", {
        desk_id: Desk?.id,
      })
      .getMany();

    Desk!.chairs = chairs;

    res.status(200).json({
      status: "success",
      data: Desk,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single desk", err.message);
  }
};

export const updateDeskHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const desk = await deskRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!desk) {
      return responseErrors(res, 400, "Desks not found", "cannot find desk");
    }

    desk.active = input.active;
    desk.label = input.label;
    desk.status = input.status;
    desk.price = input.price;
    desk.chair_price = input.chair_price;

    const updatedDesk = await deskRepository.save(desk);

    res.status(200).json({
      status: "update success",
      data: updatedDesk,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Desk", err.message);
  }
};

export const deleteDeskHandler = async (req: Request, res: Response) => {
  try {
    const d: Date = new Date();

    const desk = await deskRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!desk) {
      return responseErrors(res, 400, "Desks not found", "cannot find desk");
    }
    desk.deleted_at = d;
    await deskRepository.save(desk); //FIXME

    const chairs = await chairRepository
      .createQueryBuilder("chairs")
      .select(["chairs.id AS id"])
      .where("chairs.desk_id = :desk_id", { desk_id: desk.id })
      .getRawMany();

    if (!chairs) {
      return responseErrors(res, 400, "Chair not found", "cannot find chair");
    }

    chairs.forEach(async (chair: any) => {
      chair.deleted_at = d;
      await chairRepository.save(chair);
    });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your Desk", err.message);
  }
};
