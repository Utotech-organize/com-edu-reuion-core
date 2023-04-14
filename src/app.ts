require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import config from "config";
import morgan from "morgan";
import cors from "cors";
import { AppDataSource } from "./utils/data-source";

import authRouter from "./routes/auth.routes";
import bookingRouter from "./routes/booking.routes";
import deskRouter from "./routes/desk.routes";
import chairRouter from "./routes/chair.routes";
import userRouter from "./routes/user.routes";
import customerRouter from "./routes/customer.routes";
import uploadRouter from "./routes/upload.routes";

import validateEnv from "./utils/validateEnv";
import { Users } from "./entities/user.entity";
import { responseErrors, uploadFilter } from "./utils/common";
import { initDeskAndChairs } from "./utils/mock-default-data";
import { Desks } from "./entities/desk.entity";

const deskRepository = AppDataSource.getRepository(Desks);

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
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
      })
    );

    // 5. Create super admin
    const userRepository = AppDataSource.getRepository(Users);
    const user = await userRepository.find();

    if (user.length === 0) {
      console.log("Inserting a new super admin into the database...");
      const user = new Users();
      user.email = (process.env.SUPER_ADMIN_EMAIL as string) ?? "";
      user.password = (process.env.SUPER_ADMIN_PASSWORD as string) ?? "";
      user.first_name = "super";
      user.last_name = "admin";
      user.remark = "this is super admin for development";
      user.tel = "-";
      user.role = "super_admin";
      user.image_url =
        "https://drive.google.com/uc?export=view&id=1X397QtEgZ76TDYBZKaIBce0xKRnnkHD9";

      await userRepository.save(user);

      console.log("Init Super admin");
    }

    // ROUTES;
    app.use("/api/bookings", bookingRouter);
    app.use("/api/desks", deskRouter);
    app.use("/api/chairs", chairRouter);
    app.use("/api/customers", customerRouter);
    app.use("/api/users", userRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/upload", uploadRouter);

    // set up mock updata
    const desks = await deskRepository.createQueryBuilder("desks").getMany();

    if (desks.length === 0) {
      initDeskAndChairs();
    }

    // HEALTH CHECKER
    app.get("/api/healthChecker", async (_, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "Welcome to com edu reunion, we are happy to see you",
      });
    });

    // UNHANDLED ROUTE
    app.all("*", (req: Request, res: Response, next: NextFunction) => {
      return responseErrors(
        res,
        404,
        "error route not found",
        `Route ${req.originalUrl} not found`
      );
    });

    const port = config.get<number>("port");
    app.listen(port);
    console.log(
      `\n⚡️[server]: Server is running at https://localhost:${port}\n`
    );
  })
  .catch((error: any) => console.log(error));
