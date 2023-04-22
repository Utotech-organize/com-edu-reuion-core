import axios from "axios";
import { Request, Response } from "express";
import { enterMessage, snapshotMessage } from "./line_api_display";
import { Stream } from "stream";
import { drive } from "./service";
import path from "path";
import fs from "fs";
import { AppDataSource } from "./data-source";
import { Customers } from "../entities/customer.entity";
import { responseErrors, statusAvailable, statusUnAvailable } from "./common";

const customerRepository = AppDataSource.getRepository(Customers);
const selectCustomerColumn = [
  "customers.id AS id",
  "customers.created_at AS created_at",
  "customers.updated_at AS updated_at",
  "customers.deleted_at AS deleted_at",
  "customers.tel AS tel",
  "customers.first_name AS first_name",
  "customers.last_name AS last_name",
  "customers.generation AS generation",
  "customers.channel AS channel",
  "customers.status AS status",
  "customers.information AS information",
  "customers.email AS email",
  "customers.role AS role",
  "customers.line_liff_id AS line_liff_id",
  "customers.line_display_name AS line_display_name",
  "customers.line_photo_url AS line_photo_url",
];

export const devioController = async (req: Request, res: Response) => {
  let resFromGoogle: string = "";
  const headers = {
    Authorization: "Bearer " + process.env.LINE_ACCESS_TOKEN,
    "Content-Type": "application/json",
  };

  for (const event of req.body.events) {
    const replyToken = event.replyToken;

    switch (event.type) {
      case "enter":
        console.log("in enter");
        axios
          .post(
            `https://api.line.me/v2/bot/message/reply`,
            enterMessage(replyToken),
            {
              headers,
            }
          )
          .then((response: any) => {
            // Handle successful response
            console.log(response.data);
          })
          .catch((error: any) => {
            // Handle error
            console.error(error);
          });
        break;

      case "postback":
        axios
          .get(
            `http://localhost:9093/image/c319f57f-6db1-4ada-9ca4-f0fdb38c13f2/channel/0`
          )
          .then(async (response: any) => {
            await urlToImageFile(response.data.image, "name.png"); // FIXME

            const fileMetadata = {
              name: `${event.timestamp}-(${event.source.userId})`,
              parents: [process.env.SERVICE_DRIVE_ID_QRCODE ?? ""],
            };

            const media = {
              mimeType: "image/png",
              body: fs.createReadStream("name.png"),
            };

            try {
              const responseData = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: "id",
              });

              resFromGoogle = `https://drive.google.com/uc?export=view&id=${responseData.data.id}`;
            } catch (err) {
              return err;
            }

            const headers = {
              Authorization: "Bearer " + process.env.LINE_ACCESS_TOKEN,
              "Content-Type": "application/json",
            };

            axios
              .post(
                `https://api.line.me/v2/bot/message/reply`,
                snapshotMessage(replyToken, resFromGoogle),
                {
                  headers,
                }
              )
              .then((response: any) => {
                // Handle successful response
                console.log(response.data);
              })
              .catch((error: any) => {
                // Handle error
                console.error(error);
              });
          })
          .catch((error: any) => {
            // Handle error
            console.error(error);
          });

        break;

      case "beacon":
        const current_user = req.body.events.map((v: any) => v.source.userId);

        try {
          const customers = await customerRepository
            .createQueryBuilder("customers")
            .select(selectCustomerColumn)
            .withDeleted()
            .orderBy("customers.id", "DESC")
            .getRawMany();

          const result = customers.map((v) => {
            if (current_user.indexOf(v.line_liff_id) > -1) {
              return { ...v, status: statusAvailable };
            } else {
              return { ...v, status: statusUnAvailable };
            }
          });

          const updatedCustomer = await customerRepository.save(result);

          return;
        } catch (err: any) {
          return responseErrors(
            res,
            400,
            "Can't update your Customer",
            err.message
          );
        }

        break;

      default:
        break;
    }
  }

  res.status(200).json({ url: resFromGoogle });
};

async function urlToImageFile(url: any, filePath: any) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  fs.writeFileSync(filePath, response.data);
}
