import { Request, Response } from "express";
import { Desks } from "../entities/desk.entity";
import { Chairs } from "../entities/chair.entity";

import { AppDataSource } from "../utils/data-source";
import {
  responseErrors,
  statusAvailable,
  statusPending,
} from "../utils/common";
import { Customers } from "../entities/customer.entity";

const chairRepository = AppDataSource.getRepository(Chairs);
const deskRepository = AppDataSource.getRepository(Desks);
const customerRepository = AppDataSource.getRepository(Customers);

export const createCustomerHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const chairs = input.chairs;

    let new_customer = {
      line_liff_id: input.line_liff_id,
      line_display_name: input.line_display_name,
      line_photo_url: input.line_photo_url,
      tel: input.tel,
      name: input.name,
      information: input.information,
      email: input.email,
      status: "unpaid",
    } as Customers;

    const newCustomer = await customerRepository.save(new_customer);

    if (chairs) {
      chairs.forEach((chair_id: any) => {
        updateChairWithCustomer(
          res,
          chair_id,
          newCustomer.id,
          newCustomer.name
        );
      });
    }

    try {
      res.status(200).json({
        status: "success",
        id: newCustomer.id,
        message: "Customer has been created",
        data: newCustomer,
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
        "Customer with that tel and liff_id already exist",
        err.message
      );
    }
    return responseErrors(res, 400, "Can't create Customer", err.message);
  }
};

export const getAllCustomersHandler = async (req: Request, res: Response) => {
  try {
    const customers = await customerRepository
      .createQueryBuilder("customer")
      .select([
        "customer.id AS id",
        "customer.created_at AS created_at",
        "customer.updated_at AS updated_at",
        "customer.deleted_at AS deleted_at",
        "customer.tel AS tel",
        "customer.name AS name",
        "customer.status AS status",
        "customer.information AS information",
        "customer.email AS email",
        "customer.role AS role",
        "customer.line_liff_id AS line_liff_id",
        "customer.line_display_name AS line_display_name",
        "customer.line_photo_url AS line_photo_url",
      ])
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: customers.length,
      data: customers,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all Customer", err.message);
  }
};

export const getCustomerByLiffIDHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const liffID = req.headers.token;

    const customerResponse = [
      "customers.id AS id",
      "customers.created_at AS created_at",
      "customers.updated_at AS updated_at",
      "customers.deleted_at AS deleted_at",
      "customers.tel AS tel",
      "customers.name AS name",
      "customers.status AS status",
      "customers.information AS information",
      "customers.email AS email",
      "customers.role AS role",
      "customers.line_liff_id AS line_liff_id",
      "customers.line_display_name AS line_display_name",
      "customers.line_photo_url AS line_photo_url",
    ];

    const customer = await customerRepository
      .createQueryBuilder("customers")
      .select(customerResponse)
      .where("customers.line_liff_id = :line_liff_id", {
        line_liff_id: liffID,
      })
      .getRawOne();

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
    return responseErrors(
      res,
      400,
      "Can't get single Customer by liff id",
      err.message
    );
  }
};

export const getCustomerHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const customerResponse = [
      "customers.id AS id",
      "customers.created_at AS created_at",
      "customers.updated_at AS updated_at",
      "customers.deleted_at AS deleted_at",
      "customers.tel AS tel",
      "customers.name AS name",
      "customers.status AS status",
      "customers.information AS information",
      "customers.email AS email",
      "customers.role AS role",
      "customers.line_liff_id AS line_liff_id",
      "customers.line_display_name AS line_display_name",
      "customers.line_photo_url AS line_photo_url",
    ];

    const customer = await customerRepository
      .createQueryBuilder("customers")
      .select(customerResponse)
      .where("customers.id = :id", {
        id: id,
      })
      .getRawOne();

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
    return responseErrors(res, 400, "Can't get single Customer", err.message);
  }
};

export const updateCustomerHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const customer = await customerRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!customer) {
      return responseErrors(
        res,
        400,
        "Customer not found",
        "cannot find customer"
      );
    }

    customer.name = input.name;
    customer.information = input.information;
    customer.email = input.email;
    customer.status = input.status;

    if (input.chairs) {
      input.chairs.forEach((chair_id: any) => {
        updateChairWithCustomer(res, chair_id, customer.id, customer.name);
      });
    }
    const updatedCustomer = await customerRepository.save(customer);

    res.status(200).json({
      status: "success",
      data: updatedCustomer,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Customer", err.message);
  }
};

export const deleteCustomerHandler = async (req: Request, res: Response) => {
  try {
    const customer = await customerRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!customer) {
      return responseErrors(
        res,
        400,
        "Customer not found",
        "cannot find customer"
      );
    }

    await deskRepository.delete(customer.id); //FIXME

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your Customer", err.message);
  }
};

export const updateChairWithCustomer = async (
  res: Response,
  chair_id: number,
  customer_id: number,
  customer_name: string
) => {
  try {
    const chair = await chairRepository.findOneBy({
      id: chair_id,
      status: statusAvailable,
    });

    if (!chair) {
      return responseErrors(
        res,
        400,
        "Chair not found",
        "chair is not available"
      );
    }

    chair.status = statusPending;
    chair.customer_id = customer_id;
    chair.customer_name = customer_name;

    const updatedChair = await chairRepository.save(chair);

    return updatedChair;
  } catch (err: any) {
    return responseErrors(res, 400, "Can't booked your Chair", err.message);
  }
};
