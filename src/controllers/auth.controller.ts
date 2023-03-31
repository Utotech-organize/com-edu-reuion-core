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

    if (!user.verified) {
      return responseErrors(
        res,
        401,
        "You are not verified, check your email to verify your account"
      );
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

const logout = (res: Response) => {
  // res.cookie("access_token", "", { maxAge: 1 });
  // res.cookie("refresh_token", "", { maxAge: 1 });
  // res.cookie("logged_in", "", { maxAge: 1 });
};

export const logoutHandler = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    logout(res);

    res.status(200).json({
      status: "success",
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't logout");
  }
};
