import { Request, Response } from "express";
import { signJwt } from "../utils/jwt";
import { Users } from "../entities/user.entity";
import { AppDataSource } from "../utils/data-source";
import { responseErrors } from "../utils/common";
import { Customers } from "../entities/customer.entity";

const userRepository = AppDataSource.getRepository(Users);
const customerRepository = AppDataSource.getRepository(Customers);

export const getMeHandler = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ id: req.user.id });

    res.status(200).status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get profile data", err.message);
  }
};

export const getLiffMeHandler = async (req: Request, res: Response) => {
  try {
    const liff = await customerRepository.findOneBy({
      line_liff_id: req.user.id,
    });

    res
      .status(200)
      .status(200)
      .json({
        status: "success",
        data: {
          user: liff,
        },
      });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get liff profile data", err.message);
  }
};

export const loginCustomerWithLiffHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { liff: liffID } = req.body;
    const customer = await customerRepository.findOneBy(liffID);

    if (!customer) {
      return responseErrors(
        res,
        400,
        "Customer not found",
        "cannot find customer"
      );
    }

    const access_token = signJwt({
      id: customer.id,
      liff_id: customer.line_liff_id,
    });

    res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (err: any) {}
};

export const loginUserHandler = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await userRepository.findOneBy({ email: username });

    if (!user) {
      return responseErrors(res, 400, "User not found", "cannot find user");
    }

    if (!(await Users.comparePasswords(password, user.password))) {
      return responseErrors(
        res,
        400,
        "Please check your data or contact admin",
        "Invalid email or password"
      );
    }

    const access_token = signJwt({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (err: any) {}
};
