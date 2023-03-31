import { Request } from "express";
import multer from "multer";
import path from "path";
import uuid from "../utils/uuid";

//Upload to folder images
const multerStoragePhoto = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, `${__dirname}../../../public/uploaded/images`);
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const ext = file.mimetype.split("/")[1];

    let fileUrl = `image-${uuid()}-${Date.now()}.${ext}`;

    req.body.image = fileUrl;
    req.body.label = file.originalname;

    cb(null, fileUrl);
  },
});

const multerFilterPhoto = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  var ext = path.extname(file.originalname);
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
    return cb(new Error("Only images are allowed"));
  }
  cb(null, true);
};

const uploadPhoto = multer({
  storage: multerStoragePhoto,
  fileFilter: multerFilterPhoto,
  limits: { fileSize: 1024 * 1024 * 4, files: 1 },
});

export const uploadLessionPhotoDisk = uploadPhoto.single("file");

//Upload to folder files
const multerStorage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, `${__dirname}../../../public/uploaded/files`);
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const ext = file.mimetype.split("/")[1];

    let fileUrl = `file-${uuid()}-${Date.now()}.${ext}`;

    req.body.image = fileUrl;
    req.body.label = file.originalname;

    cb(null, fileUrl);
  },
});

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1024 * 1024 * 1024 * 1024, files: 1 },
});

export const uploadLessionFileDisk = upload.single("file");
