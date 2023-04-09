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
    // "https://www.googleapis.com/auth/drive.readonly",
  ],
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

    return response.data;
  } catch (error) {
    return error;
  }
};

// const oauth2Client = new google.auth.OAuth2(
//   obj.client_id,
//   "CLIENT_SECRET",
//   "www.google.com"
// );

// // Set the access token credentials for the client.
// oauth2Client.setCredentials({
//   access_token: "ACCESS_TOKEN",
//   refresh_token: "REFRESH_TOKEN",
// });

// export const getImageFromGoogleDrive = () => {};
