import { NextFunction, Request, Response } from "express";
import path from "path";
import { OurFile } from "../entities/upload.entity";
import { AppDataSource } from "../utils/data-source";
import fs from "fs";
import { responseErrors } from "../utils/common";

/* Getting the repository for the OurFile class. */
const fileUploadedRepository = AppDataSource.getRepository(OurFile);

export const uploadsHandler = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return responseErrors(res, 400, "no data in body");
    }

    const ourFile = new OurFile();
    ourFile.url = req.body.image;
    ourFile.label = req.body.label;
    ourFile.type = req.body.type;

    const uploaded = await fileUploadedRepository.save(
      fileUploadedRepository.create({ ...ourFile })
    );

    res.status(200).json({
      label: uploaded.label,
      url: uploaded.url,
      type: uploaded.type,
    });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({
        status: "fail",
        message: "Uploads already exist",
      });
    }
    return responseErrors(res, 400, err);
  }
};

export const multipleUploadsHandler = async (req: Request, res: Response) => {
  try {
    const files = req.body.files;

    let rfm = files.map(async (v: any) => {
      const ourFile = new OurFile();
      ourFile.url = v.url;
      ourFile.label = v.label;
      ourFile.type = "file";

      const uploaded = await fileUploadedRepository.save(
        fileUploadedRepository.create({ ...ourFile })
      );
    });

    res.status(200).json({
      files: files,
    });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({
        status: "fail",
        message: "Uploads already exist",
      });
    }
    return responseErrors(res, 400, err);
  }
};

export const getUploadHandler = async (req: Request, res: Response) => {
  try {
    const file = await fileUploadedRepository.findOneBy({
      url: req.params.fileId,
    });

    if (!file) {
      return responseErrors(res, 400, "Upload file not found");
    }

    const fileType = file.url.split("-")[0];

    let resUpload = "";

    switch (fileType) {
      case "image":
        resUpload = path.resolve("./") + "/public/uploaded/images/" + file.url;
        break;

      case "file":
        resUpload = path.resolve("./") + "/public/uploaded/files/" + file.url;
        break;

      case "video":
        resUpload = path.resolve("./") + "/public/uploaded/videos/" + file.url;
        break;

      default:
        resUpload = path.resolve("./") + "/public/default/" + file.url;
        break;
    }

    res.status(200).sendFile(resUpload);
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const getAllUploadHandler = async (req: Request, res: Response) => {
  try {
    const uploaded = await fileUploadedRepository.find();

    res.status(200).json({
      status: "success",
      results: uploaded.length,
      data: uploaded,
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};

export const deleteUploadHandler = async (req: Request, res: Response) => {
  try {
    const file = await fileUploadedRepository.findOneBy({
      url: req.params.fileId,
    });

    if (!file) {
      return responseErrors(res, 400, "Upload file not found");
    }

    await file.remove();

    const fileType = file.url.split("-")[0];
    let filePath = "";

    switch (fileType) {
      case "image":
        filePath = path.resolve("./") + "/public/uploaded/images/" + file.url;
        break;

      case "file":
        filePath = path.resolve("./") + "/public/uploaded/files/" + file.url;
        break;

      case "video":
        filePath = path.resolve("./") + "/public/uploaded/videos/" + file.url;
        break;
    }

    if (!fs.existsSync(filePath)) {
      res.status(204).json({
        status: "success",
        data: "delete files success",
      });
    }

    fs.unlinkSync(filePath);

    res.status(204).json({
      status: "success",
      data: "delete files success",
    });
  } catch (err: any) {
    return responseErrors(res, 400, err);
  }
};
