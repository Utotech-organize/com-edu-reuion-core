import { Request, Response } from "express";
import { responseErrors } from "../utils/common";
import { AppDataSource } from "../utils/data-source";
import { Orders } from "../entities/order.entity";
import { Customers } from "../entities/customer.entity";
import { Products } from "../entities/product.entity";

const orderRepository = AppDataSource.getRepository(Orders);
const selectOrderColumn = [
  "orders.id AS id",
  "orders.created_at AS created_at",
  "orders.updated_at AS updated_at",
  "orders.deleted_at AS deleted_at",
  "orders.remark AS remark",
  "orders.total_price AS total_price",
  "orders.first_name AS first_name",
  "orders.desk_label AS desk_label",
  "orders.status AS status",
  "orders.products AS products",
];

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

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const products = input.products;

    const customer = await customerRepository
      .createQueryBuilder("customers")
      .select(selectCustomerColumn)
      .where("customers.line_liff_id = :line_liff_id", {
        line_liff_id: input.line_liff_id,
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

    console.log(input);

    // let product: Products[] = [];

    //   const product = await productRepository
    //     .createQueryBuilder("products")
    //     .select(selectProductColumn)
    //     .where("products.id = :id", { id: req.params.id })
    //     .getRawOne();

    for (var v of products) {
      // let chairTemp = {
      //   chair_no: i.chair_no,
      //   label: i.label,
      //   status: i.status,
      //   price: i.price,
      //   desk: {
      //     id: desks.id,
      //   } as Desks,
      // } as Chairs;
      // product.push(chairTemp);
    }

    try {
      res.status(200).json({
        status: "success",
        // id: newOrder.id,
        // message: "Order has been created",
        // data: newOrder,
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
    return responseErrors(res, 400, "Can't create Order", err.message);
  }
};

export const getAllOrdersHandler = async (req: Request, res: Response) => {
  try {
    const orders = await orderRepository
      .createQueryBuilder("orders")
      .select(selectOrderColumn)
      // .where("orders.deleted_at is null")
      .orderBy("orders.ordering", "ASC")
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all Order", err.message);
  }
};

export const getSingleOrderHandler = async (req: Request, res: Response) => {
  try {
    const Order = await orderRepository
      .createQueryBuilder("orders")
      .select(selectOrderColumn)
      .where("orders.id = :id", { id: req.params.id })
      .getRawOne();

    if (!Order) {
      return responseErrors(res, 400, "Order not found", "cannot find Order");
    }

    res.status(200).json({
      status: "success",
      data: Order,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single Order", err.message);
  }
};
