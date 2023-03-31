// import { object, string, TypeOf } from "zod";

// export const createLessionSchema = object({
//   body: object({
//     title: string({
//       required_error: "Title is required",
//     }),
//     content: string({
//       required_error: "Content is required",
//     }),
//     // image: string({
//     //   required_error: 'Image is required',
//     // }),
//   }),
// });

// const params = {
//   params: object({
//     postId: string(),
//   }),
// };

// export const getLessionSchema = object({
//   ...params,
// });

// export const updateLessionSchema = object({
//   ...params,
//   body: object({
//     title: string(),
//     content: string(),
//     // image: string(),
//   }).partial(),
// });

// export const deleteLessionSchema = object({
//   ...params,
// });

// export type CreateLessionInput = TypeOf<typeof createLessionSchema>["body"];
// export type GetLessionInput = TypeOf<typeof getLessionSchema>["params"];
// export type UpdateLessionInput = TypeOf<typeof updateLessionSchema>;
// export type DeleteLessionInput = TypeOf<typeof deleteLessionSchema>["params"];
