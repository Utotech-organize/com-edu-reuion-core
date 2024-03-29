import { Request, Response } from "express";
import { Desks } from "../entities/desk.entity";

import { AppDataSource } from "../utils/data-source";
import { responseErrors, statusAvailable } from "../utils/common";
import { Customers } from "../entities/customer.entity";
import axios from "axios";

const deskRepository = AppDataSource.getRepository(Desks);
const customerRepository = AppDataSource.getRepository(Customers);

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

export const createCustomerHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;
    let customer;
    let message;

    const ct = await customerRepository
      .createQueryBuilder("customers")
      .select(selectCustomerColumn)
      .where("customers.line_liff_id = :line_liff_id", {
        line_liff_id: input.line_liff_id,
      })
      .getRawOne();

    if (ct) {
      ct.first_name = input.first_name;
      ct.last_name = input.last_name;
      ct.generation = input.generation;
      ct.information = input.information;
      ct.email = input.email;
      ct.status = input.status;
      ct.channel = input.channel;

      message = "customer have been updated";

      customer = await customerRepository.save(ct);
    } else {
      let new_customer = {
        line_liff_id:
          input.line_liff_id != "undefined" ? input.line_liff_id : "",
        line_display_name:
          input.line_display_name != "undefined" ? input.line_display_name : "",
        line_photo_url:
          input.line_photo_url != "undefined" ? input.line_photo_url : "",
        tel: input.tel,
        first_name: input.first_name,
        last_name: input.last_name,
        generation: input.generation,
        information: input.information,
        email: input.email,
        channel: input.channel,
        status: "",
      } as Customers;

      message = "customer has been created";

      customer = await customerRepository.save(new_customer);

      //FIXME
      const richMenuId = "richmenu-d6e563d63772fb6d042e655561bc4182";
      const headers = {
        Authorization:
          "Bearer 2srfrgJMQ8XXBUyPC9qTGOjQKWZWkSCaQpfV1HBdecuW3j5BQY0XvVhgGEKpzbysZ0kh64p5HAB9s4q2abWHUex5/NsBoIGmqPO64QeYmSc16m6TfIBEeSKLaMiTn8tSWcd33lmz/1YKm1JHyP48ugdB04t89/1O/w1cDnyilFU=",
      };

      axios
        .post(
          `https://api.line.me/v2/bot/user/${input.line_liff_id}/richmenu/${richMenuId}`,
          null,
          {
            headers,
          }
        )
        .then((response) => {
          // Handle successful response
          console.log(response.data);
        })
        .catch((error) => {
          // Handle error
          console.error(error);
        });
    }

    try {
      res.status(200).json({
        status: "success",
        id: customer.id,
        message: message,
        data: customer,
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
      .createQueryBuilder("customers")
      .select(selectCustomerColumn)
      // .where("customers.deleted_at is null")
      .withDeleted()
      .orderBy("customers.id", "DESC")
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

    const customer = await customerRepository
      .createQueryBuilder("customers")
      .select(selectCustomerColumn)
      .where("customers.line_liff_id = :line_liff_id", {
        line_liff_id: liffID,
      })
      .withDeleted()
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

    const customer = await customerRepository
      .createQueryBuilder("customers")
      .select(selectCustomerColumn)
      .where("customers.id = :id", {
        id: id,
      })
      .withDeleted()
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

    customer.first_name = input.first_name;
    customer.last_name = input.last_name;
    customer.generation = input.generation;
    customer.information = input.information;
    customer.email = input.email;
    customer.status = input.status;
    customer.line_photo_url = input.line_photo_url;

    const updatedCustomer = await customerRepository.save(customer);

    res.status(200).json({
      status: "success",
      data: updatedCustomer,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Customer", err.message);
  }
};

export const changeCustomerStatusHandler = async (
  // Capture to change status
  req: Request,
  res: Response
) => {
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

    customer.status = statusAvailable;

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

    await customerRepository.softDelete(customer.id); //FIXME

    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your Customer", err.message);
  }
};
