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
  scopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.readonly",
  ],
});

export const drive = google.drive({
  version: "v3",
  auth: auth,
});

export const uploadFileToGoogleDrive = async (file: any) => {
  const fileMetadata = {
    name: `${file.originalname}`,
    parents: [process.env.SERVICE_DRIVE_ID_USER ?? ""],
  };

  const bs = new stream.PassThrough();
  bs.end(file.buffer);

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

    const googleDriveURL = `https://drive.google.com/uc?export=view&id=${response.data.id}`;

    return googleDriveURL;
  } catch (error) {
    return error;
  }
};

export const uploadFileToGoogleDriveWithUser = async (
  file: any,
  user_firstname: any
) => {
  const fileMetadata = {
    name: `(${user_firstname})-${file.originalname}`,
    parents: [process.env.SERVICE_DRIVE_ID_RECEIPT ?? ""],
  };

  const bs = new stream.PassThrough();
  bs.end(file.buffer);

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

    const googleDriveURL = `https://drive.google.com/uc?export=view&id=${response.data.id}`;

    return googleDriveURL;
  } catch (error) {
    return error;
  }
};

export const getFileInGoogleDrive = async (fileID: any) => {
  const googleDriveURL = `https://drive.google.com/uc?export=view&id=${fileID}`;
  return googleDriveURL;
};

export const convertFileToBase64 = async (file: any) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const mimeType = "image/png"; // e.g., image/png

  const res = "data:" + mimeType + ";base64," + b64;

  return res;
};
