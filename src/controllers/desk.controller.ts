import { Request, Response } from "express";
import { Desks } from "../entities/desk.entity";

import { AppDataSource } from "../utils/data-source";
import { responseErrors } from "../utils/common";
import { Chairs } from "../entities/chair.entity";

const deskRepository = AppDataSource.getRepository(Desks);
const chairRepository = AppDataSource.getRepository(Chairs);

export const createDeskHandler = async (req: Request, res: Response) => {
  try {
    // const userId = req.user.id;
    const input = req.body;

    let new_desk = {
      active: input.active,
      label: input.label,
      status: input.status,
    } as Desks;

    const desks = await deskRepository.save(new_desk);

    let chairs;

    let input_chairs: any = input.chairs;
    let new_chairs: Chairs[] = [];

    for (var i of input_chairs) {
      let chairTemp = {
        label: i.label,
        status: i.status,
        price: i.price,
        desk: {
          id: desks.id,
        } as Desks,
      } as Chairs;

      new_chairs.push(chairTemp);
    }

    chairs = await chairRepository.save(new_chairs);

    desks!.chairs = chairs as Chairs[];

    try {
      res.status(200).json({
        status: "create success",
        id: desks.id,
        message: "Desk has been created",
        data: desks,
      });
    } catch (err: any) {
      return responseErrors(
        res,
        500,
        "There was an error to create, please try again",
        err.message
      );
    }
  } catch (err: any) {
    if (err.code === "23505") {
      return responseErrors(
        res,
        409,
        "Desk with that id already exist",
        err.message
      );
    }
    return responseErrors(res, 400, "Can't create desk", err.message);
  }
};

export const getAllDesksHandler = async (req: Request, res: Response) => {
  try {
    const desks = await deskRepository
      .createQueryBuilder("desks")
      .select([
        "desks.id AS id",
        "desks.created_at AS created_at",
        "desks.updated_at AS updated_at",
        "desks.deleted_at AS deleted_at",
        "desks.active AS active",
        "desks.label AS label",
        "desks.status AS status",
      ])
      .getRawMany();

    res.status(200).json({
      status: "success",
      results: desks.length,
      data: desks,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get all desk", err.message);
  }
};

export const getDeskHandler = async (req: Request, res: Response) => {
  try {
    const Desk = await deskRepository.findOneBy({
      id: req.params.id as any,
      active: true,
    });

    if (!Desk) {
      return responseErrors(res, 400, "Desks not found", "cannot find desk");
    }

    const chairs = await chairRepository
      .createQueryBuilder("chairs")
      .where("desk_id = :desk_id", {
        desk_id: Desk?.id,
      })
      .getMany();

    Desk!.chairs = chairs;

    res.status(200).json({
      status: "success",
      data: Desk,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't get single desk", err.message);
  }
};

export const updateDeskHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    const desk = await deskRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!desk) {
      return responseErrors(res, 400, "Desks not found", "cannot find desk");
    }

    desk.active = input.active;
    desk.label = input.label;
    desk.status = input.status;

    const updatedDesk = await deskRepository.save(desk);

    res.status(200).json({
      status: "update success",
      data: updatedDesk,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't update your Desk", err.message);
  }
};

export const deleteDeskHandler = async (req: Request, res: Response) => {
  try {
    const desk = await deskRepository.findOneBy({
      id: req.params.id as any,
    });

    if (!desk) {
      return responseErrors(res, 400, "Desks not found", "cannot find desk");
    }

    await deskRepository.delete(desk.id); //FIXME

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err: any) {
    return responseErrors(res, 400, "Can't delete your Desk", err.message);
  }
};

// import { Request, Response } from "express";

// import { Desk } from "../entities/desk.entity";
// import { Desk } from "../entities/Desk.entity";
// import { AppDataSource } from "../utils/data-source";
// import { OurFile } from "../entities/upload.entity";

// import { PretestResult } from "../entities/pretest-result.entity";
// import { DeleteFileInFolder, DeleteOurFiles } from "../utils/delete-files";
// import { responseErrors, shuffle } from "../utils/common";

// /* Getting the lession repository from the database. */
// const lessionRepository = AppDataSource.getRepository(Desk);
// /* Getting the pretest repository from the database. */
// const pretestRepository = AppDataSource.getRepository(Desk);
// /* Getting the repository for the OurFile class. */
// const fileUploadedRepository = AppDataSource.getRepository(OurFile);
// /* Getting the lession repository from the database. */
// const pretestResultRepository = AppDataSource.getRepository(PretestResult);

// export const createLessionHandler = async (req: Request, res: Response) => {
//   try {
//     const input = req.body;

//     let new_lession = {
//       title: input.title,
//       subtitle: input.subtitle,
//       content: input.content,
//       have_pretest: input.have_pretest,
//       have_content: input.have_content,
//       have_posttest: input.have_posttest,
//       have_result: input.have_result,
//       is_random: input.is_random,
//       order: input.order,
//       files_url_1: input.files_url_1,
//       files_url_2: input.files_url_2,
//       files_url_3: input.files_url_3,
//       video_url: input.video_url,
//       photo_url: input.photo_url,
//       thumbnail_url: input.thumbnail_url,
//       is_video_from: input.is_video_from,
//     } as Desk;

//     const lession = await lessionRepository.save(new_lession);

//     let pretest;
//     if (input.have_pretest) {
//       let input_pretest: any = input.pretests;
//       let new_pretest: Desk[] = [];

//       for (var i of input_pretest) {
//         let pret = {
//           question: i.question,
//           answer_1: i.answer_1,
//           answer_2: i.answer_2,
//           answer_3: i.answer_3,
//           answer_4: i.answer_4,
//           correct_answer: i.correct_answer,
//           lession: {
//             id: lession.id,
//           } as Desk,
//         } as Desk;

//         new_pretest.push(pret);
//       }
//       pretest = await pretestRepository.save(new_pretest);
//     }

//     lession!.Desk = pretest as Desk[];

//     res.status(200).json({
//       status: "success",
//       id: lession.id,
//       data: {
//         lession,
//       },
//     });
//   } catch (err: any) {
//     if (err.code === "23505") {
//       return res.status(409).json({
//         status: "fail",
//         message: "lession with that title already exist",
//       });
//     }
//     return responseErrors(res, 400, "Can't create lession data");
//   }
// };

// export const getAllLessionsHandler = async (req: Request, res: Response) => {
//   try {
//     const lessions = await lessionRepository
//       .createQueryBuilder("lession")
//       .where("active IS TRUE")
//       .orderBy("lession.order", "ASC")
//       .getMany();

//     res.status(200).json({
//       status: "success",
//       results: lessions.length,
//       data: lessions,
//     });
//   } catch (err: any) {
//     return responseErrors(res, 400, err.message);
//   }
// };

// export const getLessionHandler = async (req: Request, res: Response) => {
//   try {
//     const lessionData = await lessionRepository.findOneBy({
//       id: req.params.postId as any,
//       active: true,
//     });

//     if (!lessionData) {
//       return responseErrors(res, 400, "Lession not found");
//     }

//     const pretest = await pretestRepository
//       .createQueryBuilder("pretest")
//       .where("lession_id = :lession_id", {
//         lession_id: lessionData?.id,
//       })
//       .getMany();

//     lessionData!.Desk = pretest;

//     if (lessionData!.is_random) {
//       shuffle(lessionData!.Desk);
//     }

//     const userId = req.user.id;
//     let resultTest = {
//       is_test_pretest: false,
//       is_test_posttest: false,
//     };

//     const pretestResult = await pretestResultRepository
//       .createQueryBuilder("pretest_result")
//       .leftJoinAndSelect("pretest_result.pretest", "pretest")
//       .leftJoin("pretest.lession", "lession")
//       .where("lession.id = :id", { id: lessionData?.id })
//       .andWhere("pretest_result.user_id = :userId", { userId: userId })
//       .getMany();

//     if (pretestResult.length > 0) {
//       resultTest.is_test_pretest = true;
//     }

//     let files1;
//     if (lessionData.files_url_1) {
//       const uploadedData = await fileUploadedRepository.findOneBy({
//         url: lessionData.files_url_1,
//       });

//       files1 = {
//         label: uploadedData?.label,
//         type: uploadedData?.type,
//         url: uploadedData?.url,
//       };
//     }

//     let files2;
//     if (lessionData.files_url_2) {
//       const uploadedData = await fileUploadedRepository.findOneBy({
//         url: lessionData.files_url_2,
//       });

//       files2 = {
//         label: uploadedData?.label,
//         type: uploadedData?.type,
//         url: uploadedData?.url,
//       };
//     }

//     let files3;
//     if (lessionData.files_url_3) {
//       const uploadedData = await fileUploadedRepository.findOneBy({
//         url: lessionData.files_url_3,
//       });

//       files3 = {
//         label: uploadedData?.label,
//         type: uploadedData?.type,
//         url: uploadedData?.url,
//       };
//     }

//     const lession = {
//       id: lessionData.id,
//       created_at: lessionData.created_at,
//       updated_at: lessionData.updated_at,
//       active: lessionData.active,
//       title: lessionData.title,
//       subtitle: lessionData.subtitle,
//       content: lessionData.content,
//       have_pretest: lessionData.have_pretest,
//       have_content: lessionData.have_content,
//       have_posttest: lessionData.have_posttest,
//       have_result: lessionData.have_result,
//       is_random: lessionData.is_random,
//       photo_url: lessionData.photo_url,
//       thumbnail_url: lessionData.thumbnail_url,
//       video_url: lessionData.video_url,
//       is_video_from: lessionData.is_video_from,
//       files_url_1: files1,
//       files_url_2: files2,
//       files_url_3: files3,
//       pretests: lessionData.Desk,
//     };

//     res.status(200).json({
//       status: "success",
//       id: lessionData.id,
//       data: {
//         lession,
//         result_test: resultTest,
//       },
//     });
//   } catch (err: any) {
//     return responseErrors(res, 400, err);
//   }
// };

// export const updateLessionHandler = async (req: Request, res: Response) => {
//   const input = req.body;

//   const lessionData = await lessionRepository
//     .createQueryBuilder("lession")
//     .where("id = :id", { id: req.params.postId })
//     .getOne();

//   if (!lessionData) {
//     return responseErrors(res, 500, "can't found lession");
//   }

//   try {
//     if (input.photo_url) {
//       const del = await DeleteFileInFolder(
//         lessionData.photo_url,
//         input.photo_url,
//         "images"
//       );
//       lessionData.photo_url = input.photo_url;
//     }

//     if (input.thumbnail_url) {
//       const del = await DeleteFileInFolder(
//         lessionData.thumbnail_url,
//         input.thumbnail_url,
//         "images"
//       );
//       lessionData.thumbnail_url = input.thumbnail_url;
//     }

//     if (input.video_url) {
//       const del = await DeleteFileInFolder(
//         lessionData.video_url,
//         input.video_url,
//         "videos"
//       );
//       lessionData.video_url = input.video_url;
//     }

//     if (input.files_url_1) {
//       const del = await DeleteFileInFolder(
//         lessionData.files_url_1,
//         input.files_url_1,
//         "files"
//       );
//       lessionData.files_url_1 = input.files_url_1;
//     }

//     if (input.files_url_2) {
//       const del = await DeleteFileInFolder(
//         lessionData.files_url_2,
//         input.files_url_2,
//         "files"
//       );
//       lessionData.files_url_2 = input.files_url_2;
//     }

//     if (input.files_url_3) {
//       const del = await DeleteFileInFolder(
//         lessionData.files_url_3,
//         input.files_url_3,
//         "files"
//       );
//       lessionData.files_url_3 = input.files_url_3;
//     }

//     const em = lessionRepository.manager.transaction(async (manager) => {
//       lessionData.title = input.title;
//       lessionData.subtitle = input.subtitle;
//       lessionData.content = input.content;
//       lessionData.have_pretest = input.have_pretest;
//       lessionData.have_content = input.have_content;
//       lessionData.have_posttest = input.have_posttest;
//       lessionData.have_result = input.have_result;
//       lessionData.is_random = input.is_random;
//       lessionData.is_video_from = input.is_video_from;
//       lessionData.order = input.order;

//       const lession = await manager.save(Desk, lessionData!);

//       if (input.have_pretest) {
//         const pretest = await updatePretest(req.params.postId, input.pretests);
//       }
//     });

//     res.status(200).json({
//       status: "success",
//       data: {
//         lession: lessionData,
//       },
//     });
//   } catch (err: any) {
//     return responseErrors(res, 400, err.message);
//   }
// };

// export const updatePretest = async (lssId: any, inPretest: any) => {
//   let newPretest: Desk[] = [];

//   const pretests = await pretestRepository
//     .createQueryBuilder("pretest")
//     .where("lession_id = :lession_id", {
//       lession_id: lssId,
//     })
//     .getMany();

//   for (let p1 of pretests) {
//     for (let p2 of inPretest) {
//       if (p1.id === p2.id) {
//         p1.question = p2.question;
//         p1.answer_1 = p2.answer_1;
//         p1.answer_2 = p2.answer_2;
//         p1.answer_3 = p2.answer_3;
//         p1.answer_4 = p2.answer_4;
//         p1.correct_answer = p2.correct_answer;

//         newPretest.push(p1);
//       }
//     }
//   }
//   await pretestRepository.save(newPretest);
// };

// export const deleteLessionHandler = async (req: Request, res: Response) => {
//   try {
//     const lession = await lessionRepository.findOneBy({
//       id: req.params.postId as any,
//     });

//     if (!lession) {
//       return responseErrors(res, 400, "Can't found lession");
//     }

//     if (lession.photo_url) {
//       const deletedImage = await DeleteOurFiles(lession.photo_url, "images");
//       lession.photo_url = "";
//     }

//     if (lession.thumbnail_url) {
//       const deletedThumbnail = await DeleteOurFiles(
//         lession.thumbnail_url,
//         "images"
//       );
//       lession.thumbnail_url = "";
//     }

//     if (lession.video_url) {
//       const deletedVideo = await DeleteOurFiles(lession.video_url, "videos");
//       lession.video_url = "";
//     }

//     if (lession.files_url_1) {
//       const deletedVideo = await DeleteOurFiles(lession.files_url_1, "files");
//       lession.files_url_1 = "";
//     }

//     if (lession.files_url_2) {
//       const deletedVideo = await DeleteOurFiles(lession.files_url_2, "files");
//       lession.files_url_2 = "";
//     }

//     if (lession.files_url_3) {
//       const deletedVideo = await DeleteOurFiles(lession.files_url_3, "files");
//       lession.files_url_3 = "";
//     }

//     // //FIXME full delete pretest
//     // const delPretest = await pretestRepository
//     //   .createQueryBuilder()
//     //   .delete()
//     //   .from(Pretest)
//     //   .where("lession_id = :lssId ", {
//     //     lssId: req.params.postId,
//     //   })
//     //   .execute();

//     // //FIXME full delete posttest
//     // const delPosttest = await posttestRepository
//     //   .createQueryBuilder()
//     //   .delete()
//     //   .from(Posttest)
//     //   .where("lession_id = :lssId ", {
//     //     lssId: req.params.postId,
//     //   })
//     //   .execute();

//     lession.active = false;

//     await lession.save();

//     res.status(200).json({
//       status: "success",
//       data: null,
//     });
//   } catch (err: any) {
//     return responseErrors(res, 400, err);
//   }
// };
