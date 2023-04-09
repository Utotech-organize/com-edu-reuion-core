import QRCode from "qrcode";

export const qrcodeGenerator = async (params: any) => {
  try {
    return await QRCode.toDataURL("comedureunion:" + params);
  } catch (err) {
    return err;
  }
};
