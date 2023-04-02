require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import config from "config";
import morgan from "morgan";
import cors from "cors";
import { AppDataSource } from "./utils/data-source";

import bookingRouter from "./routes/booking.routes";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import customerRouter from "./routes/customer.routes";
// import lessionRouter from "./routes/booking.routes";

import validateEnv from "./utils/validateEnv";
import { User } from "./entities/user.entity";
import { responseErrors } from "./utils/common";

AppDataSource.initialize()
  .then(async () => {
    // VALIDATE ENV
    validateEnv();

    const app = express();

    // 1. Body parser
    app.use(express.json({ limit: "10mb" }));

    // 2. Logger
    if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

    // 3. Cors
    app.use(
      cors({
        origin: "*",
        credentials: false,
      })
    );

    // 5. Create super admin
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.find();

    if (user.length === 0) {
      console.log("Inserting a new super admin into the database...");
      const user = new User();
      user.email = process.env.SUPER_ADMIN_EMAIL ?? "";
      user.password = process.env.SUPER_ADMIN_PASSWORD ?? "";
      user.name = "super admin";
      user.remark = "this is super admin for development";
      user.tel = "-";
      user.role = "super_admin";

      await AppDataSource.manager.save(user);
      console.log("Init Super admin");
    }

    // ROUTES;
    app.use("/api/bookings", bookingRouter);
    app.use("/api/customers", customerRouter);
    app.use("/api/users", userRouter);
    app.use("/api/auth", authRouter);

    // HEALTH CHECKER
    app.get("/api/healthChecker", async (_, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "Welcome to com edu reunion, we are happy to see you",
      });
    });

    // UNHANDLED ROUTE
    app.all("*", (req: Request, res: Response, next: NextFunction) => {
      return responseErrors(res, 400, `Route ${req.originalUrl} not found`);
    });

    const port = config.get<number>("port");
    app.listen(port);
    console.log(
      `\n⚡️[server]: Server is running at https://localhost:${port}\n`
    );
  })
  .catch((error: any) => console.log(error));
