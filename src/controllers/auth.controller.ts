import { CookieOptions, NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { signJwt } from "../utils/jwt";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../utils/data-source";
import { any } from "zod";
import { responseErrors } from "../utils/common";
const userRepository = AppDataSource.getRepository(User);

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
    return responseErrors(res, 400, "Can't get profile data");
  }
};

export const loginUserHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return responseErrors(res, 400, "Invalid email or password");
    }

    if (!(await User.comparePasswords(password, user.password))) {
      return responseErrors(res, 400, "Invalid email or password");
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
    return responseErrors(res, 400, "Can't logout");
  }
};
