import { Request, Response } from "express";
import { Desk } from "../entities/desk.entity";
import { User } from "../entities/user.entity";
import { responseErrors } from "../utils/common";
import { AppDataSource } from "../utils/data-source";
import bcrypt from "bcryptjs";

const userRepository = AppDataSource.getRepository(User);
const deskRepository = AppDataSource.getRepository(Desk);
// const pretestResultRepository = AppDataSource.getRepository(PretestResult);

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
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: {
          title: "There was an error to create, please try again",
          error: error,
        },
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
    const users = await userRepository
      .createQueryBuilder("users")
      .select([
        "users.id AS id",
        "users.created_at AS created_at",
        "users.updated_at AS updated_at",
        "users.email AS email",
        "users.name AS name",
        "users.remark AS remark",
        "users.tel AS tel",
        "users.role AS role",
        "users.photo_url AS photo_url",
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
        "users.name AS name",
        "users.remark AS remark",
        "users.tel AS tel",
        "users.role AS role",
        "users.photo_url AS photo_url",
      ])
      .where("users.id = :id", { id: req.params.id })
      .getRawOne();

    if (!users) {
      return responseErrors(res, 400, "User not found");
    }

    // const lss = await getLessionByUser(+req.params.postId);
    // users["lessions"] = lss;

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const users = await userRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!users) {
      return responseErrors(res, 400, "User not found");
    }

    if (users.id == 1) {
      return responseErrors(res, 400, "User not found");
    }

    users.photo_url = input.photo_url;
    users.email = input.email;
    users.name = input.name;
    users.remark = input.remark;
    users.tel = input.tel;
    users.photo_url = input.photo_url;

    if (input.password && input.password !== "") {
      users.password = await bcrypt.hash(input.password, 12);
    }

    const updatedUsers = await userRepository.save(users);

    res.status(200).json({
      status: "success",
      data: updatedUsers,
    });
  } catch (err: any) {
    console.log(err);

    return responseErrors(res, 400, "Can't update your user");
  }
};

export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!users) {
      return responseErrors(res, 400, "User not found");
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your user");
  }
};

// export const approveUserHandler = async ( //FIXME go to customer
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const user = await userRepository.findOneBy({
//       id: req.params.userId,
//     } as any);

//     if (!user) {
//       return responseErrors(res, 400, "User not found");
//     }

//     user.verified = true;
//     await user.save();

//     res.status(200).json({
//       status: "success",
//       message: "verified successfully",
//     });
//   } catch (err: any) {
//     return responseErrors(res, 400, "Can't delete your user");
//   }
// };

// async function getLessionByUser(userId: number) { //FIXME go to customer
//   const lessions = await deskRepository
//     .createQueryBuilder("lession")
//     .where("active IS TRUE")
//     .getMany();

//   let newLessions: Desk[] = [];

//   for (let l of lessions) {
//     const pretestUser = await pretestResultRepository
//       .createQueryBuilder("pretest_result")
//       .leftJoin("pretest_result.pretest", "pretest")
//       .leftJoin("pretest.lession", "lession")
//       .where("pretest_result.user_id = :id", { id: userId })
//       .getRawOne();
//   }

//   return newLessions;
// }
