import axios from "axios";
import { Request, Response } from "express";
import { enterMessage } from "./line_api_display";

export const devioController = (req: Request, res: Response) => {
  console.log("==============");
  console.log(req.body);
  console.log(req.body.events[0].beacon);
  const event = req.body.events[0].beacon.type;
  const replyToken = req.body.events[0].replyToken;

  if (event === "enter") {
    const headers = {
      Authorization: "Bearer " + process.env.LINE_ACCESS_TOKEN,
      "Content-Type": "application/json",
    };

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
  } else {
    console.log();
  }
  console.log("=============");
};

// export  async function beaconEventHandler(event: ): Promise<MessageAPIResponseBase | undefined> {
//         if (
//             event.type !== 'beacon' ||
//             !event.source.userId
//         ) {
//             return;
//         }
//         const { replyToken } = event;
//         // get profile
//         const profile = await this.client.getProfile(event.source?.userId)
//         // save to db
//         await this.db.createUser({
//             displayName: profile.displayName,
//             statusMessage: profile.statusMessage,
//             userId: profile.userId,
//             pictureUrl: profile.pictureUrl,
//             allowNotification: false
//         })
//         // reply
//         const response: TextMessage = {
//             type: 'text',
//             text: `ยินดีต้อนรับคุณ ${profile.displayName} คลิ๊กเมนู Connect! ด้านล่าง แล้วไปสนุกกันเล้ย`,
//         };
//         await this.client.replyMessage(replyToken, response);
//         // show activity richmenu
//         await this.client.linkRichMenuToUser(profile.userId, process.env.RICHMENU_ID || '')
//         return;
//     };
