import { Request, Response } from "express";
import { google } from "googleapis";
import stream from "stream"; // Added
require("dotenv").config();

const obj = JSON.parse(process.env.CREDENTIAL_GOOGLE as any);

const auth = new google.auth.GoogleAuth({
  credentials: {
    private_key: obj.private_key,
    client_email: obj.client_email,
    client_id: obj.client_id,
  },
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({
  version: "v3",
  auth: auth,
});

export const uploadFileToGoogleDrive = async (file: any, user: any) => {
  console.log(file);

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

export const uploadFileToBase64 = async (file: any) => {
  let base64data = file.buffer.toString("base64");

  // console.log(base64data);

  return base64data;
};
