import { Request, Response } from "express";
import { signJwt } from "../utils/jwt";
import { Users } from "../entities/user.entity";
import { AppDataSource } from "../utils/data-source";
import { responseErrors } from "../utils/common";

const userRepository = AppDataSource.getRepository(Users);

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

export const loginUserHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findOneBy({ email });

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

//FIXME logout
export const logoutHandler = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    res.status(200).json({
      status: "success",
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't logout", err.message);
  }
};
