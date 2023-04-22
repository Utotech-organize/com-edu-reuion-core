import { Request, Response } from "express";
import uuid, {
  channelDashboard,
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
import { qrcodeGenerator } from "../utils/service";
import _ from "lodash";
import axios from "axios";
import { flexRegister } from "../utils/line_api_display";

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
  "bookings.chairs_label AS chairs_label",
  "bookings.total AS total",
  "bookings.qrcode_image AS qrcode_image", //FIXME remove when production
  "bookings.image_url AS image_url", //FIXME remove when production
  "bookings.customer AS customer",
  "bookings.desk AS desk",
];

const selectCustomerColumn = [
  "customers.id AS id",
  "customers.created_at AS created_at",
  "customers.updated_at AS updated_at",
  "customers.deleted_at AS deleted_at",
  "customers.tel AS tel",
  "customers.first_name AS first_name",
  "customers.last_name AS last_name",
  "customers.generation AS generation",
  "customers.channel AS channel",
  "customers.status AS status",
  "customers.information AS information",
  "customers.email AS email",
  "customers.role AS role",
  "customers.line_liff_id AS line_liff_id",
  "customers.line_display_name AS line_display_name",
  "customers.line_photo_url AS line_photo_url",
];

const getCustomer = async (customer_id: any) => {
  const customer = await customerRepository.findOne({
    where: { id: customer_id },
  });
  if (!customer) {
    throw new Error("cannot find customer");
  }

  return customer;
};

const getDesk = async (desk_id: any) => {
  const desk = await deskRepository.findOneBy({
    id: desk_id,
    active: true,
  });
  if (!desk) {
    throw new Error("cannot find desk");
  }

  return desk;
};

const getChairWithDesk = async (desk_id: any, ids: any) => {
  const chairsWithDesks = await chairRepository
    .createQueryBuilder("chairs")
    .leftJoinAndSelect("chairs.desk", "desk")
    .where("chairs.desk_id = :desk_id", { desk_id: desk_id })
    .andWhereInIds(ids)
    .getMany();

  return chairsWithDesks;
};

export const createBookingHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const customer = await getCustomer(input.customer_id);
    const desk = await getDesk(input.desk_id);
    const chairsWithDesks = await getChairWithDesk(desk.id, input.chairs_id);

    if (chairsWithDesks.length === 0) {
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

    const chair = chairsWithDesks.map((chair: any) => {
      if (chair.status !== statusPending) {
        chair.status = statusPending;
        chair.customer_id = customer.id;
        chairPrice = chairPrice + chair.price;

        return chair;
      }
    });

    await chairRepository.save(chair);

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

    let chairLabel = chairsWithDesks.map((r) => r.label);
    let chairs = input.chairs_id.toString();

    const bookingSlug: string = uuid();
    const qrcodeURL = await qrcodeGenerator(bookingSlug, paramsForQr);

    let new_booking = {
      slug: bookingSlug,
      status: statusPending,
      payment_status: statusUnPaid,
      inspector: "",
      customer: customer,
      chairs_id: chairs,
      chairs_label: chairLabel.toString(),
      desk: desk,
      total: chairPrice,
      qrcode_image: qrcodeURL,
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

export const getAllBookingsHandler = async (req: Request, res: Response) => {
  try {
    const bookings = await bookingRepository
      .createQueryBuilder("bookings")
      .leftJoinAndSelect("bookings.customer", "customer")
      .leftJoinAndSelect("bookings.desk", "desk")
      .orderBy("bookings.id", "DESC")
      .withDeleted()
      .getMany();
    // const bookings = await bookingRepository.find({
    //   relations: ["customer", "desk"],
    //   order: { id: "DESC" },
    //   select: [
    //     "id",
    //     "created_at",
    //     "updated_at",
    //     "deleted_at",
    //     "status",
    //     "payment_status",
    //     "inspector",
    //     "total",
    //     "customer",
    //     "desk",
    //   ],
    // });

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: bookings,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all Bookings", err.message);
  }
};

export const getAllBookingsWithLiffIDHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const liffID = req.headers.token;

    const bookings = await bookingRepository
      .createQueryBuilder("bookings")
      .leftJoinAndSelect("bookings.customer", "customer")
      .leftJoinAndSelect("bookings.desk", "desk")
      .where("customer.line_liff_id = :line_liff_id", {
        line_liff_id: liffID,
      })
      .orderBy("bookings.id", "DESC")
      .getMany();

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: bookings,
    });
  } catch (err: any) {
    return responseErrors(
      res,
      400,
      "Can't get all Bookings with liff id",
      err.message
    );
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

    let chairs_id: any = booking.chairs_id.split(",");
    const chairWithBooking = await getChairWithDesk(desk.id, chairs_id);
    booking.desk.chairs = chairWithBooking;

    res.status(200).json({
      status: "success",
      data: booking,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single Bookings", err.message);
  }
};

export const getSingleBookingWithSlugTicketHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const booking_ticket = req.params.ticket;

    const booking = await bookingRepository
      .createQueryBuilder("bookings")
      .select(selectBookingsColumn)
      .where("bookings.slug = :slug", {
        slug: booking_ticket,
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

    let chairs_id: any = booking.chairs_id.split(",");
    const chairWithBooking = await getChairWithDesk(desk.id, chairs_id);
    booking.desk.chairs = chairWithBooking;

    //FIXME
    // const richMenuId = "richmenu-d6e563d63772fb6d042e655561bc4182";
    // const headers = {
    //   Authorization:
    //     "Bearer 2srfrgJMQ8XXBUyPC9qTGOjQKWZWkSCaQpfV1HBdecuW3j5BQY0XvVhgGEKpzbysZ0kh64p5HAB9s4q2abWHUex5/NsBoIGmqPO64QeYmSc16m6TfIBEeSKLaMiTn8tSWcd33lmz/1YKm1JHyP48ugdB04t89/1O/w1cDnyilFU=",
    // };

    // await axios
    //   .post(
    //     `https://api.line.me/v2/bot/user/${customer.line_liff_id}/richmenu/${richMenuId}`,
    //     null,
    //     {
    //       headers,
    //     }
    //   )
    //   .then((response) => {
    //     // Handle successful response
    //     console.log(response.data);
    //   })
    //   .catch((error) => {
    //     // Handle error
    //     console.error(error);
    //   });

    res.status(200).json({
      status: "success",
      data: booking,
    });
  } catch (err: any) {
    return responseErrors(
      res,
      400,
      "Can't get single Booking with ticket",
      err.message
    );
  }
};

// updateBookingWithUserHandler is Approve with user
export const updateBookingWithUserHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const input = req.body;
    const booking_id = req.params.id;
    const user_id = req.user.id;

    const user = await userRepository.findOneBy({
      id: user_id as any,
    });

    if (!user) {
      return responseErrors(res, 400, "User not found", "cannot find user");
    }

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
        "Booking not found",
        "cannot find booking"
      );
    }

    const customer = await getCustomer(booking.customer);
    booking.customer = customer;
    const desk = await getDesk(booking.desk);
    booking.desk = desk;

    let chairs_id: any = booking.chairs_id.split(",");
    const chairsWithDesk = await getChairWithDesk(desk.id, chairs_id);

    const chair = chairsWithDesk.map((chair: any) => {
      chair.status = statusUnAvailable;
      chair.customer_id = customer.id;
      chair.customer_name = customer.first_name;
      chair.user_id = user.id;

      return chair;
    });

    await chairRepository.save(chair);

    const allChairsWithDeskID = await chairRepository
      .createQueryBuilder("chairs")
      .leftJoinAndSelect("chairs.desk", "desk")
      .where("chairs.desk_id = :desk_id", { desk_id: desk.id })
      .andWhere("chairs.status = :status", { status: statusUnAvailable })
      .getCount();

    if (allChairsWithDeskID === 10) {
      desk.status = statusUnAvailable;
    }

    await deskRepository.save(desk);

    // update booking
    booking.payment_status = input.payment_status;
    booking.status = statusComplete;
    booking.inspector = user.first_name;
    booking.desk_chairs = chairsWithDesk;
    booking.image_url = input.image_url;
    booking.desk.chairs = chairsWithDesk;

    const updatedBooking = await bookingRepository.save(booking);

    let flexMessageBody = flexRegister(
      customer.line_liff_id,
      desk.label,
      updatedBooking.chairs_label,
      updatedBooking.qrcode_image
    );

    const headers = {
      Authorization: "Bearer " + process.env.LINE_ACCESS_TOKEN,
      "Content-Type": "application/json",
    };

    axios
      .post(`https://api.line.me/v2/bot/message/push`, flexMessageBody, {
        headers,
      })
      .then((response: any) => {
        // Handle successful response
        console.log(response.data);
      })
      .catch((error: any) => {
        // Handle error
        console.error(error);
      });

    res.status(200).json({
      status: "success",
      data: updatedBooking,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Booking", err.message);
  }
};

//FIXME
export const rejectBookingHandler = async (req: Request, res: Response) => {
  try {
    const booking_id = req.params.id;
    const user_id = req.user.id;

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
        "Booking not found",
        "cannot find booking"
      );
    }

    const customer = await getCustomer(booking.customer);
    booking.customer = customer;
    const desk = await getDesk(booking.desk);
    booking.desk = desk;

    let chairs_id: any = booking.chairs_id.split(",");
    const chairsWithDesk = await getChairWithDesk(desk.id, chairs_id);

    const chair = chairsWithDesk.map((chair: any) => {
      chair.status = statusAvailable;
      chair.customer_id = 0;
      return chair;
    });

    await chairRepository.save(chair);

    booking.desk_chairs = chairsWithDesk;

    const allChairsWithDeskID = await chairRepository
      .createQueryBuilder("chairs")
      .leftJoinAndSelect("chairs.desk", "desk")
      .where("chairs.desk_id = :desk_id", { desk_id: desk.id })
      .andWhere("chairs.status = :status", { status: statusAvailable })
      .getCount();

    if (allChairsWithDeskID === 10) {
      desk.status = statusAvailable;
    }

    await deskRepository.save(booking.desk);

    const user = await userRepository.findOneBy({
      id: user_id as any,
    });

    if (!user) {
      return responseErrors(res, 400, "User not found", "cannot find user");
    }

    const d: Date = new Date();
    booking.deleted_at = d;
    booking.status = "cancel";
    booking.inspector = user.first_name;

    await bookingRepository.save(booking);

    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your Booking", err.message);
  }
};

export const getTicketBookingAndMergeCustomerHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const headers = req.headers;
    const line_liff_id = headers.line_liff_id;
    const line_display_name = headers.line_display_name;
    const line_photo_url = headers.line_photo_url;

    const ticket = headers.ticket; // ticket = booking slug

    const bookings = await bookingRepository
      .createQueryBuilder("bookings")
      .leftJoinAndSelect("bookings.customer", "customer")
      .where("bookings.slug = :slug", {
        slug: ticket,
      })
      .orderBy("bookings.id", "DESC")
      .getOne();

    if (!bookings) {
      return responseErrors(
        res,
        400,
        "Booking not found",
        "cannot find booking with slug"
      );
    }

    let customer = await customerRepository
      .createQueryBuilder("customers")
      .select(selectCustomerColumn)
      .where("customers.line_liff_id = :line_liff_id", {
        line_liff_id: line_liff_id,
      })
      .getRawOne();

    if (bookings.customer.id !== customer.id) {
      await customerRepository.delete(customer.id); //delete old customer with register by line
    }

    const dashboardCt = await customerRepository //Have booking
      .createQueryBuilder("customers")
      .select(selectCustomerColumn)
      .where("customers.id = :id", {
        id: bookings.customer.id,
      })
      .getRawOne();

    if (!dashboardCt) {
      return responseErrors(
        res,
        400,
        "Customer not found",
        "cannot find customer with id"
      );
    }

    if (
      dashboardCt.line_display_name === "" &&
      dashboardCt.line_liff_id === "" &&
      dashboardCt.line_photo_url === ""
    ) {
      dashboardCt.first_name = customer.first_name;
      dashboardCt.last_name = customer.last_name;
      dashboardCt.generation = customer.generation;
      dashboardCt.information = customer.information;
      dashboardCt.email = customer.email;
      dashboardCt.status = "merge";
      dashboardCt.line_display_name = line_display_name;
      dashboardCt.line_liff_id = line_liff_id;
      dashboardCt.line_photo_url = line_photo_url;
      dashboardCt.channel = "line";

      customer = await customerRepository.save(dashboardCt);
    }

    if (!customer) {
      return responseErrors(
        res,
        400,
        "Customer not found",
        "cannot find customer"
      );
    }

    res.status(200).json({
      status: "success",
      data: customer,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Customer", err.message);
  }
};
