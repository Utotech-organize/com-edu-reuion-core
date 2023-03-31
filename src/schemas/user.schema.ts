// import { object, string, TypeOf, z } from "zod";

// export const createUserSchema: any = object({
//   body: object({
//     name: string({
//       required_error: "Name is required",
//     }),
//     email: string({
//       required_error: "Email address is required",
//     }).email("Invalid email address"),
//     password: string({
//       required_error: "Password is required",
//     })
//       .min(8, "Password must be more than 8 characters")
//       .max(32, "Password must be less than 32 characters"),
//     password_confirm: string({
//       required_error: "Please confirm your password",
//     }),
//     role: string({
//       required_error: "Role is null",
//     }),
//   }).refine((data) => data.password === data.password_confirm, {
//     path: ["password_confirm"],
//     message: "Passwords do not match",
//   }),
// });

// export const loginUserSchema = object({
//   body: object({
//     email: string({
//       required_error: "Email address is required",
//     }).email("Invalid email address"),
//     password: string({
//       required_error: "Password is required",
//     }).min(8, "Invalid email or password"),
//   }),
// });

// // export const verifyEmailSchema = object({
// //   params: object({
// //     verificationCode: string(),
// //   }),
// // });

// export type CreateUserInput = Omit<
//   TypeOf<typeof createUserSchema>["body"],
//   "password_confirm"
// >;

// export type LoginUserInput = TypeOf<typeof loginUserSchema>["body"];
// // export type VerifyEmailInput = TypeOf<typeof verifyEmailSchema>["params"];
