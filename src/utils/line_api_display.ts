export const flexRegister = (
  liffID: any,
  desk_label: any,
  chair_label: any,
  qr_image: any
) => {
  let flexMessageBody = `{
    "to": "${liffID}",
    "messages": [
        {
            "type": "text",
            "text": "นี่คือข้อมูล ที่นั่งของพี่ๆนะฮัฟ หากข้อมูลไม่ตรง กดที่ติดต่อเราได้เลยเพื่อแจ้ง admin นะฮัฟ"
        },
        {
            "type": "flex",
            "altText": "E-Ticket Comedu-Reunion",
            "contents": {
                "type": "bubble",
                "hero": {
                    "type": "image",
                    "url": "https://media.discordapp.net/attachments/1086720620491964416/1097791381465989140/311658023_545422350922505_7010403205822614107_n.jpg?width=1980&height=1980",
                    "align": "center",
                    "gravity": "bottom",
                    "size": "full",
                    "aspectRatio": "20:13",
                    "aspectMode": "fit"
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": "บัตรเข้าร่วมงาน E-Ticket",
                            "weight": "bold",
                            "size": "xl",
                            "align": "center",
                            "gravity": "center",
                            "wrap": true,
                            "contents": []
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": "sm",
                            "margin": "lg",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "วันที่",
                                            "size": "sm",
                                            "color": "#AAAAAA",
                                            "flex": 1,
                                            "contents": []
                                        },
                                        {
                                            "type": "text",
                                            "text": "22 เมษายน 2566",
                                            "size": "sm",
                                            "color": "#666666",
                                            "flex": 4,
                                            "wrap": true,
                                            "contents": []
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "สถานที่",
                                            "size": "sm",
                                            "color": "#AAAAAA",
                                            "flex": 1,
                                            "contents": []
                                        },
                                        {
                                            "type": "text",
                                            "text": "ชั้น 8 อาคาร 44 คณะครุศาสตร์ อุตสาหกรรม",
                                            "size": "sm",
                                            "color": "#666666",
                                            "flex": 4,
                                            "wrap": true,
                                            "contents": []
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "โต๊ะ",
                                            "size": "sm",
                                            "color": "#AAAAAA",
                                            "flex": 1,
                                            "contents": []
                                        },
                                        {
                                            "type": "text",
                                            "text": "${desk_label}",
                                            "size": "sm",
                                            "color": "#666666",
                                            "flex": 4,
                                            "wrap": true,
                                            "contents": []
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "เก้าอี้",
                                            "size": "sm",
                                            "color": "#AAAAAA",
                                            "flex": 1,
                                            "contents": []
                                        },
                                        {
                                            "type": "text",
                                            "text": "${chair_label}",
                                            "size": "sm",
                                            "color": "#666666",
                                            "flex": 4,
                                            "wrap": true,
                                            "contents": []
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "xxl",
                            "contents": [
                                {
                                    "type": "spacer"
                                },
                                {
                                    "type": "image",
                                    "url": "${qr_image}",
                                    "size": "4xl",
                                    "aspectMode": "cover"
                                },
                                {
                                    "type": "text",
                                    "text": "สามารถยื่น QR code นี้ที่หน้างานได้เลยนะฮัฟ",
                                    "size": "xs",
                                    "color": "#AAAAAA",
                                    "margin": "xxl",
                                    "wrap": true,
                                    "contents": []
                                }
                            ]
                        }
                    ]
                }
            }
        }
    ]
}`;

  return flexMessageBody;
};

export const enterMessage = (replyToken: any) => {
  let message = `{
    "replyToken": "${replyToken}",
    "messages":[
        {
            "type":"text",
            "text":"ใกล้ถึงแล้ว ตอนนี้งานคืนสู่เหย้าอยู่ที่อาคาร 44 ชั้น 8 สามารถขึ้นลิฟท์มาได้เลยครับ อย่าลืมเปิด QR Code ให้น้อง ๆ ทีมต้อนรับหน้างานด้วยคร๊าบ"
        }
    ]
}`;

  return message;
};

export const snapshotMessage = (replyToken: any, image: any) => {
  let message = `{
    "replyToken": "${replyToken}",
    "messages":[
         {
            "type":"text",
            "text":"เย่ ตอนนี้ท่านอยู่ในงานแล้ว เชิญพี่ ๆ ไปนั่งที่โต๊ะได้เลยครับ รีบบอกเพื่อน ๆ ให้ตามมาเร็ว!"
        },
       {
        "type": "image",
        "originalContentUrl": "${image}",
        "previewImageUrl": "${image}"
       }
    ]
}`;

  return message;
};
