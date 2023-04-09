import { Request, Response } from "express";
import { responseErrors } from "../utils/common";
import {
  convertFileToBase64,
  drive,
  getFileInGoogleDrive,
  uploadFileToGoogleDrive,
  uploadFileToGoogleDriveWithUser,
} from "../utils/service";
import { AppDataSource } from "../utils/data-source";
import { Users } from "../entities/user.entity";

const userRepository = AppDataSource.getRepository(Users);

//upload file
export const uploadFileHandler = async (req: Request, res: Response) => {
  const file = req.file;
  const body = req.body;

  let resposneData: any;

  if (body.channel == "dashboard") {
    const user_id = req.user.id;

    const user = await userRepository.findOneBy({
      id: user_id as any,
    });

    if (!user) {
      return responseErrors(res, 400, "User not found", "cannot find user");
    }

    const imageURL = await uploadFileToGoogleDriveWithUser(
      file,
      user.first_name
    );
    resposneData = imageURL;
  } else {
    const imageURL = await uploadFileToGoogleDrive(file);
    resposneData = imageURL;
  }

  res.status(200).json({
    status: "success",
    data: resposneData,
  });
};

//get file
export const getFileHandler = async (req: Request, res: Response) => {
  const { file_id } = req.params;

  const data = await getFileInGoogleDrive(file_id);

  res.status(200).send({
    data,
  });
};
