import { Request, Response } from "express";
import { Desks } from "../entities/desk.entity";
import { Chairs } from "../entities/chair.entity";

import { AppDataSource } from "../utils/data-source";
import { responseErrors } from "../utils/common";
import { Customers } from "../entities/customer.entity";

const chairRepository = AppDataSource.getRepository(Chairs);
const deskRepository = AppDataSource.getRepository(Desks);
const customerRepository = AppDataSource.getRepository(Customers);

// export const getAllPretestWithLessionIDHandler = async ( //FIXME get all chair with desk
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const pretest = await pretestRepository
//       .createQueryBuilder("pretest")
//       .where("lession_id = :lession_id", {
//         lession_id: req.params.postId as any,
//       })
//       .getMany();

//     if (!pretest) {
//       return responseErrors(res, 400, "pretest not found");
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         pretest,
//       },
//     });
//   } catch (err: any) {
//     return responseErrors(res, 400, err);
//   }
// };

export const createCustomerHandler = async (req: Request, res: Response) => {
  try {
    // const userId = req.user.id;
    const input = req.body;

    const newCustomer = await customerRepository.save(
      customerRepository.create({
        line_liff_id: input.line_liff_id,
        line_display_name: input.line_display_name,
        line_photo_url: input.line_photo_url,
        tel: input.tel,
        name: input.name,
        information: input.information,
        email: input.email,
        status: "unpaid",
      })
    );

    await newCustomer.save();

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

export const getCustomerHandler = async (req: Request, res: Response) => {
  try {
    const customer = await customerRepository
      .createQueryBuilder("customers")
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
      .where("customers.id = :id", { id: req.params.id })
      .getRawOne();

    if (!customer) {
      return responseErrors(
        res,
        400,
        "Customer not found",
        "cannot find customer"
      );
    }

    // const lss = await getLessionByUser(+req.params.postId);
    // users["lessions"] = lss;

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

    const users = await customerRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!users) {
      return responseErrors(
        res,
        400,
        "Customer not found",
        "cannot find customer"
      );
    }

    users.name = input.name;
    users.information = input.information;
    users.email = input.email;
    users.status = input.status;

    const updatedCustomer = await customerRepository.save(users);

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
