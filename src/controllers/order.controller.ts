import { Request, Response } from "express";
import { responseErrors } from "../utils/common";
import { AppDataSource } from "../utils/data-source";
import { Orders } from "../entities/order.entity";

const orderRepository = AppDataSource.getRepository(Orders);
const selectOrderColumn = [
  "orders.id AS id",
  "orders.created_at AS created_at",
  "orders.updated_at AS updated_at",
  "orders.deleted_at AS deleted_at",
  "orders.label AS label",
  "orders.remark AS remark",
  "orders.total_price AS total_price",
  "orders.first_name AS first_name",
  "orders.desk_label AS desk_label",
  "orders.status AS status",
  "orders.products AS products",
];

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    let new_order_item = {
      label: input.label,
      remark: input.remark,
      total_price: input.total_price,
      first_name: input.first_name,
      desk_label: input.desk_label,
    } as Orders;

    const newOrder = await orderRepository.save(new_order_item);

    try {
      res.status(200).json({
        status: "success",
        id: newOrder.id,
        message: "Order has been created",
        data: newOrder,
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
      .where("orders.deleted_at is null")
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
