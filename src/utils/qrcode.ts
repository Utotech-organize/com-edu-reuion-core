import QRCode from "qrcode";

export const qrcodeGenerator = async (params: any) => {
  try {
    return await QRCode.toDataURL(params);
  } catch (err) {
    console.error(err);
    return;
  }
};
