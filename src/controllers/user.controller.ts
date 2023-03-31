import { NextFunction, Request, Response } from "express";
import { Lession } from "../entities/lession.entity";
import { PretestResult } from "../entities/pretest-result.entity";
import { User } from "../entities/user.entity";
import { responseErrors } from "../utils/common";
import { AppDataSource } from "../utils/data-source";
import { DeleteFileInFolder, DeleteOurFiles } from "../utils/delete-files";
import bcrypt from "bcryptjs";

const userRepository = AppDataSource.getRepository(User);

/* Getting the lession repository from the database. */
const lessionRepository = AppDataSource.getRepository(Lession);

/* Getting the lession repository from the database. */
const pretestResultRepository = AppDataSource.getRepository(PretestResult);

export const registerUserHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const newUser = await userRepository.save(
      userRepository.create({
        email: email.toLowerCase(),
        password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        class: req.body.class,
        class_number: req.body.class_number,
        role: req.body.role,
        photo_url: req.body.photo_url,
        verified: false,
      })
    );

    await newUser.save();

    try {
      res.status(200).json({
        status: "success",
        id: newUser.id,
        message:
          "An email with a verification has been sent to please wait for admin",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "There was an error sending verification, please try again",
      });
    }
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({
        status: "fail",
        message: "User with that email already exist",
      });
    }
    return responseErrors(res, 400, err);
  }
};

export const getAllUsersHandler = async (req: Request, res: Response) => {
  try {
    // const users = await userRepository.createQueryBuilder("users").getMany();
    const users = await userRepository
      .createQueryBuilder("users")
      .select([
        "users.id AS id",
        "users.created_at AS created_at",
        "users.updated_at AS updated_at",
        "users.email AS email",
        "users.role AS role",
        "users.photo_url AS photo_url",
        "users.firstname AS firstname",
        "users.lastname AS lastname",
        "users.class AS class",
        "users.class_number AS class_number",
        "users.verified AS verified",
      ])
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const getUserHandler = async (req: Request, res: Response) => {
  try {
    const users = await userRepository
      .createQueryBuilder("users")
      .select([
        "users.id AS id",
        "users.created_at AS created_at",
        "users.updated_at AS updated_at",
        "users.email AS email",
        "users.role AS role",
        "users.photo_url AS photo_url",
        "users.firstname AS firstname",
        "users.lastname AS lastname",
        "users.class AS class",
        "users.class_number AS class_number",
        "users.verified AS verified",
      ])
      .where("users.id = :id", { id: req.params.postId })
      .getRawOne();

    if (!users) {
      return responseErrors(res, 400, "User not found");
    }

    const lss = await getLessionByUser(+req.params.postId);
    users["lessions"] = lss;

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const updateUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = req.body;

    const users = await userRepository.findOneBy({
      id: req.params.postId as any,
    });

    if (!users) {
      return responseErrors(res, 400, "User not found");
    }

    await DeleteFileInFolder(users.photo_url, input.photo_url, "images");
    users.photo_url = input.photo_url;

    users.email = input.email;
    users.role = input.role;
    users.photo_url = input.photo_url;
    users.firstname = input.firstname;
    users.lastname = input.lastname;
    users.class = input.class;
    users.class_number = input.class_number;
    users.verified = input.verified;

    if (input.password && input.password !== "") {
      users.password = await bcrypt.hash(input.password, 12);
    }

    const updatedUsers = await userRepository.save(users);

    res.status(200).json({
      status: "success",
      data: {
        users: updatedUsers,
      },
    });
  } catch (err: any) {
    console.log(err);

    return responseErrors(res, 400, "Can't update your user");
  }
};

export const deleteUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userRepository.findOneBy({
      id: req.params.postId as any,
    });

    if (!users) {
      return responseErrors(res, 400, "User not found");
    }

    await DeleteFileInFolder(users.photo_url, users.photo_url, "images");
    await users.remove();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your user");
  }
};

export const approveUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userRepository.findOneBy({
      id: req.params.userId,
    } as any);

    if (!user) {
      return responseErrors(res, 400, "User not found");
    }

    user.verified = true;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "verified successfully",
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your user");
  }
};

async function getLessionByUser(userId: number) {
  const lessions = await lessionRepository
    .createQueryBuilder("lession")
    .where("active IS TRUE")
    .getMany();

  let newLessions: Lession[] = [];

  for (let l of lessions) {
    const pretestUser = await pretestResultRepository
      .createQueryBuilder("pretest_result")
      .leftJoin("pretest_result.pretest", "pretest")
      .leftJoin("pretest.lession", "lession")
      .where("pretest_result.user_id = :id", { id: userId })
      .getRawOne();
  }

  return newLessions;
}
