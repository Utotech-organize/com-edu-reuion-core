import { Request, Response } from "express";
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
import uuid from "../utils/uuid";
import { qrcodeGenerator } from "../utils/service";
import _ from "lodash";

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
  "bookings.slug AS slug", //FIXME remove when production
  "bookings.status AS status",
  "bookings.payment_status AS payment_status",
  "bookings.inspector AS inspector",
  "bookings.chairs_id AS chairs_id",
  "bookings.total AS total",
  "bookings.qrcode_image AS qrcode_image", //FIXME remove when production
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
      throw new Error("cannot find customer");
    }

    const desk = await deskRepository.findOneBy({
      id: input.desk_id,
      active: true,
      deleted_at: undefined,
    });
    if (!desk) {
      throw new Error("cannot find desk");
    }

    const chairsWithDesks = await chairRepository
      .createQueryBuilder("chairs")
      .leftJoinAndSelect("chairs.desk", "desk")
      .where("chairs.desk_id = :desk_id", { desk_id: desk.id })
      .getMany();

    const all_chair = chairsWithDesks.map((d: any) => d.id);
    const checkSomeValue = all_chair.filter(
      (c: any) => input.chairs_id.indexOf(c) > -1
    );

    if (checkSomeValue.length !== input.chairs_id.length) {
      throw new Error("chairs_id is not in scope");
    }

    const unBookingChairs = chairsWithDesks.filter(
      (c: any) =>
        input.chairs_id.indexOf(c.id) > -1 &&
        (c.status === statusPending || c.status === statusUnAvailable)
    );

    if (unBookingChairs.length > 0) {
      throw new Error("chairs pending is duplicate");
    }
    let chairPrice = 0;

    chairsWithDesks.map((chair: any, index: number) => {
      if (chair.status !== statusPending) {
        if (input.chairs_id[index] === chair.id) {
          chair.status = statusPending;
          chair.customer_id = customer.id;
          chairPrice = chairPrice + chair.price;

          chairRepository.save(chair);
        }
      }
    });

    if (input.chairs_id.length == 10) {
      chairPrice = desk.price;
    }
    desk.active = true;
    desk.status = statusPending;

    await deskRepository.save(desk);

    let paramsForQr = {
      first_name: customer.first_name,
      label: desk.label,
    };
    const bookingSlug: string = uuid();
    const qrcodeURL = await qrcodeGenerator(bookingSlug, paramsForQr);

    let chairs = input.chairs_id.toString();
    let new_booking = {
      slug: bookingSlug,
      status: statusPending,
      payment_status: statusUnPaid,
      inspector: "",
      customer: customer,
      chairs_id: chairs,
      desk: desk,
      total: chairPrice,
      qrcode_image: qrcodeURL,
      image_url: input.image_url,
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

    chairsWithDesks.map((chair: any, index: number) => {
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
      select: [
        "id",
        "created_at",
        "updated_at",
        "deleted_at",
        "status",
        "payment_status",
        "inspector",
        "total",
        "customer",
        "desk",
      ],
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

export const getAllBookingsWithCustomerIDHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const customer_id = req.params.id;

    const bookings = await bookingRepository
      .createQueryBuilder("bookings")
      .leftJoinAndSelect("bookings.customer", "customer")
      .leftJoinAndSelect("bookings.desk", "desk")
      .where("bookings.customer.id = :customer_id", {
        customer_id: customer_id,
      })
      .orderBy("bookings.id", "DESC")
      .getMany();

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
      .andWhere("chairs.status = :status", { status: statusPending })
      .andWhere("chairs.customer_id = :customer_id", {
        customer_id: customer.id,
      })
      .getRawMany();

    const all_chair = chairs.map((d: any) => d.id);
    const checkSomeValue = all_chair.filter(
      (c: any) => booking.chairs_id.indexOf(c) > -1
    );

    let foundObjectChairs = [] as any;
    checkSomeValue.map((e) => {
      foundObjectChairs.push(chairs.find((obj) => obj.id === e));
    });
    booking.desk.chairs = foundObjectChairs;

    res.status(200).json({
      status: "success",
      data: booking,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single Bookings", err.message);
  }
};

// updateBookingWithUserHandler is Approve with user
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

    const booking = await bookingRepository.findOne({
      where: { id: req.params.id as any },
      relations: ["desk", "customer"],
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

    const chairs = await chairRepository
      .createQueryBuilder("chairs")
      .select(["chairs.id AS id"])
      .where("chairs.desk_id = :id", { id: desk.id })
      .getRawMany();

    const all_chair = chairs.map((d: any) => d.id);

    const checkSomeValue = all_chair.filter(
      (c: any) => booking.chairs_id.indexOf(c) > -1
    );

    let foundObjectChairs = [] as any;
    checkSomeValue.map((e) => {
      foundObjectChairs.push(chairs.find((obj) => obj.id === e));
    });

    let chairs_id: any = booking.chairs_id.split(",");

    foundObjectChairs.map((chair: any, index: number) => {
      if (chairs_id[index] === `${chair.id}`) {
        chair.status = statusAvailable;
        chair.customer_id = 0;

        chairRepository.save(chair);
      }
    });

    booking.desk.chairs = foundObjectChairs;

    const all_chair_status = chairs.map((d: any) => d.status);

    let counts = all_chair_status.reduce((acc, curr) => {
      const str = curr;
      acc[str] = (acc[str] || 0) + 1;
      return acc;
    }, {});

    if (counts.unavailable === 10) {
      booking.desk.status = statusAvailable;
    }

    await deskRepository.save(booking.desk);

    // update booking
    booking.payment_status = input.payment_status;
    booking.status = statusComplete;
    booking.inspector = user.first_name;

    updatedBooking = await bookingRepository.save(booking);

    res.status(200).json({
      status: "success",
      data: updatedBooking,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Booking", err.message);
  }
};

export const rejectBookingHandler = async (req: Request, res: Response) => {
  try {
    const input = req.params;

    const booking = await bookingRepository
      .createQueryBuilder("bookings")
      .leftJoinAndSelect("bookings.desk", "desk")
      .leftJoinAndSelect("bookings.customer", "customer")
      .select(selectBookingsColumn)
      .where("bookings.id = :id", { id: input.id })
      .getOne();

    if (!booking) {
      return responseErrors(
        res,
        400,
        "Booking not found",
        "cannot find booking"
      );
    }

    const customer = await customerRepository.findOneBy({
      id: booking.customer.id,
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
      id: booking.desk.id,
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
      .getRawMany();

    const all_chair = chairs.map((d: any) => d.id);

    const checkSomeValue = all_chair.filter(
      (c: any) => booking.chairs_id.indexOf(c) > -1
    );

    let foundObjectChairs = [] as any;
    checkSomeValue.map((e) => {
      foundObjectChairs.push(chairs.find((obj) => obj.id === e));
    });

    let chairs_id: any = booking.chairs_id.split(",");

    foundObjectChairs.map((chair: any, index: number) => {
      if (chairs_id[index] === `${chair.id}`) {
        chair.status = statusAvailable;
        chair.customer_id = 0;

        chairRepository.save(chair);
      }
    });

    booking.desk.chairs = foundObjectChairs;

    const all_chair_status = chairs.map((d: any) => d.status);

    let counts = all_chair_status.reduce((acc, curr) => {
      const str = curr;
      acc[str] = (acc[str] || 0) + 1;
      return acc;
    }, {});

    if (counts.available === 10) {
      booking.desk.status = statusAvailable;
    }

    await deskRepository.save(booking.desk);

    const d: Date = new Date();
    booking.deleted_at = d;

    await bookingRepository.save(booking); //FIXME

    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your Booking", err.message);
  }
};
