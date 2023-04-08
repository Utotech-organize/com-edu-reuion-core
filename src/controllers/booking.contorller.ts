import { Request, Response } from "express";
import { qrcodeGenerator } from "../utils/qrcode";
import { responseErrors, statusPending, statusUnPaid } from "../utils/common";
import { Bookings } from "../entities/booking.entity";
import { AppDataSource } from "../utils/data-source";
import { Customers } from "../entities/customer.entity";
import { Desks } from "../entities/desk.entity";
import { Chairs } from "../entities/chair.entity";

const bookingRepository = AppDataSource.getRepository(Bookings);
const customerRepository = AppDataSource.getRepository(Customers);
const deskRepository = AppDataSource.getRepository(Desks);
const chairRepository = AppDataSource.getRepository(Chairs);

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
      where: { id: input.id },
    });
    const desk = await deskRepository.findOne({ where: { id: input.desk } });

    updateChairWithDeskHandler(req, res);

    let new_booking = {
      status: statusPending,
      payment_status: statusUnPaid,
      inspector: "",
      customer: customer,
      desk: desk,
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

    // console.log(chairsWithDesks);

    console.log(input);

    chairsWithDesks.forEach((chair: any, index: number) => {
      console.log(chair.id);

      if (input.chairs_id[index] == chair.id) {
        chair.console.log("in if");

        chair.status = statusPending;

        const updatedChair = chairRepository.save(chair);

        console.log(updatedChair);
      }
    });

    // const chair = await chairRepository.findOneBy({
    //   desk: input.desk_id as any,
    // });

    // if (!chair) {
    //   return responseErrors(
    //     res,
    //     400,
    //     "Chair not found",
    //     "cannot find chair in desk"
    //   );
    // }

    // chair.label = input.label;
    // chair.status = input.status;
    // chair.price = input.price;
    // chair.customer_name = input.customer_name;
    // chair.approve_by = desk.name;
    // chair.user_id = userId;

    // const updatedChair = await chairRepository.save(chair);

    res.status(200).json({
      status: "success",
      // data: updatedChair,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Chair", err.message);
  }
};

export const getAllBookingHandler = async (req: Request, res: Response) => {
  try {
    const bookings = await customerRepository
      .createQueryBuilder("bookings")
      .select(selectBookingsColumn)
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: bookings,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all Bookings", err.message);
  }
};

export const getCustomerByLiffIDHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const booking_id = req.params.id;

    const booking = await customerRepository
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
