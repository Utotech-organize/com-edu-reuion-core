import { Request, Response } from "express";
import { qrcodeGenerator } from "../utils/qrcode";
import {
  responseErrors,
  statusAvailable,
  statusComplete,
  statusPending,
  statusUnAvailable,
  statusUnPaid,
} from "../utils/common";
import { Bookings } from "../entities/booking.entity";
import { AppDataSource } from "../utils/data-source";
import { Customers } from "../entities/customer.entity";
import { Desks } from "../entities/desk.entity";
import { Chairs } from "../entities/chair.entity";
import { Users } from "../entities/user.entity";
import { uploadFileToGoogleDrive } from "../utils/service";

const bookingRepository = AppDataSource.getRepository(Bookings);
const customerRepository = AppDataSource.getRepository(Customers);
const deskRepository = AppDataSource.getRepository(Desks);
const chairRepository = AppDataSource.getRepository(Chairs);
const userRepository = AppDataSource.getRepository(Users);

const selectBookingsColumn = [
  "bookings.id AS id",
  "bookings.created_at AS created_at",
  "bookings.updated_at AS updated_at",
  "bookings.deleted_at AS deleted_at",
  "bookings.status AS status",
  "bookings.payment_status AS payment_status",
  "bookings.inspector AS inspector",
  "bookings.customer AS customer",
  "bookings.desk AS desk",
];

export const createBookingHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const customer = await customerRepository.findOne({
      where: { id: input.customer_id },
    });
    if (!customer) {
      return responseErrors(
        res,
        400,
        "Customer not found",
        "cannot find customer"
      );
    }

    const desk = await deskRepository.findOne({ where: { id: input.desk_id } });
    if (!desk) {
      return responseErrors(res, 400, "Desk not found", "cannot find desk");
    }

    const chairsWithDesks = await chairRepository
      .createQueryBuilder("chairs")
      .leftJoinAndSelect("chairs.desk", "desk")
      .where("chairs.desk_id = :desk_id", { desk_id: desk.id })
      .getMany();

    const unBookingChairs = chairsWithDesks.filter(
      (c: any) =>
        input.chairs_id.indexOf(c.id) > -1 &&
        (c.status === statusPending || c.status === statusUnAvailable)
    );

    if (unBookingChairs.length > 0) {
      return responseErrors(
        res,
        400,
        "Cannot Bookings this chairs",
        "chairs pedding is duplicate"
      );
    }

    let chairPrice = 0;

    chairsWithDesks.forEach((chair: any, index: number) => {
      if (chair.status !== statusPending) {
        if (input.chairs_id[index] == chair.id) {
          chair.status = statusPending;
          chair.customer_id = customer.id;
          chairPrice = chairPrice + chair.price;

          chairRepository.save(chair);
        }
      }
    });

    desk.active = true;
    desk.status = statusPending;

    await deskRepository.save(desk);

    let new_booking = {
      status: statusPending,
      payment_status: statusUnPaid,
      inspector: "",
      customer: customer,
      desk: desk,
      total: chairPrice,
    } as Bookings;

    const newBooking = await bookingRepository.save(new_booking);

    try {
      res.status(200).json({
        status: "success",
        id: newBooking.id,
        message: "Booking has been created",
        data: newBooking,
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
    return responseErrors(res, 400, "Can't create Booking", err.message);
  }
};

export const updateChairWithDeskHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const input = req.body;

    const desk = await deskRepository.findOneBy({
      id: input.desk_id as any,
    });

    if (!desk) {
      return responseErrors(res, 400, "Desk not found", "cannot find desk");
    }

    const chairsWithDesks = await chairRepository
      .createQueryBuilder("chairs")
      .leftJoinAndSelect("chairs.desk", "desk")
      .where("chairs.desk_id = :desk_id", { desk_id: desk.id })
      .getMany();

    chairsWithDesks.forEach((chair: any, index: number) => {
      if (input.chairs_id[index] == chair.id) {
        chair.status = statusPending;

        chairRepository.save(chair);
      }
    });

    desk.active = true;
    desk.status = statusPending;

    await deskRepository.save(desk);

    res.status(200).json({
      status: "success",
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Chair", err.message);
  }
};

export const getAllBookingsHandler = async (req: Request, res: Response) => {
  try {
    const bookings = await bookingRepository.find({
      relations: ["customer", "desk"],
      order: { id: "DESC" },
    });

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: bookings,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all Bookings", err.message);
  }
};

export const getSingleBookingsHandler = async (req: Request, res: Response) => {
  try {
    const booking_id = req.params.id;

    const booking = await bookingRepository
      .createQueryBuilder("bookings")
      .select(selectBookingsColumn)
      .where("bookings.id = :id", {
        id: booking_id,
      })
      .getRawOne();

    if (!booking) {
      return responseErrors(
        res,
        400,
        "Bookings not found",
        "cannot find bookings"
      );
    }

    const customer = await customerRepository.findOneBy({
      id: booking.customer,
    });

    if (!customer) {
      return responseErrors(
        res,
        400,
        "Customer not found",
        "cannot find customer"
      );
    }
    booking.customer = customer;

    const desk = await deskRepository.findOneBy({
      id: booking.desk,
    });
    if (!desk) {
      return responseErrors(res, 400, "Desk not found", "cannot find desk");
    }
    booking.desk = desk;

    const chairs = await chairRepository
      .createQueryBuilder("chairs")
      .select([
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
      ])
      .where("chairs.desk_id = :id", { id: desk.id })
      .andWhere("chairs.deleted_at is null")
      .andWhere("chairs.status = :status", { status: statusPending })
      .andWhere("chairs.customer_id = :customer_id", {
        customer_id: customer.id,
      })
      .getRawMany();

    booking.desk.chairs_id = chairs;

    res.status(200).json({
      status: "success",
      data: booking,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single Bookings", err.message);
  }
};

export const generateQrcodeWithChairID = async (
  req: Request,
  res: Response
) => {
  try {
    const qrcode = await qrcodeGenerator(req.params.id);

    res.status(200).json({
      status: "success",
      data: qrcode,
    });
  } catch (err: any) {
    return responseErrors(
      res,
      400,
      "Can't generate your Chair qrcode",
      err.message
    );
  }
};

export const uploadFileHandler = async (req: Request, res: Response) => {
  const user_id = req.user.id;
  const file = req.file;

  const user = await userRepository.findOneBy({
    id: user_id as any,
  });

  if (!user) {
    return responseErrors(res, 400, "User not found", "cannot find user");
  }

  const imageID = await uploadFileToGoogleDrive(file, user);

  res.status(200).json({
    status: "success",
    data: imageID,
  });
};

export const updateBookingWithUserHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const input = req.body;
    const user_id = req.user.id;

    const user = await userRepository.findOneBy({
      id: user_id as any,
    });

    if (!user) {
      return responseErrors(res, 400, "User not found", "cannot find user");
    }
    let updatedBooking;

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const booking = await bookingRepository.findOne({
        where: { id: req.params.id as any },
        relations: ["desk"],
      });

      if (!booking) {
        return responseErrors(
          res,
          400,
          "Booking not found",
          "cannot find booking"
        );
      }

      // FIXME update desk and chair but fixme to simple and easy function component
      const desk = await deskRepository.findOneBy({
        id: booking.desk.id as any,
      });

      if (!desk) {
        return responseErrors(res, 400, "Desk not found", "cannot find desk");
      }

      const chairsWithDesks = await chairRepository
        .createQueryBuilder("chairs")
        .leftJoinAndSelect("chairs.desk", "desk")
        .where("chairs.desk_id = :desk_id", { desk_id: desk.id })
        .getMany();

      chairsWithDesks.forEach((chair: any, index: number) => {
        if (chair.status == statusPending) {
          chair.status = statusUnAvailable;

          chairRepository.save(chair);
        }
      });

      let counter = 0;
      for (const obj of chairsWithDesks) {
        if (obj.status === statusUnAvailable) counter++;
      }

      if (counter == 10) {
        desk.status = statusUnAvailable;
      }

      await deskRepository.save(desk);

      // update booking
      booking.payment_status = input.payment_status;
      booking.status = statusComplete;
      booking.inspector = user.first_name;

      updatedBooking = await bookingRepository.save(booking);
    });

    res.status(200).json({
      status: "success",
      data: updatedBooking,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Booking", err.message);
  }
};
