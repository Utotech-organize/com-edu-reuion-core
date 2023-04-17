import { Request, Response } from "express";
import { responseErrors } from "../utils/common";
import { AppDataSource } from "../utils/data-source";
import { Settings } from "../entities/setting.entity";

const settingRepository = AppDataSource.getRepository(Settings);
const selectsettingColumn = [
  "settings.id AS id",
  "settings.created_at AS created_at",
  "settings.updated_at AS updated_at",
  "settings.deleted_at AS deleted_at",
  "settings.bank AS bank",
  "settings.bank_account_name AS bank_account_name",
  "settings.bank_account_no AS bank_account_no",
  "settings.bank_qr_code AS bank_qr_code",
];

export const getSettingHandler = async (req: Request, res: Response) => {
  try {
    const setting = await settingRepository
      .createQueryBuilder("settings")
      .select(selectsettingColumn)
      .where("settings.id = :id", { id: 1 })
      .getRawOne();

    if (!setting) {
      return responseErrors(
        res,
        400,
        "setting not found",
        "cannot find setting"
      );
    }

    res.status(200).json({
      status: "success",
      data: setting,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single setting", err.message);
  }
};

export const updateSettingHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const setting = await settingRepository.findOneBy({ id: 1 });

    if (!setting || setting.id == 1) {
      return responseErrors(
        res,
        400,
        "setting not found",
        "cannot find setting"
      );
    }

    setting.bank = input.bank;
    setting.bank_account_name = input.bank_account_name;
    setting.bank_account_no = input.bank_account_no;
    setting.bank_qr_code = input.bank_qr_code;

    const updatedsettings = await settingRepository.save(setting);

    res.status(200).json({
      status: "success",
      data: updatedsettings,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your setting", err.message);
  }
};

export const createDefaultSettings = async () => {
  try {
    const setting = new Settings();

    setting.bank = "ธนาคารกรุงเทพ";
    setting.bank_account_name = "น.ส. ภัทราวดี ชาตะ";
    setting.bank_account_no = "870-7-120260";
    setting.bank_qr_code =
      "https://drive.google.com/uc?export=view&id=1-GkSfbMKPEIEEXL6RSi41CmCj7xJ9zXi";

    await settingRepository.save(setting);

    console.log("Inserting a defalut settings into the database...");

    return;
  } catch (err: any) {
    throw new Error(err.message);
  }
};
