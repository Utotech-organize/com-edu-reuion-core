import { Request, Response } from "express";
import { Users } from "../entities/user.entity";
import { removeValue, responseErrors } from "../utils/common";
import { AppDataSource } from "../utils/data-source";
import bcrypt from "bcryptjs";
import { uploadFileToBase64, uploadFileToGoogleDrive } from "../utils/service";

const userRepository = AppDataSource.getRepository(Users);

export const registerUserHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const input = req.body;

    const newUser = await userRepository.save(
      userRepository.create({
        email: email.toLowerCase(),
        password,
        name: input.name,
        remark: input.remark,
        tel: input.tel,
        role: input.role,
        photo_url: input.photo_url,
      })
    );

    await newUser.save();

    try {
      res.status(200).json({
        status: "success",
        id: newUser.id,
        message: "User has been created",
        data: newUser,
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
        "User with that email already exist",
        err.message
      );
    }
    return responseErrors(res, 400, "Can't create User", err.message);
  }
};

export const getAllUsersHandler = async (req: Request, res: Response) => {
  try {
    const users = await userRepository
      .createQueryBuilder("users")
      .select([
        "users.id AS id",
        "users.created_at AS created_at",
        "users.updated_at AS updated_at",
        "users.deleted_at AS deleted_at",
        "users.email AS email",
        "users.name AS name",
        "users.remark AS remark",
        "users.tel AS tel",
        "users.role AS role",
        "users.photo_url AS photo_url",
      ])
      .getRawMany();

    removeValue(users[0], 0, users); // not show super admin

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all User", err.message);
  }
};

export const getUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await userRepository
      .createQueryBuilder("users")
      .select([
        "users.id AS id",
        "users.created_at AS created_at",
        "users.updated_at AS updated_at",
        "users.deleted_at AS deleted_at",
        "users.email AS email",
        "users.name AS name",
        "users.remark AS remark",
        "users.tel AS tel",
        "users.role AS role",
        "users.photo_url AS photo_url",
      ])
      .where("users.id = :id", { id: req.params.id })
      .getRawOne();

    if (!user || user.id == 1) {
      return responseErrors(res, 400, "User not found", "cannot find user");
    }

    // const lss = await getLessionByUser(+req.params.postId);
    // users["lessions"] = lss;

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single User", err.message);
  }
};

export const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const user = await userRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!user || user.id == 1) {
      return responseErrors(res, 400, "User not found", "cannot find user");
    }

    user.photo_url = input.photo_url;
    user.email = input.email;
    user.name = input.name;
    user.remark = input.remark;
    user.tel = input.tel;
    user.photo_url = input.photo_url;

    if (input.password && input.password !== "") {
      user.password = await bcrypt.hash(input.password, 12);
    }

    const updatedUsers = await userRepository.save(user);

    res.status(200).json({
      status: "success",
      data: updatedUsers,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your User", err.message);
  }
};

export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!user) {
      return responseErrors(res, 400, "User not found", "cannot find user");
    }

    await userRepository.delete(user.id); //FIXME

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your User", err.message);
  }
};

export const updateReceiptByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const file = req.file!;

    const user = await userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      return responseErrors(res, 400, "User not found", "cannot find user");
    }

    const imageID = await uploadFileToGoogleDrive(file, user);

    res.status(200).json({
      status: "success",
      imageID,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't upload receipt", err.message);
  }
};

export const uploadImageAndConvertToBase64 = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file!;
    const imageID = await uploadFileToBase64(file);

    res.status(200).json({
      status: "success",
      data: imageID,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't upload image", err.message);
  }
};
