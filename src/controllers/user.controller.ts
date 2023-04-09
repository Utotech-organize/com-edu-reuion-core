import { Request, Response } from "express";
import { Users } from "../entities/user.entity";
import { removeValue, responseErrors } from "../utils/common";
import { AppDataSource } from "../utils/data-source";
import bcrypt from "bcryptjs";
import { uploadFileToGoogleDrive } from "../utils/service";

const userRepository = AppDataSource.getRepository(Users);
const selectUserColumn = [
  "users.id AS id",
  "users.created_at AS created_at",
  "users.updated_at AS updated_at",
  "users.deleted_at AS deleted_at",
  "users.email AS email",
  "users.first_name AS first_name",
  "users.last_name AS last_name",
  "users.remark AS remark",
  "users.tel AS tel",
  "users.role AS role",
  "users.image_url AS image_url",
];

export const registerUserHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const input = req.body;

    const newUser = await userRepository.save(
      userRepository.create({
        email: email.toLowerCase(),
        password,
        first_name: input.first_name,
        last_name: input.last_name,
        remark: input.remark,
        tel: input.tel,
        role: input.role,
        image_url: input.image_url,
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
      .select(selectUserColumn)
      .where("users.deleted_at is null")
      .andWhere("users.role = :role", { role: "admin" })
      .orderBy("users.id", "DESC")
      .getRawMany();

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
      .select(selectUserColumn)
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

    user.email = input.email;
    user.first_name = input.first_name;
    user.last_name = input.last_name;
    user.remark = input.remark;
    user.tel = input.tel;
    user.image_url = input.image_url;

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

    await userRepository.softDelete(user.id); //FIXME

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your User", err.message);
  }
};

// export const uploadImageAndConvertToBase64 = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const file = req.file!;
//     const imageID = await uploadFileToBase64(file);

//     res.status(200).json({
//       status: "success",
//       data: imageID,
//     });
//   } catch (err: any) {
//     return responseErrors(res, 400, "Can't upload image", err.message);
//   }
// };
