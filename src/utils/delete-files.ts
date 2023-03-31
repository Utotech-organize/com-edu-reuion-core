import { AppDataSource } from "../utils/data-source";
import { OurFile } from "../entities/upload.entity";
import path from "path";
import fs from "fs";

const fileUploadedRepository = AppDataSource.getRepository(OurFile);

export const DeleteOurFiles = async (url: string, type: string) => {
  const image = await fileUploadedRepository.findOneBy({ url: url });

  if (!image) {
    return;
  }

  let filePath =
    path.resolve("./") + "/public/uploaded/" + type + "/" + image.url;

  await image.remove();

  if (!fs.existsSync(filePath)) {
    return;
  }

  fs.unlinkSync(filePath);
};

export const DeleteFileInFolder = async (
  preUrl: string,
  curUrl: string,
  type: string
) => {
  if (preUrl != "" && curUrl == "") {
    const deleted = await DeleteOurFiles(preUrl, type);
  } else if (preUrl != curUrl) {
    if (preUrl) {
      const deleted = await DeleteOurFiles(preUrl, type);
    }
  }

  return;
};
