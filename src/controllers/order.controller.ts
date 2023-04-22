import { Request, Response } from "express";
import { responseErrors } from "../utils/common";
import { AppDataSource } from "../utils/data-source";
import { Orders } from "../entities/order.entity";
import { Customers } from "../entities/customer.entity";
import { Products } from "../entities/product.entity";
import { OrdersDetails } from "../entities/order_details.entity";
import axios from "axios";

const urlNotify = "https://notify-api.line.me/api/notify";

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

const productRepository = AppDataSource.getRepository(Products);
const selectProductColumn = [
  "products.id AS id",
  "products.active AS active",
  "products.created_at AS created_at",
  "products.updated_at AS updated_at",
  "products.deleted_at AS deleted_at",
  "products.label AS label",
  "products.quantity AS quantity",
  "products.price AS price",
  "products.ordering AS ordering",
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

    const order = new Orders();
    order.total_price = 0;
    order.line_liff_id = input.line_liff_id;
    order.desk_label = input.desk_label;
    order.remark = input.remark;
    order.status = input.status;

    let product_id: any[] = [];
    for (var v of products) {
      product_id.push(v.id);
    }

    const productsData = await productRepository
      .createQueryBuilder("products")
      .whereInIds(product_id)
      .getMany();

    const orderDetails = productsData.map((product: any, idx: any) => {
      let orderDetail = new OrdersDetails();

      orderDetail.product = product;
      orderDetail.quantity = products[idx].quantity;
      orderDetail.order = order;
      order.total_price += product.price;
      return orderDetail;
    });

    let newOrder;
    let newOrderDetails: any;

    await AppDataSource.transaction(async (transactionalEntityManager: any) => {
      const orderRepository = transactionalEntityManager.getRepository(Orders);
      const orderDetailRepository =
        transactionalEntityManager.getRepository(OrdersDetails);
      newOrder = await orderRepository.save(order);
      newOrderDetails = await orderDetailRepository.save(orderDetails);
    });

    const accessToken = process.env.LINE_NOTIFY_TOKEN; //FIXME GET FROM SETTING

    const headers = {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    let resProducts = [];

    for (let od of newOrderDetails) {
      let pd =
        od.product.label +
        " - " +
        od.product.price +
        "฿" +
        " x " +
        od.quantity +
        "\n";

      resProducts.push(pd);
    }

    let remark: any = "-";
    if (order.remark !== null) {
      remark = order.remark;
    }

    let message =
      `สั่งออร์เดอร์ !!\nโต๊ะ ${order.desk_label}\nโดย: ${customer.first_name} ${customer.last_name}\nชื่อไลน์: ${customer.line_display_name}\nรายละเอียด:\n` +
      resProducts +
      "\n" +
      "ยอดรวม: " +
      order.total_price +
      "฿\n" +
      "*หมายเหตุ: " +
      remark;

    await axios
      .post(urlNotify, `message=${message}`, {
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

    try {
      res.status(200).json({
        status: "success",
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

export const callStaffHandler = async (req: Request, res: Response) => {
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
    const liffID = req.headers.token;

    const order = await orderRepository
      .createQueryBuilder("orders")
      .leftJoinAndSelect("orders.order_details", "ordersDetails")
      .leftJoinAndSelect("ordersDetails.product", "product")
      .where("orders.line_liff_id = :line_liff_id", { line_liff_id: liffID })
      .getOne();

    if (!order) {
      return responseErrors(res, 400, "Order not found", "cannot find Order");
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single Order", err.message);
  }
};
