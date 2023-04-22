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
import productRouter from "./routes/product.routes";
import orderRouter from "./routes/order.routes";
import settingRouter from "./routes/setting.routes";

import validateEnv from "./utils/validateEnv";
import { Users } from "./entities/user.entity";
import { responseErrors } from "./utils/common";
import { initDeskAndChairs } from "./utils/mock-default-data";
import { Desks } from "./entities/desk.entity";
import { createDefaultUser } from "./controllers/user.controller";
import { createDefaultSettings } from "./controllers/setting.controller";
import { devioController } from "./utils/line_api_devio";

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
        credentials: true,
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
      })
    );

    // 5. Create super admin
    const userRepository = AppDataSource.getRepository(Users);
    const user = await userRepository.find();

    if (user.length === 0) {
      createDefaultUser(); //FIXME to dynamic function
      createDefaultSettings();
    }

    // ROUTES;
    app.use("/api/bookings", bookingRouter);
    app.use("/api/desks", deskRouter);
    app.use("/api/chairs", chairRouter);
    app.use("/api/customers", customerRouter);
    app.use("/api/users", userRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/upload", uploadRouter);
    app.use("/api/products", productRouter);
    app.use("/api/orders", orderRouter);
    app.use("/api/settings", settingRouter);

    // set up mock updata
    const desks = await deskRepository.createQueryBuilder("desks").getMany();

    if (desks.length === 0) {
      initDeskAndChairs();
    }

    // get web hook from devio
    app.post("/api/webhook", (req, res) => {
      devioController(req, res); // Call your action on the request here
      res.status(200).end(); // Responding is important
    });

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
