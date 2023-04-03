import { Request, Response } from "express";
import { google } from "googleapis";
import stream from "stream"; // Added
require("dotenv").config();

const auth = new google.auth.GoogleAuth({
  keyFile: "config/service_account.json",
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({
  version: "v3",
  auth: auth,
});

export const uploadFileToGoogleDrive = async (file: any, user: any) => {
  const fileMetadata = {
    name: `(${user.name})-${file.originalname}`,
    parents: [process.env.SERVICE_DRIVE_ID ?? ""],
  };

  const bs = new stream.PassThrough(); // Added
  bs.end(file.buffer); // Added

  const media = {
    mimeType: file.mimetype,
    body: bs, // Modified
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    return response.data;
  } catch (error) {
    return error;
  }
};
